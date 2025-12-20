<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobPostingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'job_type' => $this->job_type,
            'location' => $this->location,
            'experience' => $this->experience,
            'skills' => $this->skills ?? [],
            'description_html' => $this->description_html,
            'status' => $this->status,
            'expires_at' => $this->expires_at?->format('Y-m-d\TH:i:s'),
            'company_description' => $this->company_description,
            'ld_json' => $this->ld_json,
            'employer' => new UserResource($this->whenLoaded('employer')),
            'applications_count' => $this->whenCounted('applications'),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
