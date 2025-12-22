<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\UserLibrary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Product::query();

        // Search by title only
        if ($request->has('q') && $request->q) {
            $searchTerm = $request->q;
            $query->where('title', 'LIKE', '%' . $searchTerm . '%');
        }

        // Filter by type
        if ($request->has('type') && $request->type) {
            $query->where('type', $request->type);
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

    public function show(string $id): JsonResponse
    {
        $product = Product::findOrFail($id);

        return response()->json([
            'data' => new ProductResource($product),
        ]);
    }

    public function library(Request $request): JsonResponse
    {
        $user = $request->user();

        $libraryEntries = UserLibrary::where('user_id', $user->id)
            ->with('product')
            ->latest('access_granted_at')
            ->paginate(15);

        // Filter out entries with null products and map to ProductResource
        $products = $libraryEntries->filter(function ($entry) {
            return $entry->product !== null;
        })->map(function ($entry) {
            return new ProductResource($entry->product);
        })->values();

        return response()->json([
            'data' => $products,
            'meta' => [
                'current_page' => $libraryEntries->currentPage(),
                'last_page' => $libraryEntries->lastPage(),
                'per_page' => $libraryEntries->perPage(),
                'total' => $products->count(),
            ],
        ]);
    }

    public function claimFree(Request $request, string $id): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $product = Product::findOrFail($id);

        // Check if product is free
        if (!$product->is_free) {
            return response()->json([
                'message' => 'This product is not free',
            ], 422);
        }

        // Check if user already has access
        $hasAccess = UserLibrary::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->exists();

        if ($hasAccess) {
            return response()->json([
                'message' => 'You already have access to this product',
                'data' => new ProductResource($product),
            ]);
        }

        // Automatically add to library
        UserLibrary::create([
            'user_id' => $user->id,
            'product_id' => $product->id,
            'access_granted_at' => now(),
        ]);

        return response()->json([
            'message' => 'Product added to your library successfully',
            'data' => new ProductResource($product),
        ], 201);
    }
}
