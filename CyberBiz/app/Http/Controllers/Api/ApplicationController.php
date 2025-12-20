<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\Application\ApplyRequest;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use App\Models\JobPosting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ApplicationController extends Controller
{
    public function apply(ApplyRequest $request, string $jobId): JsonResponse
    {
        $job = JobPosting::findOrFail($jobId);

        // Check if job is published
        if ($job->status !== 'PUBLISHED') {
            return response()->json([
                'message' => 'This job is not accepting applications',
            ], 403);
        }

        // Check if already applied
        $existingApplication = Application::where('job_id', $jobId)
            ->where('seeker_id', $request->user()->id)
            ->first();

        if ($existingApplication) {
            return response()->json([
                'message' => 'You have already applied for this job',
            ], 409);
        }

        // Store CV
        $cvFile = $request->file('cv');
        $cvPath = $cvFile->storeAs(
            'cvs',
            $request->user()->id . '_' . time() . '_' . $cvFile->getClientOriginalName(),
            'private'
        );

        $application = Application::create([
            'job_id' => $jobId,
            'seeker_id' => $request->user()->id,
            'cv_path' => $cvPath,
            'cv_original_name' => $cvFile->getClientOriginalName(),
            'cover_letter' => $request->cover_letter,
        ]);

        return response()->json([
            'message' => 'Application submitted successfully',
            'data' => new ApplicationResource($application->load(['job', 'seeker'])),
        ], 201);
    }

    public function index(Request $request, string $jobId): JsonResponse
    {
        $job = JobPosting::findOrFail($jobId);

        // Check authorization
        if (!$request->user()->can('viewAny', Application::class, $jobId)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $applications = Application::where('job_id', $jobId)
            ->with(['seeker', 'job'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'data' => ApplicationResource::collection($applications),
            'meta' => [
                'current_page' => $applications->currentPage(),
                'last_page' => $applications->lastPage(),
                'per_page' => $applications->perPage(),
                'total' => $applications->total(),
            ],
        ]);
    }

    public function myApplications(Request $request): JsonResponse
    {
        $applications = Application::where('seeker_id', $request->user()->id)
            ->with(['job.employer', 'job'])
            ->latest()
            ->paginate(15);

        return response()->json([
            'data' => ApplicationResource::collection($applications),
            'meta' => [
                'current_page' => $applications->currentPage(),
                'last_page' => $applications->lastPage(),
                'per_page' => $applications->perPage(),
                'total' => $applications->total(),
            ],
        ]);
    }
}
