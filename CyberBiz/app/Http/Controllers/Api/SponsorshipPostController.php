<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SponsorshipPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SponsorshipPostController extends Controller
{
    /**
     * Get all active sponsorship posts (public)
     */
    public function index(Request $request): JsonResponse
    {
        $query = SponsorshipPost::with('creator')
            ->where('status', 'published')
            ->where(function ($q) {
                $q->whereNull('published_at')
                  ->orWhere('published_at', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('expires_at')
                  ->orWhere('expires_at', '>=', now());
            });

        // Search
        if ($request->has('q') && $request->q) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'LIKE', '%' . $request->q . '%')
                  ->orWhere('content', 'LIKE', '%' . $request->q . '%')
                  ->orWhere('sponsor_name', 'LIKE', '%' . $request->q . '%');
            });
        }

        $perPage = $request->get('per_page', 12);
        $posts = $query->orderBy('priority', 'desc')
            ->orderBy('published_at', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'data' => $posts->items(),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    /**
     * Get a single sponsorship post (public)
     */
    public function show(Request $request, string $idOrSlug): JsonResponse
    {
        $post = SponsorshipPost::with('creator')
            ->where(function ($query) use ($idOrSlug) {
                $query->where('id', $idOrSlug)
                      ->orWhere('slug', $idOrSlug);
            })
            ->firstOrFail();

        // Only allow viewing published posts (unless admin)
        $user = $request->user();
        if ((!$user || !$user->isAdmin()) && !$post->isActive()) {
            return response()->json(['message' => 'Sponsorship post not found'], 404);
        }

        return response()->json([
            'data' => $post,
        ]);
    }

    /**
     * Get all sponsorship posts (admin)
     */
    public function adminIndex(Request $request): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = SponsorshipPost::with('creator');

        // Filter by status
        if ($request->has('status') && $request->status) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('q') && $request->q) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'LIKE', '%' . $request->q . '%')
                  ->orWhere('content', 'LIKE', '%' . $request->q . '%')
                  ->orWhere('sponsor_name', 'LIKE', '%' . $request->q . '%');
            });
        }

        $perPage = $request->get('per_page', 15);
        $posts = $query->orderBy('priority', 'desc')
            ->orderBy('published_at', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate($perPage);

        return response()->json([
            'data' => $posts->items(),
            'meta' => [
                'current_page' => $posts->currentPage(),
                'last_page' => $posts->lastPage(),
                'per_page' => $posts->perPage(),
                'total' => $posts->total(),
            ],
        ]);
    }

    /**
     * Create a sponsorship post (admin)
     */
    public function store(Request $request): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:sponsorship_posts,slug',
            'content' => 'required|string',
            'excerpt' => 'nullable|string|max:1000',
            'featured_image_url' => 'nullable|url|max:255',
            'sponsor_name' => 'required|string|max:255',
            'sponsor_logo_url' => 'nullable|url|max:255',
            'sponsor_website' => 'nullable|url|max:255',
            'sponsor_description' => 'nullable|string|max:2000',
            'status' => 'required|in:draft,published,archived',
            'published_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:published_at',
            'priority' => 'nullable|integer|min:0|max:100',
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
        
        // Auto-set published_at if status is published and not provided
        if ($data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $data['created_by'] = $request->user()->id;
        $post = SponsorshipPost::create($data);

        return response()->json([
            'message' => 'Sponsorship post created successfully',
            'data' => $post->load('creator'),
        ], 201);
    }

    /**
     * Update a sponsorship post (admin)
     */
    public function update(Request $request, string $id): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $post = SponsorshipPost::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:sponsorship_posts,slug,' . $id,
            'content' => 'sometimes|required|string',
            'excerpt' => 'nullable|string|max:1000',
            'featured_image_url' => 'nullable|url|max:255',
            'sponsor_name' => 'sometimes|required|string|max:255',
            'sponsor_logo_url' => 'nullable|url|max:255',
            'sponsor_website' => 'nullable|url|max:255',
            'sponsor_description' => 'nullable|string|max:2000',
            'status' => 'sometimes|required|in:draft,published,archived',
            'published_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:published_at',
            'priority' => 'nullable|integer|min:0|max:100',
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

        // Auto-set published_at if status is published and not provided
        if (isset($data['status']) && $data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $post->update($data);

        return response()->json([
            'message' => 'Sponsorship post updated successfully',
            'data' => $post->load('creator'),
        ]);
    }

    /**
     * Delete a sponsorship post (admin)
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $post = SponsorshipPost::findOrFail($id);
        $post->delete();

        return response()->json([
            'message' => 'Sponsorship post deleted successfully',
        ]);
    }

    /**
     * Get a single sponsorship post (admin - includes drafts)
     */
    public function adminShow(Request $request, string $id): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $post = SponsorshipPost::with('creator')->findOrFail($id);

        return response()->json([
            'data' => $post,
        ]);
    }
}
