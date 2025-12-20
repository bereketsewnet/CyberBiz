<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AdSlot;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdSlotController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = AdSlot::query()->active();

        // Filter by position
        if ($request->has('position')) {
            $query->byPosition($request->position);
        }

        $ads = $query->latest()->get();

        // Increment impressions for each ad
        foreach ($ads as $ad) {
            $ad->increment('impressions');
        }

        return response()->json([
            'data' => $ads->map(function ($ad) {
                return [
                    'id' => $ad->id,
                    'position' => $ad->position,
                    'image_url' => $ad->image_url,
                    'target_url' => $ad->target_url,
                    'impressions' => $ad->impressions,
                ];
            }),
        ]);
    }
}
