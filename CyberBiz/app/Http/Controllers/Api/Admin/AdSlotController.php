<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Storage;
use App\Models\AdSlot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdSlotController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = AdSlot::query();

        // Filter by position
        if ($request->has('position')) {
            $query->byPosition($request->position);
        }

        // Filter by active status
        if ($request->has('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }

        $ads = $query->latest()->paginate(15);

        return response()->json([
            'data' => $ads->map(function ($ad) {
                return [
                    'id' => $ad->id,
                    'position' => $ad->position,
                    'image_url' => $ad->image_url,
                    'target_url' => $ad->target_url,
                    'is_active' => $ad->is_active,
                    'impressions' => $ad->impressions,
                    'created_at' => $ad->created_at->format('Y-m-d H:i:s'),
                    'updated_at' => $ad->updated_at->format('Y-m-d H:i:s'),
                ];
            }),
            'meta' => [
                'current_page' => $ads->currentPage(),
                'last_page' => $ads->lastPage(),
                'per_page' => $ads->perPage(),
                'total' => $ads->total(),
            ],
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'position' => 'required|in:HOME_HEADER,SIDEBAR,JOB_DETAIL',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'image_url' => 'nullable|url|max:500',
            'target_url' => 'required|url|max:500',
            'is_active' => 'sometimes|boolean',
        ]);

        // Validate that either image file or image_url is provided
        if (!$request->hasFile('image') && empty($validated['image_url'])) {
            return response()->json([
                'message' => 'Either image file or image_url must be provided',
            ], 422);
        }

        // Handle image upload
        $imageUrl = $validated['image_url'] ?? null;
        if ($request->hasFile('image')) {
            $imageFile = $request->file('image');
            $imagePath = $imageFile->storeAs(
                'ads/images',
                uniqid() . '_' . time() . '.' . $imageFile->getClientOriginalExtension(),
                'public'
            );
            // Generate full URL for the image
            $pathWithoutPublic = str_replace('public/', '', $imagePath);
            $imageUrl = asset('storage/' . $pathWithoutPublic);
        }

        $ad = AdSlot::create([
            'position' => $validated['position'],
            'image_url' => $imageUrl,
            'target_url' => $validated['target_url'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'message' => 'Ad slot created successfully',
            'data' => [
                'id' => $ad->id,
                'position' => $ad->position,
                'image_url' => $ad->image_url,
                'target_url' => $ad->target_url,
                'is_active' => $ad->is_active,
                'impressions' => $ad->impressions,
            ],
        ], 201);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $ad = AdSlot::findOrFail($id);

        return response()->json([
            'data' => [
                'id' => $ad->id,
                'position' => $ad->position,
                'image_url' => $ad->image_url,
                'target_url' => $ad->target_url,
                'is_active' => $ad->is_active,
                'impressions' => $ad->impressions,
                'created_at' => $ad->created_at->format('Y-m-d H:i:s'),
                'updated_at' => $ad->updated_at->format('Y-m-d H:i:s'),
            ],
        ]);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $ad = AdSlot::findOrFail($id);

        $validated = $request->validate([
            'position' => 'sometimes|required|in:HOME_HEADER,SIDEBAR,JOB_DETAIL',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'image_url' => 'nullable|url|max:500',
            'target_url' => 'sometimes|required|url|max:500',
            'is_active' => 'sometimes|boolean',
        ]);

        // Handle image update - only update if new image is provided
        if ($request->hasFile('image')) {
            // Delete old image if exists and was stored locally
            if ($ad->image_url && str_contains($ad->image_url, '/storage/ads/')) {
                $oldPath = str_replace(asset('storage/'), '', $ad->image_url);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $imageFile = $request->file('image');
            $imagePath = $imageFile->storeAs(
                'ads/images',
                uniqid() . '_' . time() . '.' . $imageFile->getClientOriginalExtension(),
                'public'
            );
            // Generate full URL for the image
            $pathWithoutPublic = str_replace('public/', '', $imagePath);
            $validated['image_url'] = asset('storage/' . $pathWithoutPublic);
        } elseif (array_key_exists('image_url', $validated)) {
            // If image_url is explicitly provided (even if empty), use it
            // This allows clearing the image by setting it to empty string
            if (empty($validated['image_url']) && $ad->image_url && str_contains($ad->image_url, '/storage/ads/')) {
                // Delete old local file if clearing
                $oldPath = str_replace(asset('storage/'), '', $ad->image_url);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }
        } else {
            // If neither image file nor image_url is provided, keep existing image_url
            unset($validated['image_url']);
        }

        $ad->update($validated);

        return response()->json([
            'message' => 'Ad slot updated successfully',
            'data' => [
                'id' => $ad->id,
                'position' => $ad->position,
                'image_url' => $ad->image_url,
                'target_url' => $ad->target_url,
                'is_active' => $ad->is_active,
                'impressions' => $ad->impressions,
            ],
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $ad = AdSlot::findOrFail($id);

        // Delete image file if stored locally
        if ($ad->image_url && str_contains($ad->image_url, '/storage/ads/')) {
            $imagePath = str_replace(asset('storage/'), '', $ad->image_url);
            if (Storage::disk('public')->exists($imagePath)) {
                Storage::disk('public')->delete($imagePath);
            }
        }

        $ad->delete();

        return response()->json([
            'message' => 'Ad slot deleted successfully',
        ]);
    }
}
