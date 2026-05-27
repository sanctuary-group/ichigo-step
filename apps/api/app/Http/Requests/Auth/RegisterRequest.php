<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'token' => ['required', 'string', 'size:64'],
            'name' => ['required', 'string', 'max:50'],
            'company' => ['nullable', 'string', 'max:100'],
            'phone' => ['required', 'string', 'regex:/\A[0-9]{8,15}\z/'],
            'password' => [
                'required',
                'string',
                'min:6',
                'max:12',
                'confirmed',
                'regex:/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#&()\-\[\]{};:\',.?\/*~$^+=<>._-]).+$/',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'token.required' => 'トークンが見つかりません。最初からやり直してください。',
            'name.required' => '名前を入力してください。',
            'phone.required' => '電話番号を入力してください。',
            'phone.regex' => '電話番号はハイフンなし 8〜15 桁の数字で入力してください。',
            'password.required' => 'パスワードを入力してください。',
            'password.confirmed' => 'パスワードとパスワード確認用が一致しません。',
            'password.min' => 'パスワードは 6 文字以上で入力してください。',
            'password.max' => 'パスワードは 12 文字以内で入力してください。',
            'password.regex' => 'パスワードは英大文字・英小文字・数字・記号を 1 文字以上含む必要があります。',
        ];
    }
}
