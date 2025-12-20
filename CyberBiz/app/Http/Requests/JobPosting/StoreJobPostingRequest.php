<?php

namespace App\Http\Requests\JobPosting;

use Illuminate\Foundation\Http\FormRequest;

class StoreJobPostingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isEmployer() || $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'title' => 'required|string|max:255',
            'job_type' => 'nullable|in:FULL_TIME,PART_TIME,CONTRACT,INTERNSHIP,FREELANCE',
            'location' => 'nullable|string|max:255',
            'experience' => 'nullable|string|max:100',
            'skills' => 'nullable|array',
            'skills.*' => 'string|max:100',
            'description' => 'nullable|string', // Plain text description (backward compatibility)
            'description_html' => 'required_without:description|nullable|string', // HTML description (from rich text editor)
            'website_url' => 'nullable|url|max:500', // Employer website URL
            'status' => 'sometimes|in:DRAFT,PUBLISHED,ARCHIVED',
            'expires_at' => 'nullable|date|after:today',
            'company_description' => 'nullable|string',
        ];
    }
}
