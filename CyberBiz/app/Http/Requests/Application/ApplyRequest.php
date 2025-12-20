<?php

namespace App\Http\Requests\Application;

use Illuminate\Foundation\Http\FormRequest;

class ApplyRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isSeeker();
    }

    public function rules(): array
    {
        return [
            'cv' => 'required|file|mimes:pdf,docx|max:5120',
            'cover_letter' => 'nullable|string|max:5000',
        ];
    }
}
