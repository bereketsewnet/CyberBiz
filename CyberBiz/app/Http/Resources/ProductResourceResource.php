<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\Facades\Storage;

class ProductResourceResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $data = [
            'id' => $this->id,
            'product_id' => $this->product_id,
            'type' => $this->type,
            'title' => $this->title,
            'description' => $this->description,
            'file_name' => $this->file_name,
            'file_size' => $this->file_size,
            'mime_type' => $this->mime_type,
            'order' => $this->order,
            'is_active' => $this->is_active,
            'created_at' => $this->created_at?->toISOString(),
            'updated_at' => $this->updated_at?->toISOString(),
        ];

        // Add file path or external URL
        if ($this->file_path) {
            // Generate download URL for uploaded files
            $pathWithoutPublic = str_replace('public/', '', $this->file_path);
            $data['file_path'] = $this->file_path;
            $data['download_url'] = asset('storage/' . $pathWithoutPublic);
        } elseif ($this->external_url) {
            $data['external_url'] = $this->external_url;
        }

        return $data;
    }
}
