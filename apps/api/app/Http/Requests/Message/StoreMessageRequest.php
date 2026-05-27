<?php

namespace App\Http\Requests\Message;

use Illuminate\Foundation\Http\FormRequest;

class StoreMessageRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'content' => ['nullable', 'string', 'max:5000', 'required_without:image'],
            'image' => [
                'nullable',
                'image',
                'mimes:jpg,jpeg,png',
                'max:10240',
                'required_without:content',
            ],
        ];
    }
}
