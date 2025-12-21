<?php

namespace App\Http\Requests\Payment;

use App\Models\Transaction;
use Illuminate\Foundation\Http\FormRequest;

class UploadProofRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is handled in the controller to allow proper logging and error handling
        // Just check that user is authenticated
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'proof' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ];
    }
}
