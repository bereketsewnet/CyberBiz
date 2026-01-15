<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\BlogResource;
use App\Models\Blog;
use App\Models\BlogCategory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;

class BlogController extends Controller
{
    /**
     * Display a listing of blogs (public - only published)
     */
    public function index(Request $request): JsonResponse
    {
        $query = Blog::with(['category', 'author']);

        // Public users only see published blogs
        $user = $request->user();
        
        // Check if user is authenticated and is admin
        if ($user && $user->isAdmin()) {
            // Admin sees all blogs (drafts and published) unless status filter is provided
            if ($request->has('status') && $request->status) {
                $query->where('status', $request->status);
            }
            // If no status filter, show all (drafts and published)
        } else {
            // Public users or non-admin users only see published blogs
            // Show blogs with status 'published' and either:
            // - published_at is null (published without date, use created_at as fallback)
            // - published_at is set and in the past
            $query->where('status', 'published')
                  ->where(function ($q) {
                      $q->whereNull('published_at')
                        ->orWhere('published_at', '<=', now());
                  });
        }

        // Filter by category
        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // Search
        if ($request->has('q') && $request->q) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'LIKE', '%' . $request->q . '%')
                  ->orWhere('content', 'LIKE', '%' . $request->q . '%')
                  ->orWhere('excerpt', 'LIKE', '%' . $request->q . '%');
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 12);
        // Order by: drafts first (null published_at), then by published_at desc for published posts
        $blogs = $query->orderByRaw('CASE WHEN published_at IS NULL THEN 0 ELSE 1 END')
                      ->orderBy('published_at', 'desc')
                      ->orderBy('created_at', 'desc')
                      ->paginate($perPage);

        return response()->json([
            'data' => BlogResource::collection($blogs->items()),
            'meta' => [
                'current_page' => $blogs->currentPage(),
                'last_page' => $blogs->lastPage(),
                'per_page' => $blogs->perPage(),
                'total' => $blogs->total(),
            ],
        ]);
    }

    /**
     * Display a listing of blogs for admin (shows all blogs including drafts)
     */
    public function adminIndex(Request $request): JsonResponse
    {
        // Require authentication and admin role
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = Blog::with(['category', 'author']);

        // Admin can filter by status if provided
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }
        // Otherwise, show all blogs (drafts and published)

        // Filter by category
        if ($request->has('category_id') && $request->category_id) {
            $query->where('category_id', $request->category_id);
        }

        // Search
        if ($request->has('q') && $request->q) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'LIKE', '%' . $request->q . '%')
                  ->orWhere('content', 'LIKE', '%' . $request->q . '%')
                  ->orWhere('excerpt', 'LIKE', '%' . $request->q . '%');
            });
        }

        // Pagination
        $perPage = $request->get('per_page', 12);
        // Order by: drafts first (null published_at), then by published_at desc for published posts
        $blogs = $query->orderByRaw('CASE WHEN published_at IS NULL THEN 0 ELSE 1 END')
                      ->orderBy('published_at', 'desc')
                      ->orderBy('created_at', 'desc')
                      ->paginate($perPage);

        return response()->json([
            'data' => BlogResource::collection($blogs->items()),
            'meta' => [
                'current_page' => $blogs->currentPage(),
                'last_page' => $blogs->lastPage(),
                'per_page' => $blogs->perPage(),
                'total' => $blogs->total(),
            ],
        ]);
    }

    /**
     * Store a newly created blog (admin only)
     */
    public function store(Request $request): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blogs,slug',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:500',
            'featured_image_url' => 'nullable|string|max:1000',
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'category_id' => 'nullable|exists:blog_categories,id',
            'published_at' => 'nullable|date',
            'status' => 'required|in:draft,published',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();
        if (empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
            // Ensure uniqueness
            $baseSlug = $data['slug'];
            $counter = 1;
            while (Blog::where('slug', $data['slug'])->exists()) {
                $data['slug'] = $baseSlug . '-' . $counter;
                $counter++;
            }
        }

        // Handle featured image upload
        $featuredImageUrl = $data['featured_image_url'] ?? null;
        if ($request->hasFile('featured_image')) {
            $imageFile = $request->file('featured_image');
            $imagePath = $imageFile->storeAs(
                'blogs/featured',
                uniqid() . '_' . time() . '.' . $imageFile->getClientOriginalExtension(),
                'public'
            );
            // Generate full URL for the image
            // Remove 'public/' prefix from path as storage link handles it
            $pathWithoutPublic = str_replace('public/', '', $imagePath);
            $featuredImageUrl = asset('storage/' . $pathWithoutPublic);
        }

        // If status is published and published_at is not set, set it to now
        if ($data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $data['author_id'] = $request->user()->id;
        $data['featured_image_url'] = $featuredImageUrl;
        unset($data['featured_image']); // Remove file from data array

        $blog = Blog::create($data);

        return response()->json([
            'message' => 'Blog created successfully',
            'data' => new BlogResource($blog->load(['category', 'author'])),
        ], 201);
    }

    /**
     * Display the specified blog
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $blog = Blog::with(['category', 'author'])->findOrFail($id);

        // Public users can only see published blogs
        $user = $request->user();
        
        // Check if blog is published (status = published and (published_at is null or published_at <= now))
        $isPublished = $blog->status === 'published' && 
                      ($blog->published_at === null || $blog->published_at <= now());
        
        if ((!$user || !$user->isAdmin()) && !$isPublished) {
            return response()->json(['message' => 'Blog not found'], 404);
        }

        return response()->json([
            'data' => new BlogResource($blog),
        ]);
    }

    /**
     * Display the specified blog for admin (shows all blogs including drafts)
     */
    public function adminShow(Request $request, string $id): JsonResponse
    {
        // Require authentication and admin role
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $blog = Blog::with(['category', 'author'])->findOrFail($id);

        return response()->json([
            'data' => new BlogResource($blog),
        ]);
    }

    /**
     * Update the specified blog (admin only)
     */
    public function update(Request $request, string $id): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $blog = Blog::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:blogs,slug,' . $id,
            'content' => 'sometimes|required|string',
            'excerpt' => 'nullable|string|max:500',
            'featured_image_url' => 'nullable|string|max:1000',
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'category_id' => 'nullable|exists:blog_categories,id',
            'published_at' => 'nullable|date',
            'status' => 'sometimes|required|in:draft,published',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $data = $validator->validated();
        if (isset($data['title']) && empty($data['slug'])) {
            $data['slug'] = Str::slug($data['title']);
            // Ensure uniqueness
            $baseSlug = $data['slug'];
            $counter = 1;
            while (Blog::where('slug', $data['slug'])->where('id', '!=', $id)->exists()) {
                $data['slug'] = $baseSlug . '-' . $counter;
                $counter++;
            }
        }

        // Handle featured image upload
        if ($request->hasFile('featured_image')) {
            // Delete old image if it's a local file
            if ($blog->featured_image_url && str_contains($blog->featured_image_url, '/storage/')) {
                $oldPath = str_replace(asset('storage/'), '', $blog->featured_image_url);
                $oldPath = 'blogs/featured/' . basename($oldPath);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $imageFile = $request->file('featured_image');
            $imagePath = $imageFile->storeAs(
                'blogs/featured',
                uniqid() . '_' . time() . '.' . $imageFile->getClientOriginalExtension(),
                'public'
            );
            // Generate full URL for the image
            // Remove 'public/' prefix from path as storage link handles it
            $pathWithoutPublic = str_replace('public/', '', $imagePath);
            $data['featured_image_url'] = asset('storage/' . $pathWithoutPublic);
        } elseif (isset($data['featured_image_url'])) {
            // Update image URL if provided
            $data['featured_image_url'] = $data['featured_image_url'];
        }

        unset($data['featured_image']); // Remove file from data array

        // If status is being changed to published and published_at is not set, set it to now
        if (isset($data['status']) && $data['status'] === 'published' && empty($data['published_at']) && !$blog->published_at) {
            $data['published_at'] = now();
        }

        $blog->update($data);

        return response()->json([
            'message' => 'Blog updated successfully',
            'data' => new BlogResource($blog->load(['category', 'author'])),
        ]);
    }

    /**
     * Remove the specified blog (admin only)
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $blog = Blog::findOrFail($id);
        $blog->delete();

        return response()->json([
            'message' => 'Blog deleted successfully',
        ]);
    }

    /**
     * Get all blog categories (public)
     */
    public function categories(): JsonResponse
    {
        $categories = BlogCategory::withCount('blogs')->get();

        return response()->json([
            'data' => $categories,
        ]);
    }
}
