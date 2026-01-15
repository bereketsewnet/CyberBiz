<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NativeAd;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class NativeAdController extends Controller
{
    /**
     * Get active native ads for a specific position (public)
     */
    public function index(Request $request): JsonResponse
    {
        $position = $request->get('position', 'content_inline');
        $limit = $request->get('limit', 1);

        $query = NativeAd::where('is_active', true)
            ->where(function ($q) use ($position) {
                $q->where('position', $position);
            })
            ->where(function ($q) {
                $q->whereNull('start_date')
                  ->orWhere('start_date', '<=', now());
            })
            ->where(function ($q) {
                $q->whereNull('end_date')
                  ->orWhere('end_date', '>=', now());
            })
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->limit($limit);

        $ads = $query->get();

        // Track impressions
        foreach ($ads as $ad) {
            $ad->incrementImpressions();
        }

        return response()->json([
            'data' => $ads,
        ]);
    }

    /**
     * Track click on native ad (public)
     */
    public function trackClick(Request $request, string $id): JsonResponse
    {
        $ad = NativeAd::findOrFail($id);
        $ad->incrementClicks();

        return response()->json([
            'message' => 'Click tracked',
            'redirect_url' => $ad->link_url,
        ]);
    }

    /**
     * Get all native ads (admin)
     */
    public function adminIndex(Request $request): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = NativeAd::query();

        // Filter by position
        if ($request->has('position')) {
            $query->where('position', $request->position);
        }

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->is_active);
        }

        // Search
        if ($request->has('q') && $request->q) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'LIKE', '%' . $request->q . '%')
                  ->orWhere('description', 'LIKE', '%' . $request->q . '%')
                  ->orWhere('advertiser_name', 'LIKE', '%' . $request->q . '%');
            });
        }

        $ads = $query->orderBy('priority', 'desc')
            ->orderBy('created_at', 'desc')
            ->paginate(15);

        return response()->json([
            'data' => $ads->items(),
            'meta' => [
                'current_page' => $ads->currentPage(),
                'last_page' => $ads->lastPage(),
                'per_page' => $ads->perPage(),
                'total' => $ads->total(),
            ],
        ]);
    }

    /**
     * Create a native ad (admin)
     */
    public function store(Request $request): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'image_url' => 'nullable|url|max:255',
            'link_url' => 'required|url|max:255',
            'position' => 'required|in:content_inline,sidebar,footer,between_posts,after_content',
            'type' => 'required|in:sponsored,advertisement,promoted',
            'advertiser_name' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'priority' => 'nullable|integer|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $ad = NativeAd::create($validator->validated());

        return response()->json([
            'message' => 'Native ad created successfully',
            'data' => $ad,
        ], 201);
    }

    /**
     * Get a single native ad (admin)
     */
    public function show(Request $request, string $id): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $ad = NativeAd::findOrFail($id);

        return response()->json([
            'data' => $ad,
        ]);
    }

    /**
     * Update a native ad (admin)
     */
    public function update(Request $request, string $id): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $ad = NativeAd::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'image_url' => 'nullable|url|max:255',
            'link_url' => 'sometimes|required|url|max:255',
            'position' => 'sometimes|required|in:content_inline,sidebar,footer,between_posts,after_content',
            'type' => 'sometimes|required|in:sponsored,advertisement,promoted',
            'advertiser_name' => 'nullable|string|max:255',
            'is_active' => 'nullable|boolean',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
            'priority' => 'nullable|integer|min:0|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $ad->update($validator->validated());

        return response()->json([
            'message' => 'Native ad updated successfully',
            'data' => $ad,
        ]);
    }

    /**
     * Delete a native ad (admin)
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $ad = NativeAd::findOrFail($id);
        $ad->delete();

        return response()->json([
            'message' => 'Native ad deleted successfully',
        ]);
    }

    /**
     * Reset stats for a native ad (admin)
     */
    public function resetStats(Request $request, string $id): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $ad = NativeAd::findOrFail($id);
        $ad->update([
            'impressions' => 0,
            'clicks' => 0,
        ]);

        return response()->json([
            'message' => 'Stats reset successfully',
            'data' => $ad,
        ]);
    }
}
