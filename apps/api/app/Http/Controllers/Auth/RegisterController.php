<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Requests\Auth\StoreEmailVerificationRequest;
use App\Mail\VerifyEmailMail;
use App\Models\EmailVerification;
use App\Models\Organization;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class RegisterController extends Controller
{
    public function show(Request $request): Response
    {
        $token = $request->query('token');
        $email = null;
        $tokenInvalid = false;

        if (is_string($token) && strlen($token) === 64) {
            $verification = EmailVerification::where('token', $token)->first();
            if ($verification && $verification->isValid()) {
                $email = $verification->email;
            } else {
                $tokenInvalid = true;
            }
        }

        return Inertia::render('Auth/Register', [
            'email' => $email,
            'token' => $email ? $token : null,
            'tokenInvalid' => $tokenInvalid,
        ]);
    }

    public function email(StoreEmailVerificationRequest $request): RedirectResponse
    {
        $email = $request->string('email')->lower()->value();

        if (! User::where('email', $email)->exists()) {
            $token = bin2hex(random_bytes(32));

            EmailVerification::create([
                'email' => $email,
                'token' => $token,
                'expires_at' => now()->addHours(24),
            ]);

            Mail::to($email)->queue(new VerifyEmailMail($token));
        }

        return back()->with('flash.sent', true);
    }

    public function store(RegisterRequest $request): RedirectResponse
    {
        $verification = EmailVerification::where('token', $request->string('token')->value())->first();

        if (! $verification || ! $verification->isValid()) {
            throw ValidationException::withMessages([
                'token' => 'メール認証の有効期限が切れています。最初からやり直してください。',
            ]);
        }

        if (User::where('email', $verification->email)->exists()) {
            throw ValidationException::withMessages([
                'token' => 'このメールアドレスは既に登録済みです。',
            ]);
        }

        $user = DB::transaction(function () use ($request, $verification) {
            $orgName = $request->filled('company')
                ? $request->string('company')->value()
                : $request->string('name')->value().'の組織';

            $organization = Organization::create([
                'name' => $orgName,
                'plan' => 'free',
                'is_active' => true,
            ]);

            $user = User::create([
                'name' => $request->string('name')->value(),
                'email' => $verification->email,
                'phone' => $request->string('phone')->value(),
                'company' => $request->input('company'),
                'password' => Hash::make($request->string('password')->value()),
                'email_verified_at' => now(),
                'current_organization_id' => $organization->id,
            ]);

            $organization->users()->attach($user->id, ['role' => 'owner']);

            $verification->update(['used_at' => now()]);

            return $user;
        });

        Auth::login($user);
        $request->session()->regenerate();

        return redirect()->intended('/')->with('flash.success', 'アカウント登録が完了しました。');
    }
}
