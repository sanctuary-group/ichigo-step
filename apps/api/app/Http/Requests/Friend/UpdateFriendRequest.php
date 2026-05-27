<?php

namespace App\Http\Requests\Friend;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateFriendRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'system_display_name' => ['nullable', 'string', 'max:100'],
            'source' => ['nullable', Rule::in(['qr', 'card', 'web', 'manual', 'other'])],
            'note' => ['nullable', 'string', 'max:5000'],
        ];
    }
}
