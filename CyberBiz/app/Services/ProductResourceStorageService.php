<?php

namespace App\Services;

use App\Models\Product;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;

class ProductResourceStorageService
{
    /**
     * Store a file for a product resource
     *
     * @param UploadedFile $file
     * @param Product $product
     * @return string File path
     */
    public function storeFile(UploadedFile $file, Product $product): string
    {
        $directory = "products/resources/{$product->id}";
        
        return $file->storeAs(
            $directory,
            uniqid() . '_' . time() . '_' . $file->getClientOriginalName(),
            'public'
        );
    }

    /**
     * Delete a file
     *
     * @param string $path
     * @return bool
     */
    public function deleteFile(string $path): bool
    {
        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->delete($path);
        }
        return false;
    }

    /**
     * Get download URL for a file
     *
     * @param string $path
     * @return string
     */
    public function getDownloadUrl(string $path): string
    {
        // Remove 'public/' prefix if present (storage link handles it)
        $pathWithoutPublic = str_replace('public/', '', $path);
        return asset('storage/' . $pathWithoutPublic);
    }

    /**
     * Get file size
     *
     * @param string $path
     * @return int File size in bytes
     */
    public function getFileSize(string $path): int
    {
        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->size($path);
        }
        return 0;
    }

    /**
     * Get MIME type
     *
     * @param string $path
     * @return string
     */
    public function getMimeType(string $path): string
    {
        if (Storage::disk('public')->exists($path)) {
            return Storage::disk('public')->mimeType($path);
        }
        return 'application/octet-stream';
    }
}

