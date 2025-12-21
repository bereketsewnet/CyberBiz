<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\JobPosting\StoreJobPostingRequest;
use App\Http\Requests\JobPosting\UpdateJobPostingRequest;
use App\Http\Resources\JobPostingResource;
use App\Models\JobPosting;
use App\Services\JsonLdService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobPostingController extends Controller
{
    public function __construct()
    {
        $this->jsonLdService = app(\App\Services\JsonLdService::class);
    }

    public function index(Request $request): JsonResponse
    {
        $query = JobPosting::query();

        // Search
        if ($request->has('q') && $request->q) {
            $query->search($request->q);
        }

        // Get authenticated user (manually check token since this is a public route)
        $user = $request->user();
        if (!$user && $token = $request->bearerToken()) {
            $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
            if ($accessToken && $accessToken->tokenable) {
                $user = $accessToken->tokenable;
            }
        }

        // Filter by employer if requested (for employer's own jobs)
        $isMyJobs = false;
        
        if ($request->has('employer_id')) {
            $query->where('employer_id', $request->employer_id);
            $isMyJobs = true;
        } elseif ($user && $user->isEmployer() && $request->boolean('my_jobs')) {
            // Filter by the logged-in employer's ID when my_jobs=true
            $query->where('employer_id', $user->id);
            $isMyJobs = true;
        }

        // Filter by status (only show published to public, but employers see all their own jobs)
        if ($isMyJobs) {
            // When viewing own jobs, show all statuses (DRAFT, PUBLISHED, ARCHIVED)
            // Only filter by status if explicitly requested
            if ($request->has('status')) {
                $query->where('status', $request->status);
            }
        } elseif (!$user || (!$user->isAdmin() && !$user->isEmployer())) {
            // Public users only see published jobs
            $query->published();
        } elseif ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // When viewing own jobs, include applications count
        if ($isMyJobs) {
            $jobs = $query->with('employer')
                ->withCount('applications')
                ->latest()
                ->paginate(15);
        } else {
            $jobs = $query->with('employer')
                ->latest()
                ->paginate(15);
        }

        return response()->json([
            'data' => JobPostingResource::collection($jobs),
            'meta' => [
                'current_page' => $jobs->currentPage(),
                'last_page' => $jobs->lastPage(),
                'per_page' => $jobs->perPage(),
                'total' => $jobs->total(),
            ],
        ]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        $job = JobPosting::with('employer')->findOrFail($id);

        // Check authorization: allow public access to published jobs, or authenticated users who own/admin it
        // Since this is a public route, manually check for bearer token
        $user = null;
        if ($token = $request->bearerToken()) {
            $accessToken = \Laravel\Sanctum\PersonalAccessToken::findToken($token);
            if ($accessToken && $accessToken->tokenable) {
                $user = $accessToken->tokenable;
            }
        }
        
        // If job is published and not expired, allow public access
        if ($job->status === 'PUBLISHED') {
            // Check if expired
            if ($job->expires_at && $job->expires_at->isPast()) {
                // Expired job - only allow owner or admin
                if (!$user || (!$user->isAdmin() && (string)$job->employer_id !== (string)$user->id)) {
                    return response()->json(['message' => 'This job posting has expired'], 403);
                }
            }
            // Published and not expired (or no expiry) - allow access
        } else {
            // Not published - only allow owner or admin
            if (!$user) {
                return response()->json(['message' => 'Authentication required to view this job'], 403);
            }
            // Check if user is admin or owner (compare UUIDs as strings)
            if (!$user->isAdmin() && (string)$job->employer_id !== (string)$user->id) {
                return response()->json(['message' => 'Unauthorized - You can only view your own draft jobs'], 403);
            }
        }

        // Generate JSON-LD if not exists
        if (!$job->ld_json) {
            $job->ld_json = $this->jsonLdService->generateForJob($job);
            $job->save();
        }

        return response()->json([
            'data' => new JobPostingResource($job),
        ]);
    }

    public function store(StoreJobPostingRequest $request): JsonResponse
    {
        // Use description_html directly from rich text editor, or generate from plain text if provided
        $descriptionHtml = $request->description_html;
        if ($request->has('description') && !empty($request->description) && empty($request->description_html)) {
            $descriptionHtml = \App\Helpers\JobDescriptionHelper::generateFromPlainText($request->description);
        }

        // Update employer's website_url if provided
        if ($request->has('website_url') && $request->website_url) {
            $request->user()->update(['website_url' => $request->website_url]);
        }

        $job = JobPosting::create([
            'employer_id' => $request->user()->id,
            'title' => $request->title,
            'job_type' => $request->job_type,
            'location' => $request->location,
            'experience' => $request->experience,
            'skills' => $request->skills,
            'description_html' => $descriptionHtml,
            'status' => $request->status ?? 'DRAFT',
            'expires_at' => $request->expires_at,
            'company_description' => $request->company_description,
        ]);

        // Generate JSON-LD
        $job->ld_json = $this->jsonLdService->generateForJob($job);
        $job->save();

        return response()->json([
            'message' => 'Job posting created successfully',
            'data' => new JobPostingResource($job->load('employer')),
        ], 201);
    }

    public function update(UpdateJobPostingRequest $request, string $id): JsonResponse
    {
        $job = JobPosting::findOrFail($id);

        $updateData = $request->validated();
        
        // Generate HTML from plain text description if provided (backward compatibility)
        if ($request->has('description') && !empty($request->description) && empty($request->description_html)) {
            $updateData['description_html'] = \App\Helpers\JobDescriptionHelper::generateFromPlainText($request->description);
            unset($updateData['description']);
        }
        
        // Update employer's website_url if provided
        if ($request->has('website_url') && $request->website_url) {
            $job->employer->update(['website_url' => $request->website_url]);
        }
        unset($updateData['website_url']); // Remove from job update data

        $job->update($updateData);

        // Regenerate JSON-LD if title or description changed
        if ($request->has('title') || $request->has('description_html') || $request->has('description')) {
            $job->ld_json = $this->jsonLdService->generateForJob($job);
            $job->save();
        }

        return response()->json([
            'message' => 'Job posting updated successfully',
            'data' => new JobPostingResource($job->load('employer')),
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $job = JobPosting::findOrFail($id);

        if (!$request->user()->can('delete', $job)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $job->delete();

        return response()->json([
            'message' => 'Job posting deleted successfully',
        ]);
    }

    public function jsonLd(string $id): JsonResponse
    {
        $job = JobPosting::with('employer')->findOrFail($id);

        if (!$job->ld_json) {
            $job->ld_json = $this->jsonLdService->generateForJob($job);
            $job->save();
        }

        return response()->json($job->ld_json, 200, [
            'Content-Type' => 'application/ld+json',
        ]);
    }
}
