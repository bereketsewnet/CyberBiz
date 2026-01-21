<?php

namespace App\Http\Requests\Application;

use Illuminate\Foundation\Http\FormRequest;

class ApplyRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Allow any authenticated user (SEEKER, LEARNER, EMPLOYER, ADMIN) to apply
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'cv' => 'required|file|mimes:pdf,docx|max:5120',
            'cover_letter' => 'nullable|string|max:5000',
        ];
    }
}
