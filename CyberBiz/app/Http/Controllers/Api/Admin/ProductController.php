<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        // Check authorization
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $query = Product::query();

        // Filter by type
        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        // Search
        if ($request->has('q') && $request->q) {
            $query->where(function ($q) use ($request) {
                $q->where('title', 'like', '%' . $request->q . '%')
                    ->orWhere('description', 'like', '%' . $request->q . '%');
            });
        }

        $products = $query->latest()->paginate(15);

        return response()->json([
            'data' => ProductResource::collection($products),
            'meta' => [
                'current_page' => $products->currentPage(),
                'last_page' => $products->lastPage(),
                'per_page' => $products->perPage(),
                'total' => $products->total(),
            ],
        ]);
    }

    public function show(Request $request, string $id): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $product = Product::findOrFail($id);

        return response()->json([
            'data' => new ProductResource($product),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'description_html' => 'nullable|string',
            'type' => 'required|in:COURSE,EBOOK',
            'price_etb' => 'required|numeric|min:0',
            'thumbnail_url' => 'nullable|string|max:500',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'content_path' => 'nullable|string|max:500',
        ]);

        // Handle thumbnail upload
        $thumbnailUrl = $validated['thumbnail_url'] ?? null;
        if ($request->hasFile('thumbnail')) {
            $thumbnailFile = $request->file('thumbnail');
            $thumbnailPath = $thumbnailFile->storeAs(
                'products/thumbnails',
                uniqid() . '_' . time() . '.' . $thumbnailFile->getClientOriginalExtension(),
                'public'
            );
            // Generate full URL for the thumbnail
            // Remove 'public/' prefix from path as storage link handles it
            $pathWithoutPublic = str_replace('public/', '', $thumbnailPath);
            $thumbnailUrl = asset('storage/' . $pathWithoutPublic);
        }

        // Handle description_html - use provided HTML or generate from plain text
        $descriptionHtml = $validated['description_html'] ?? null;
        if (!$descriptionHtml && !empty($validated['description'])) {
            $descriptionHtml = \App\Helpers\ProductDescriptionHelper::generateFromPlainText($validated['description']);
        } elseif (!$descriptionHtml) {
            // Use default template if no description provided
            $descriptionHtml = \App\Helpers\ProductDescriptionHelper::createDefaultTemplate();
        }

        $product = Product::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? '',
            'description_html' => $descriptionHtml,
            'type' => $validated['type'],
            'price_etb' => $validated['price_etb'],
            'thumbnail_url' => $thumbnailUrl,
            'access_url' => $validated['content_path'] ?? null,
        ]);

        return response()->json([
            'message' => 'Product created successfully',
            'data' => new ProductResource($product),
        ], 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $product = Product::findOrFail($id);

        // Validate all possible fields
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|nullable|string',
            'description_html' => 'sometimes|nullable|string',
            'type' => 'sometimes|required|in:COURSE,EBOOK',
            'price_etb' => 'sometimes|required|numeric|min:0',
            'thumbnail_url' => 'nullable|string|max:500',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'content_path' => 'nullable|string|max:500',
        ]);

        // Build update data from validated fields
        $updateData = [];
        
        // Add all validated fields to updateData
        if (isset($validated['title'])) {
            $updateData['title'] = $validated['title'];
        }
        if (isset($validated['type'])) {
            $updateData['type'] = $validated['type'];
        }
        if (isset($validated['price_etb'])) {
            $updateData['price_etb'] = $validated['price_etb'];
        }
        if (isset($validated['description'])) {
            $updateData['description'] = $validated['description'];
        }
        if (isset($validated['description_html'])) {
            $updateData['description_html'] = $validated['description_html'];
        }

        // Handle thumbnail upload
        if ($request->hasFile('thumbnail')) {
            // Delete old thumbnail if it's a local file
            if ($product->thumbnail_url && str_contains($product->thumbnail_url, '/storage/')) {
                $oldPath = str_replace(asset('storage/'), '', $product->thumbnail_url);
                $oldPath = 'products/thumbnails/' . basename($oldPath);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }

            $thumbnailFile = $request->file('thumbnail');
            $thumbnailPath = $thumbnailFile->storeAs(
                'products/thumbnails',
                uniqid() . '_' . time() . '.' . $thumbnailFile->getClientOriginalExtension(),
                'public'
            );
            // Generate full URL for the thumbnail
            // Remove 'public/' prefix from path as storage link handles it
            $pathWithoutPublic = str_replace('public/', '', $thumbnailPath);
            $updateData['thumbnail_url'] = asset('storage/' . $pathWithoutPublic);
        } elseif (isset($validated['thumbnail_url'])) {
            // Update thumbnail URL if provided
            $updateData['thumbnail_url'] = $validated['thumbnail_url'];
        }

        // Map content_path to access_url
        if (isset($validated['content_path'])) {
            $updateData['access_url'] = $validated['content_path'];
        }

        // Update the product
        if (!empty($updateData)) {
            $product->update($updateData);
            $product->refresh();
        }

        return response()->json([
            'message' => 'Product updated successfully',
            'data' => new ProductResource($product),
        ]);
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        if (!$request->user() || !$request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $product = Product::findOrFail($id);
        $product->delete();

        return response()->json([
            'message' => 'Product deleted successfully',
        ]);
    }
}
