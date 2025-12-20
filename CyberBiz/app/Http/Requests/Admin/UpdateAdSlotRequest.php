<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAdSlotRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->isAdmin();
    }

    public function rules(): array
    {
        return [
            'position' => 'sometimes|in:HOME_HEADER,SIDEBAR,JOB_DETAIL',
            'image_url' => 'sometimes|url|max:500',
            'target_url' => 'sometimes|url|max:500',
            'is_active' => 'sometimes|boolean',
        ];
    }
}
