<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResourceResource;
use App\Models\Product;
use App\Models\ProductResource;
use App\Models\UserLibrary;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ProductResourceController extends Controller
{
    /**
     * List resources for a product (requires access)
     */
    public function index(Request $request, string $productId): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $product = Product::findOrFail($productId);

        // Check if user has access (admin or has purchased)
        $hasAccess = $user->isAdmin() || UserLibrary::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->exists();

        if (!$hasAccess) {
            return response()->json([
                'message' => 'You do not have access to this product',
            ], 403);
        }

        $resources = $product->resources()->active()->ordered()->get();

        return response()->json([
            'data' => ProductResourceResource::collection($resources),
        ]);
    }

    /**
     * Download a resource file (requires access)
     */
    public function download(Request $request, string $productId, string $resourceId): JsonResponse|\Symfony\Component\HttpFoundation\StreamedResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $product = Product::findOrFail($productId);

        // Check if user has access
        $hasAccess = $user->isAdmin() || UserLibrary::where('user_id', $user->id)
            ->where('product_id', $product->id)
            ->exists();

        if (!$hasAccess) {
            return response()->json([
                'message' => 'You do not have access to this product',
            ], 403);
        }

        $resource = ProductResource::where('product_id', $product->id)
            ->where('id', $resourceId)
            ->where('is_active', true)
            ->firstOrFail();

        // Check if product is downloadable
        if (!$product->is_downloadable) {
            return response()->json([
                'message' => 'This product is not downloadable',
            ], 403);
        }

        // Check if resource has a file
        if (!$resource->file_path) {
            return response()->json([
                'message' => 'This resource does not have a downloadable file',
            ], 404);
        }

        // Verify file exists
        if (!Storage::disk('public')->exists($resource->file_path)) {
            return response()->json([
                'message' => 'File not found',
            ], 404);
        }

        // Return file download
        return Storage::disk('public')->download(
            $resource->file_path,
            $resource->file_name ?? 'download'
        );
    }
}
