<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'job' => new JobPostingResource($this->whenLoaded('job')),
            'seeker' => new UserResource($this->whenLoaded('seeker')),
            'cv_original_name' => $this->cv_original_name,
            'cover_letter' => $this->cover_letter,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}
