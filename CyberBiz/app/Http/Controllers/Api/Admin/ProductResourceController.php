<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResourceResource;
use App\Models\Product;
use App\Models\ProductResource as ProductResourceModel;
use App\Services\ProductResourceStorageService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class ProductResourceController extends Controller
{
    protected ProductResourceStorageService $storageService;

    public function __construct(ProductResourceStorageService $storageService)
    {
        $this->storageService = $storageService;
    }

    public function index(Request $request, string $productId): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $product = Product::findOrFail($productId);
        $resources = $product->resources()->ordered()->get();

        return response()->json([
            'data' => ProductResourceResource::collection($resources),
        ]);
    }

    public function store(Request $request, string $productId): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $product = Product::findOrFail($productId);

        $validated = $request->validate([
            'type' => 'required|in:VIDEO,DOCUMENT,FILE',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'file' => 'nullable|file|max:102400', // Max 100MB
            'external_url' => 'nullable|url|max:500',
            'order' => 'nullable|integer|min:0',
        ]);

        // Check if file is actually uploaded (not just in validated array)
        $hasFile = $request->hasFile('file');
        $hasExternalUrl = !empty($validated['external_url']) && trim($validated['external_url']) !== '';

        // Validate that either file or external_url is provided (but not both)
        if (!$hasFile && !$hasExternalUrl) {
            return response()->json([
                'message' => 'Either file or external_url must be provided',
            ], 422);
        }

        if ($hasFile && $hasExternalUrl) {
            return response()->json([
                'message' => 'Cannot provide both file and external_url',
            ], 422);
        }

        $resourceData = [
            'product_id' => $product->id,
            'type' => $validated['type'],
            'title' => $validated['title'] ?? null,
            'description' => $validated['description'] ?? null,
            'order' => $validated['order'] ?? 0,
            'is_active' => true,
        ];

        // Handle file upload
        if ($hasFile) {
            $file = $request->file('file');
            $filePath = $this->storageService->storeFile($file, $product);
            
            $resourceData['file_path'] = $filePath;
            $resourceData['file_name'] = $file->getClientOriginalName();
            $resourceData['file_size'] = $file->getSize();
            $resourceData['mime_type'] = $file->getMimeType();
        } elseif ($hasExternalUrl) {
            $resourceData['external_url'] = trim($validated['external_url']);
        }

        $resource = ProductResourceModel::create($resourceData);

        return response()->json([
            'message' => 'Resource created successfully',
            'data' => new ProductResourceResource($resource),
        ], 201);
    }

    public function update(Request $request, string $productId, string $resourceId): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $product = Product::findOrFail($productId);
        $resource = ProductResourceModel::where('product_id', $product->id)
            ->findOrFail($resourceId);

        $validated = $request->validate([
            'type' => 'sometimes|required|in:VIDEO,DOCUMENT,FILE',
            'title' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'file' => 'nullable|file|max:102400',
            'external_url' => 'nullable|url|max:500',
            'order' => 'nullable|integer|min:0',
            'is_active' => 'nullable|boolean',
        ]);

        $updateData = [];

        if (isset($validated['type'])) {
            $updateData['type'] = $validated['type'];
        }
        if (isset($validated['title'])) {
            $updateData['title'] = $validated['title'];
        }
        if (isset($validated['description'])) {
            $updateData['description'] = $validated['description'];
        }
        if (isset($validated['order'])) {
            $updateData['order'] = $validated['order'];
        }
        if (isset($validated['is_active'])) {
            $updateData['is_active'] = $validated['is_active'];
        }

        // Handle file upload
        if ($request->hasFile('file')) {
            // Delete old file if exists
            if ($resource->file_path) {
                $this->storageService->deleteFile($resource->file_path);
            }

            $file = $request->file('file');
            $filePath = $this->storageService->storeFile($file, $product);
            
            $updateData['file_path'] = $filePath;
            $updateData['external_url'] = null; // Clear external URL if file is uploaded
            $updateData['file_name'] = $file->getClientOriginalName();
            $updateData['file_size'] = $file->getSize();
            $updateData['mime_type'] = $file->getMimeType();
        } elseif (isset($validated['external_url'])) {
            // Delete old file if switching to external URL
            if ($resource->file_path) {
                $this->storageService->deleteFile($resource->file_path);
            }

            $updateData['external_url'] = $validated['external_url'];
            $updateData['file_path'] = null;
            $updateData['file_name'] = null;
            $updateData['file_size'] = null;
            $updateData['mime_type'] = null;
        }

        $resource->update($updateData);
        $resource->refresh();

        return response()->json([
            'message' => 'Resource updated successfully',
            'data' => new ProductResourceResource($resource),
        ]);
    }

    public function destroy(Request $request, string $productId, string $resourceId): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $product = Product::findOrFail($productId);
        $resource = ProductResourceModel::where('product_id', $product->id)
            ->findOrFail($resourceId);

        // Delete associated file if exists
        if ($resource->file_path) {
            $this->storageService->deleteFile($resource->file_path);
        }

        $resource->delete();

        return response()->json([
            'message' => 'Resource deleted successfully',
        ]);
    }

    public function reorder(Request $request, string $productId): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $product = Product::findOrFail($productId);

        $validated = $request->validate([
            'resource_ids' => 'required|array',
            'resource_ids.*' => 'required|uuid|exists:product_resources,id',
        ]);

        DB::transaction(function () use ($product, $validated) {
            foreach ($validated['resource_ids'] as $index => $resourceId) {
                ProductResourceModel::where('product_id', $product->id)
                    ->where('id', $resourceId)
                    ->update(['order' => $index]);
            }
        });

        $resources = $product->resources()->ordered()->get();

        return response()->json([
            'message' => 'Resources reordered successfully',
            'data' => ProductResourceResource::collection($resources),
        ]);
    }
}
