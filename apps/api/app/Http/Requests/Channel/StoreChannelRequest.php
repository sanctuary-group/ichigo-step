<?php

namespace App\Http\Requests\Channel;

use Illuminate\Foundation\Http\FormRequest;

class StoreChannelRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:100'],
            'basic_id' => ['nullable', 'string', 'max:50'],
            'channel_id' => ['required', 'string', 'max:50'],
            'channel_secret' => ['required', 'string', 'max:255'],
            'channel_access_token' => ['required', 'string', 'max:500'],
            'liff_id' => ['nullable', 'string', 'max:100'],
        ];
    }
}
