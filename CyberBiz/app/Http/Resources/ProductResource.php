<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'type' => $this->type,
            'title' => $this->title,
            'description' => $this->description,
            'description_html' => $this->description_html,
            'price_etb' => $this->price_etb,
            'thumbnail_url' => $this->thumbnail_url,
            'access_url' => $this->access_url,
            'content_path' => $this->access_url, // Alias for backward compatibility
            'is_downloadable' => $this->is_downloadable ?? false,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];

        // Include resources if loaded and user has access (or is admin)
        if ($this->relationLoaded('resources')) {
            $user = $request->user();
            $hasAccess = $user && ($user->isAdmin() || $this->hasUserAccess($user->id));
            
            if ($hasAccess) {
                $data['resources'] = \App\Http\Resources\ProductResourceResource::collection($this->resources);
            }
        }

        return $data;
    }

    /**
     * Check if user has access to this product
     */
    private function hasUserAccess(string $userId): bool
    {
        return $this->libraryEntries()
            ->where('user_id', $userId)
            ->exists();
    }
}
