<?php

namespace App\Http\Requests\Channel;

use Illuminate\Foundation\Http\FormRequest;

class UpdateChannelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'required', 'string', 'max:100'],
            'basic_id' => ['nullable', 'string', 'max:50'],
            'channel_id' => ['sometimes', 'required', 'string', 'max:50'],
            'channel_secret' => ['nullable', 'string', 'max:255'],
            'channel_access_token' => ['nullable', 'string', 'max:500'],
            'liff_id' => ['nullable', 'string', 'max:100'],
            'is_active' => ['sometimes', 'boolean'],
            'fallback_channel_id' => ['nullable', 'integer', 'exists:line_channels,id'],
        ];
    }
}
