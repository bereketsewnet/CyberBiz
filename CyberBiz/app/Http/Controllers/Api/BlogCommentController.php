<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BlogCommentResource;
use App\Models\Blog;
use App\Models\BlogComment;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class BlogCommentController extends Controller
{
    /**
     * Get comments for a blog post
     */
    public function index(Request $request, string $blogId): JsonResponse
    {
        $blog = Blog::findOrFail($blogId);
        
        // Only show comments for published blogs (unless admin)
        $user = $request->user();
        
        // Check if blog is published (status = published and (published_at is null or published_at <= now))
        $isPublished = $blog->status === 'published' && 
                      ($blog->published_at === null || $blog->published_at <= now());
        
        if ((!$user || !$user->isAdmin()) && !$isPublished) {
            return response()->json(['message' => 'Blog not found'], 404);
        }

        // Get top-level comments (no parent) with their replies
        $comments = BlogComment::where('blog_id', $blogId)
            ->whereNull('parent_id')
            ->with(['user', 'replies.user', 'replies.replies.user'])
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => BlogCommentResource::collection($comments),
        ]);
    }

    /**
     * Store a new comment
     */
    public function store(Request $request, string $blogId): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $blog = Blog::findOrFail($blogId);
        
        // Only allow comments on published blogs (unless admin)
        // Check if blog is published (status = published and (published_at is null or published_at <= now))
        $isPublished = $blog->status === 'published' && 
                      ($blog->published_at === null || $blog->published_at <= now());
        
        if ((!$user->isAdmin()) && !$isPublished) {
            return response()->json(['message' => 'Cannot comment on unpublished blog'], 403);
        }

        $validator = Validator::make($request->all(), [
            'content' => 'required|string|min:1|max:5000',
            'parent_id' => 'nullable|exists:blog_comments,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();
        $depth = 0;

        // If replying to a comment, calculate depth
        if (!empty($data['parent_id'])) {
            $parent = BlogComment::findOrFail($data['parent_id']);
            
            // Check if parent belongs to the same blog
            if ($parent->blog_id != $blogId) {
                return response()->json(['message' => 'Invalid parent comment'], 422);
            }

            // Check depth limit
            if (!$parent->canHaveReplies()) {
                return response()->json(['message' => 'Maximum reply depth reached'], 422);
            }

            $depth = $parent->depth + 1;
        }

        $comment = BlogComment::create([
            'blog_id' => $blogId,
            'user_id' => $user->id,
            'parent_id' => $data['parent_id'] ?? null,
            'content' => $data['content'],
            'depth' => $depth,
        ]);

        $comment->load(['user', 'parent']);

        return response()->json([
            'message' => 'Comment added successfully',
            'data' => new BlogCommentResource($comment),
        ], 201);
    }

    /**
     * Update a comment (only by owner)
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $comment = BlogComment::findOrFail($id);

        // Only owner can update
        if ($comment->user_id !== $user->id && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'content' => 'required|string|min:1|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $comment->update($validator->validated());
        $comment->load(['user', 'parent']);

        return response()->json([
            'message' => 'Comment updated successfully',
            'data' => new BlogCommentResource($comment),
        ]);
    }

    /**
     * Delete a comment (only by owner or admin)
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $comment = BlogComment::findOrFail($id);

        // Only owner or admin can delete
        if ($comment->user_id !== $user->id && !$user->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $comment->delete();

        return response()->json([
            'message' => 'Comment deleted successfully',
        ]);
    }
}
