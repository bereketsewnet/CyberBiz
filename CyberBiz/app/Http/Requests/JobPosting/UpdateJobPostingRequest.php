<?php

namespace App\Http\Requests\JobPosting;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJobPostingRequest extends FormRequest
{
    public function authorize(): bool
    {
        $jobPosting = $this->route('id') ? \App\Models\JobPosting::find($this->route('id')) : null;
        if (!$jobPosting) {
            return false;
        }
        return $this->user()->isAdmin() || $jobPosting->employer_id === $this->user()->id;
    }

    public function rules(): array
    {
        return [
            'title' => 'sometimes|required|string|max:255',
            'job_type' => 'sometimes|nullable|in:FULL_TIME,PART_TIME,CONTRACT,INTERNSHIP,FREELANCE',
            'location' => 'sometimes|nullable|string|max:255',
            'experience' => 'sometimes|nullable|string|max:100',
            'skills' => 'sometimes|nullable|array',
            'skills.*' => 'string|max:100',
            'description' => 'sometimes|nullable|string', // Plain text description (backward compatibility)
            'description_html' => 'sometimes|nullable|string', // HTML description (from rich text editor)
            'website_url' => 'sometimes|nullable|url|max:500', // Employer website URL
            'status' => 'sometimes|in:DRAFT,PUBLISHED,ARCHIVED',
            'expires_at' => 'nullable|date|after:today',
            'company_description' => 'sometimes|nullable|string',
        ];
    }
}
