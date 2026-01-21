<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use App\Models\AffiliateLink;
use App\Models\AffiliateClick;
use App\Models\AffiliateConversion;
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

        // Check for existing inquiry (same email + service, not cancelled)
        $existingInquiry = ServiceInquiry::where('service_id', $service->id)
            ->where('email', $request->email)
            ->where('status', '!=', 'cancelled')
            ->first();

        if ($existingInquiry) {
            return response()->json([
                'message' => 'You have already submitted an inquiry for this service. Please wait for our response or contact us directly.',
            ], 409);
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

        // (Optional) Affiliate tracking for service inquiries could be added here in the future

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
            'image' => 'nullable|image|max:5120', // 5MB max
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

        $data = $validator->validated();

        // Handle slug generation if empty
        if (empty($data['slug'])) {
            $data['slug'] = \Illuminate\Support\Str::slug($data['title']);
            // Ensure uniqueness
            $baseSlug = $data['slug'];
            $counter = 1;
            while (Service::where('slug', $data['slug'])->exists()) {
                $data['slug'] = $baseSlug . '-' . $counter;
                $counter++;
            }
        }

        // Handle image upload
        $imageUrl = $data['image_url'] ?? null;
        if ($request->hasFile('image')) {
            $imageFile = $request->file('image');
            $imagePath = $imageFile->storeAs(
                'services',
                uniqid() . '_' . time() . '.' . $imageFile->getClientOriginalExtension(),
                'public'
            );
            $pathWithoutPublic = str_replace('public/', '', $imagePath);
            $imageUrl = asset('storage/' . $pathWithoutPublic);
        }

        $data['image_url'] = $imageUrl;
        unset($data['image']); // Remove file from data array

        $service = Service::create($data);

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
            'image' => 'nullable|image|max:5120', // 5MB max
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

        $data = $validator->validated();

        // Handle slug: if empty string is sent, auto-generate from title
        if (isset($data['slug']) && $data['slug'] === '') {
            $data['slug'] = \Illuminate\Support\Str::slug($data['title'] ?? $service->title);
            // Ensure uniqueness
            $baseSlug = $data['slug'];
            $counter = 1;
            while (Service::where('slug', $data['slug'])->where('id', '!=', $id)->exists()) {
                $data['slug'] = $baseSlug . '-' . $counter;
                $counter++;
            }
        }

        // Handle image upload
        if ($request->hasFile('image')) {
            // Delete old image if exists
            if ($service->image_url) {
                $oldImagePath = str_replace(asset('storage/'), '', $service->image_url);
                $fullPath = storage_path('app/public/' . $oldImagePath);
                if (file_exists($fullPath)) {
                    unlink($fullPath);
                }
            }

            $imageFile = $request->file('image');
            $imagePath = $imageFile->storeAs(
                'services',
                uniqid() . '_' . time() . '.' . $imageFile->getClientOriginalExtension(),
                'public'
            );
            $pathWithoutPublic = str_replace('public/', '', $imagePath);
            $data['image_url'] = asset('storage/' . $pathWithoutPublic);
        }

        unset($data['image']); // Remove file from data array

        $service->update($data);

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

    /**
     * Cancel an inquiry (public - by email verification)
     */
    public function cancelInquiry(Request $request, string $serviceId): JsonResponse
    {
        $service = Service::findOrFail($serviceId);

        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $inquiry = ServiceInquiry::where('service_id', $service->id)
            ->where('email', $request->email)
            ->where('status', '!=', 'cancelled')
            ->latest()
            ->first();

        if (!$inquiry) {
            return response()->json([
                'message' => 'No active inquiry found for this email and service.',
            ], 404);
        }

        $inquiry->update([
            'status' => 'cancelled',
        ]);

        return response()->json([
            'message' => 'Inquiry cancelled successfully',
        ]);
    }

    /**
     * Check if user has existing inquiry for a service
     */
    public function checkInquiry(Request $request, string $serviceId): JsonResponse
    {
        $service = Service::findOrFail($serviceId);

        $validator = Validator::make($request->all(), [
            'email' => 'required|email|max:255',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422);
        }

        $inquiry = ServiceInquiry::where('service_id', $service->id)
            ->where('email', $request->email)
            ->where('status', '!=', 'cancelled')
            ->latest()
            ->first();

        return response()->json([
            'exists' => $inquiry !== null,
            'inquiry' => $inquiry ? [
                'id' => $inquiry->id,
                'status' => $inquiry->status,
                'created_at' => $inquiry->created_at,
            ] : null,
        ]);
    }
}
