<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'title' => $this->title,
            'description' => $this->description,
            'price_etb' => $this->price_etb,
            'access_url' => $this->access_url,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
