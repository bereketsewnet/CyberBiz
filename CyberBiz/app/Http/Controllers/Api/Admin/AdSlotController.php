<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAdSlotRequest;
use App\Http\Requests\Admin\UpdateAdSlotRequest;
use App\Models\AdSlot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdSlotController extends Controller
{
    public function __construct()
    {
        $this->middleware(function ($request, $next) {
            if (!$request->user()->isAdmin()) {
                return response()->json(['message' => 'Unauthorized'], 403);
            }
            return $next($request);
        });
    }

    public function index(Request $request): JsonResponse
    {
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

    public function store(StoreAdSlotRequest $request): JsonResponse
    {
        $ad = AdSlot::create($request->validated());

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

    public function show(string $id): JsonResponse
    {
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

    public function update(UpdateAdSlotRequest $request, string $id): JsonResponse
    {
        $ad = AdSlot::findOrFail($id);
        $ad->update($request->validated());

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

    public function destroy(string $id): JsonResponse
    {
        $ad = AdSlot::findOrFail($id);
        $ad->delete();

        return response()->json([
            'message' => 'Ad slot deleted successfully',
        ]);
    }
}
