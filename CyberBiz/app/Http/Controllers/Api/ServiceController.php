<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\ServiceInquiry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ServiceController extends Controller
{
    /**
     * Get all active services (public)
     */
    public function index(): JsonResponse
    {
        $services = Service::where('is_active', true)
            ->orderBy('order', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $services,
        ]);
    }

    /**
     * Get a single service (public)
     */
    public function show(string $idOrSlug): JsonResponse
    {
        $service = Service::where('is_active', true)
            ->where(function ($query) use ($idOrSlug) {
                $query->where('id', $idOrSlug)
                      ->orWhere('slug', $idOrSlug);
            })
            ->firstOrFail();

        return response()->json([
            'data' => $service,
        ]);
    }

    /**
     * Submit a service inquiry (public)
     */
    public function submitInquiry(Request $request, string $serviceId): JsonResponse
    {
        $service = Service::findOrFail($serviceId);

        if (!$service->is_active) {
            return response()->json(['message' => 'Service is not available'], 404);
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:50',
            'company' => 'nullable|string|max:255',
            'message' => 'required|string|min:10|max:5000',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $inquiry = ServiceInquiry::create([
            'service_id' => $service->id,
            'name' => $request->name,
            'email' => $request->email,
            'phone' => $request->phone,
            'company' => $request->company,
            'message' => $request->message,
            'status' => 'new',
        ]);

        return response()->json([
            'message' => 'Inquiry submitted successfully. We will contact you soon.',
            'data' => $inquiry,
        ], 201);
    }

    /**
     * Get all services (admin)
     */
    public function adminIndex(Request $request): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $services = Service::orderBy('order', 'asc')
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json([
            'data' => $services,
        ]);
    }

    /**
     * Create a service (admin)
     */
    public function store(Request $request): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validator = Validator::make($request->all(), [
            'title' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:services,slug',
            'description' => 'required|string',
            'content' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'image_url' => 'nullable|url|max:255',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $service = Service::create($validator->validated());

        return response()->json([
            'message' => 'Service created successfully',
            'data' => $service,
        ], 201);
    }

    /**
     * Update a service (admin)
     */
    public function update(Request $request, string $id): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $service = Service::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:services,slug,' . $id,
            'description' => 'sometimes|required|string',
            'content' => 'nullable|string',
            'icon' => 'nullable|string|max:255',
            'image_url' => 'nullable|url|max:255',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $service->update($validator->validated());

        return response()->json([
            'message' => 'Service updated successfully',
            'data' => $service,
        ]);
    }

    /**
     * Delete a service (admin)
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $service = Service::findOrFail($id);
        $service->delete();

        return response()->json([
            'message' => 'Service deleted successfully',
        ]);
    }

    /**
     * Get all inquiries (admin)
     */
    public function inquiries(Request $request): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = ServiceInquiry::with(['service', 'assignedUser']);

        // Filter by service
        if ($request->has('service_id')) {
            $query->where('service_id', $request->service_id);
        }

        // Filter by status
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        // Search
        if ($request->has('q') && $request->q) {
            $query->where(function ($q) use ($request) {
                $q->where('name', 'LIKE', '%' . $request->q . '%')
                  ->orWhere('email', 'LIKE', '%' . $request->q . '%')
                  ->orWhere('company', 'LIKE', '%' . $request->q . '%')
                  ->orWhere('message', 'LIKE', '%' . $request->q . '%');
            });
        }

        $perPage = $request->get('per_page', 15);
        $inquiries = $query->orderBy('created_at', 'desc')->paginate($perPage);

        return response()->json([
            'data' => $inquiries->items(),
            'meta' => [
                'current_page' => $inquiries->currentPage(),
                'last_page' => $inquiries->lastPage(),
                'per_page' => $inquiries->perPage(),
                'total' => $inquiries->total(),
            ],
        ]);
    }

    /**
     * Update inquiry status (admin)
     */
    public function updateInquiry(Request $request, string $id): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $inquiry = ServiceInquiry::findOrFail($id);

        $validator = Validator::make($request->all(), [
            'status' => 'sometimes|required|in:new,contacted,in_progress,completed,cancelled',
            'admin_notes' => 'nullable|string|max:5000',
            'assigned_to' => 'nullable|exists:users,id',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $inquiry->update($validator->validated());
        $inquiry->load(['service', 'assignedUser']);

        return response()->json([
            'message' => 'Inquiry updated successfully',
            'data' => $inquiry,
        ]);
    }

    /**
     * Delete an inquiry (admin)
     */
    public function deleteInquiry(Request $request, string $id): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $inquiry = ServiceInquiry::findOrFail($id);
        $inquiry->delete();

        return response()->json([
            'message' => 'Inquiry deleted successfully',
        ]);
    }
}
