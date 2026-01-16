<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SponsorshipPost;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
            'featured_image_url' => 'nullable|url|max:1000',
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'sponsor_name' => 'required|string|max:255',
            'sponsor_logo_url' => 'nullable|url|max:1000',
            'sponsor_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
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
        
        // Handle featured image upload - Similar to BlogController
        $featuredImageUrl = isset($data['featured_image_url']) && !empty(trim($data['featured_image_url'])) ? trim($data['featured_image_url']) : null;
        if ($request->hasFile('featured_image')) {
            $imageFile = $request->file('featured_image');
            $imagePath = $imageFile->storeAs(
                'sponsorship-posts/featured',
                uniqid() . '_' . time() . '.' . $imageFile->getClientOriginalExtension(),
                'public'
            );
            $pathWithoutPublic = str_replace('public/', '', $imagePath);
            $featuredImageUrl = asset('storage/' . $pathWithoutPublic);
        }
        $data['featured_image_url'] = $featuredImageUrl;
        unset($data['featured_image']);

        // Handle sponsor logo upload - Similar to BlogController
        $sponsorLogoUrl = isset($data['sponsor_logo_url']) && !empty(trim($data['sponsor_logo_url'])) ? trim($data['sponsor_logo_url']) : null;
        if ($request->hasFile('sponsor_logo')) {
            $logoFile = $request->file('sponsor_logo');
            $logoPath = $logoFile->storeAs(
                'sponsorship-posts/logos',
                uniqid() . '_' . time() . '.' . $logoFile->getClientOriginalExtension(),
                'public'
            );
            $pathWithoutPublic = str_replace('public/', '', $logoPath);
            $sponsorLogoUrl = asset('storage/' . $pathWithoutPublic);
        }
        $data['sponsor_logo_url'] = $sponsorLogoUrl;
        unset($data['sponsor_logo']);
        
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
            'featured_image_url' => 'nullable|url|max:1000',
            'featured_image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'sponsor_name' => 'sometimes|required|string|max:255',
            'sponsor_logo_url' => 'nullable|url|max:1000',
            'sponsor_logo' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
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

        // Handle featured image upload - Similar to BlogController
        if ($request->hasFile('featured_image')) {
            // Delete old image if it's a local file
            if ($post->featured_image_url && str_contains($post->featured_image_url, '/storage/')) {
                $oldPath = str_replace(asset('storage/'), '', $post->featured_image_url);
                $oldPath = 'sponsorship-posts/featured/' . basename($oldPath);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $imageFile = $request->file('featured_image');
            $imagePath = $imageFile->storeAs(
                'sponsorship-posts/featured',
                uniqid() . '_' . time() . '.' . $imageFile->getClientOriginalExtension(),
                'public'
            );
            $pathWithoutPublic = str_replace('public/', '', $imagePath);
            $data['featured_image_url'] = asset('storage/' . $pathWithoutPublic);
        } elseif (isset($data['featured_image_url'])) {
            // Update image URL if provided - Similar to BlogController
            $data['featured_image_url'] = $data['featured_image_url'];
        }
        // If not provided, keep existing value (don't include in $data)
        unset($data['featured_image']);

        // Handle sponsor logo upload
        if ($request->hasFile('sponsor_logo')) {
            // Delete old logo if it's a local file
            if ($post->sponsor_logo_url && str_contains($post->sponsor_logo_url, '/storage/')) {
                $oldPath = str_replace(asset('storage/'), '', $post->sponsor_logo_url);
                $oldPath = 'sponsorship-posts/logos/' . basename($oldPath);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $logoFile = $request->file('sponsor_logo');
            $logoPath = $logoFile->storeAs(
                'sponsorship-posts/logos',
                uniqid() . '_' . time() . '.' . $logoFile->getClientOriginalExtension(),
                'public'
            );
            $pathWithoutPublic = str_replace('public/', '', $logoPath);
            $data['sponsor_logo_url'] = asset('storage/' . $pathWithoutPublic);
        } elseif (isset($data['sponsor_logo_url'])) {
            // Update logo URL if provided - Similar to BlogController
            $data['sponsor_logo_url'] = $data['sponsor_logo_url'];
        }
        // If not provided, keep existing value (don't include in $data)
        unset($data['sponsor_logo']);

        // Auto-set published_at if status is published and not provided
        if (isset($data['status']) && $data['status'] === 'published' && empty($data['published_at'])) {
            $data['published_at'] = now();
        }

        $post->update($data);
        
        // Refresh to get updated values
        $post->refresh();

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
