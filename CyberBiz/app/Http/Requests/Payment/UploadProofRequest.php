<?php

namespace App\Http\Requests\Payment;

use Illuminate\Foundation\Http\FormRequest;

class UploadProofRequest extends FormRequest
{
    public function authorize(): bool
    {
        $transaction = $this->route('transaction');
        return $transaction && $transaction->user_id === $this->user()->id;
    }

    public function rules(): array
    {
        return [
            'proof' => 'required|file|mimes:jpg,jpeg,png,pdf|max:5120',
        ];
    }
}
