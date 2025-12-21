<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\JobPostingResource;
use App\Models\JobFavorite;
use App\Models\JobPosting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobFavoriteController extends Controller
{
    public function toggle(Request $request, string $jobId): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $job = JobPosting::findOrFail($jobId);

        $favorite = JobFavorite::where('user_id', $user->id)
            ->where('job_id', $jobId)
            ->first();

        if ($favorite) {
            // Remove favorite
            $favorite->delete();
            return response()->json([
                'message' => 'Job removed from favorites',
                'is_favorite' => false,
            ]);
        } else {
            // Add favorite
            JobFavorite::create([
                'user_id' => $user->id,
                'job_id' => $jobId,
            ]);
            return response()->json([
                'message' => 'Job added to favorites',
                'is_favorite' => true,
            ]);
        }
    }

    public function check(Request $request, string $jobId): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['is_favorite' => false]);
        }

        $isFavorite = JobFavorite::where('user_id', $user->id)
            ->where('job_id', $jobId)
            ->exists();

        return response()->json(['is_favorite' => $isFavorite]);
    }

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $favorites = JobFavorite::where('user_id', $user->id)
            ->with('job.employer')
            ->latest()
            ->get();

        return response()->json([
            'data' => $favorites->map(function ($favorite) {
                return [
                    'id' => $favorite->id,
                    'job' => new JobPostingResource($favorite->job),
                    'created_at' => $favorite->created_at->format('Y-m-d H:i:s'),
                ];
            }),
        ]);
    }
}
