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

        // Filter by type
        if ($request->has('type')) {
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

        $products = $libraryEntries->map(function ($entry) {
            return new ProductResource($entry->product);
        });

        return response()->json([
            'data' => $products,
            'meta' => [
                'current_page' => $libraryEntries->currentPage(),
                'last_page' => $libraryEntries->lastPage(),
                'per_page' => $libraryEntries->perPage(),
                'total' => $libraryEntries->total(),
            ],
        ]);
    }
}
