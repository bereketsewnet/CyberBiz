<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class SettingsController extends Controller
{
    /**
     * Get site settings
     */
    public function index(Request $request): JsonResponse
    {
        // Check authorization
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Get the first (and only) settings record, or create one if it doesn't exist
        $settings = SiteSetting::firstOrCreate([], []);

        return response()->json([
            'data' => $settings,
        ]);
    }

    /**
     * Update site settings
     */
    public function update(Request $request): JsonResponse
    {
        // Check authorization
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        // Convert empty strings to null for all fields
        $data = array_map(function ($value) {
            return $value === '' || $value === null ? null : $value;
        }, $request->all());

        $validator = Validator::make($data, [
            'address' => 'nullable|string',
            'email' => 'nullable|email|max:255',
            'phone' => 'nullable|string|max:100',
            'facebook_url' => 'nullable|url|max:255',
            'twitter_url' => 'nullable|url|max:255',
            'linkedin_url' => 'nullable|url|max:255',
            'instagram_url' => 'nullable|url|max:255',
            'youtube_url' => 'nullable|url|max:255',
            'faq_q1' => 'nullable|string',
            'faq_a1' => 'nullable|string',
            'faq_q2' => 'nullable|string',
            'faq_a2' => 'nullable|string',
            'faq_q3' => 'nullable|string',
            'faq_a3' => 'nullable|string',
            'privacy_policy' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        // Get or create the settings record
        $settings = SiteSetting::firstOrCreate([], []);

        // Update with validated data
        $settings->update($validator->validated());

        return response()->json([
            'message' => 'Settings updated successfully',
            'data' => $settings->fresh(),
        ]);
    }
}
