<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use Illuminate\Http\JsonResponse;

class SettingsController extends Controller
{
    /**
     * Get public site settings (no authentication required)
     */
    public function index(): JsonResponse
    {
        // Get the first (and only) settings record, or create one if it doesn't exist
        $settings = SiteSetting::firstOrCreate([], []);

        return response()->json([
            'data' => $settings,
        ]);
    }
}
