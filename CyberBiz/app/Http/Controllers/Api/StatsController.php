<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\JobPosting;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class StatsController extends Controller
{
    public function index(): JsonResponse
    {
        $stats = [
            'active_jobs' => JobPosting::where('status', 'PUBLISHED')
                ->where(function ($query) {
                    $query->whereNull('expires_at')
                        ->orWhere('expires_at', '>', now());
                })
                ->count(),
            'companies' => User::where('role', 'EMPLOYER')->count(),
            'job_seekers' => User::where('role', 'SEEKER')->count(),
            'success_rate' => 85, // Placeholder - can be calculated from actual data later
        ];

        return response()->json([
            'data' => $stats,
        ]);
    }
}

