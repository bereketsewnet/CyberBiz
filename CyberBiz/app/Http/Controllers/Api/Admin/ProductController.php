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

        $product = Product::with('resources')->findOrFail($id);

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
            'price_etb' => 'nullable|numeric|min:0',
            'thumbnail_url' => 'nullable|string|max:1000',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'content_path' => 'nullable|string|max:500',
            'is_downloadable' => 'nullable|boolean',
            'is_free' => 'nullable|boolean',
        ]);

        // Handle is_downloadable from FormData (comes as string '1' or '0')
        if (isset($validated['is_downloadable']) && is_string($validated['is_downloadable'])) {
            $validated['is_downloadable'] = $validated['is_downloadable'] === '1' || $validated['is_downloadable'] === 'true';
        }

        // Handle is_free from FormData (comes as string '1' or '0' or boolean)
        $isFree = false;
        if (isset($validated['is_free'])) {
            if (is_string($validated['is_free'])) {
                $isFree = $validated['is_free'] === '1' || $validated['is_free'] === 'true' || $validated['is_free'] === 'on';
            } else {
                $isFree = (bool)$validated['is_free'];
            }
            $validated['is_free'] = $isFree;
        }

        // If product is free, set price to 0 and skip price validation
        if ($isFree) {
            $validated['price_etb'] = 0;
        } else {
            // Custom validation: price is required if product is not free
            if (!isset($validated['price_etb']) || $validated['price_etb'] <= 0) {
                throw \Illuminate\Validation\ValidationException::withMessages([
                    'price_etb' => ['Price is required when product is not free.'],
                ]);
            }
        }

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

        // Handle description_html - use provided HTML or generate from plain text or default template
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
            'is_downloadable' => $validated['is_downloadable'] ?? false,
            'is_free' => $validated['is_free'] ?? false,
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
            'price_etb' => 'sometimes|nullable|numeric|min:0',
            'thumbnail_url' => 'nullable|string|max:1000',
            'thumbnail' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'content_path' => 'nullable|string|max:500',
            'is_downloadable' => 'sometimes|boolean',
            'is_free' => 'sometimes|boolean',
        ]);

        // Handle is_downloadable from FormData (comes as string '1' or '0')
        if (isset($validated['is_downloadable']) && is_string($validated['is_downloadable'])) {
            $validated['is_downloadable'] = $validated['is_downloadable'] === '1' || $validated['is_downloadable'] === 'true';
        }

        // Handle is_free from FormData (comes as string '1' or '0')
        if (isset($validated['is_free']) && is_string($validated['is_free'])) {
            $validated['is_free'] = $validated['is_free'] === '1' || $validated['is_free'] === 'true';
        }

        // Custom validation: price is required if product is not free (only when is_free is being updated)
        if (isset($validated['is_free'])) {
            $isFree = $validated['is_free'] === true;
            
            if (!$isFree && (!isset($validated['price_etb']) || $validated['price_etb'] <= 0)) {
                // Check if product already has a price (for updates)
                if (!$product->price_etb || $product->price_etb <= 0) {
                    throw \Illuminate\Validation\ValidationException::withMessages([
                        'price_etb' => ['Price is required when product is not free.'],
                    ]);
                }
            }
            
            // If product is free, set price to 0
            if ($isFree) {
                $validated['price_etb'] = 0;
            }
        } elseif (isset($validated['price_etb']) && $product->is_free) {
            // If updating price but product is free, ignore the price update
            unset($validated['price_etb']);
        }

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

        // Handle is_downloadable
        if (isset($validated['is_downloadable'])) {
            $updateData['is_downloadable'] = $validated['is_downloadable'];
        }

        // Handle is_free
        if (isset($validated['is_free'])) {
            $updateData['is_free'] = $validated['is_free'];
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
