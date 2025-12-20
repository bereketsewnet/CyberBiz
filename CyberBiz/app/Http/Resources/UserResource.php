<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role,
            'subscription_tier' => $this->subscription_tier,
            'company_name' => $this->company_name,
            'website_url' => $this->website_url,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
