<?php

namespace App\Http\Controllers;

use App\Models\Form;
use App\Models\FormResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\Response as HttpResponse;

class PublicFormController extends Controller
{
    public function show(Request $request, string $token): Response|HttpResponse
    {
        $form = Form::withoutGlobalScopes()
            ->with('fields')
            ->where('token', $token)
            ->first();

        if (! $form) {
            abort(404);
        }

        // 公開中以外は受付終了として表示
        $closed = $form->status !== 'published';

        return Inertia::render('PublicForm/Show', [
            'form' => [
                'title' => $form->title,
                'description' => $form->description,
                'submit_message' => $form->submit_message,
                'token' => $form->token,
            ],
            'fields' => $form->fields->map(fn ($f) => [
                'id' => $f->id,
                'label' => $f->label,
                'type' => $f->type,
                'options' => $f->options ?? [],
                'required' => $f->required,
            ])->all(),
            'closed' => $closed,
            'submitted' => $request->hasSession()
                ? (bool) $request->session()->get('form_submitted')
                : false,
        ]);
    }

    public function submit(Request $request, string $token): RedirectResponse
    {
        $form = Form::withoutGlobalScopes()
            ->with('fields')
            ->where('token', $token)
            ->firstOrFail();

        if ($form->status !== 'published') {
            return back()->with('flash.error', 'このフォームは現在受付を終了しています');
        }

        $rules = [];
        $attributes = [];
        foreach ($form->fields as $field) {
            $key = "answers.{$field->id}";
            $rule = [$field->required ? 'required' : 'nullable'];

            match ($field->type) {
                'email' => $rule[] = 'email',
                'number' => $rule[] = 'numeric',
                'date' => $rule[] = 'date',
                'checkbox' => $rule[] = 'array',
                'radio', 'select' => $rule[] = Rule::in($field->options ?? []),
                default => $rule[] = 'string',
            };

            if ($field->type === 'checkbox') {
                $rules["{$key}.*"] = [Rule::in($field->options ?? [])];
            }
            if (in_array($field->type, ['text', 'textarea', 'email'], true)) {
                $rule[] = 'max:2000';
            }

            $rules[$key] = $rule;
            $attributes[$key] = $field->label;
        }

        $validated = $request->validate($rules, [], $attributes);

        // ラベル付きで回答を保存（後から質問が変わっても読めるように）
        $answers = [];
        foreach ($form->fields as $field) {
            $answers[] = [
                'field_id' => $field->id,
                'label' => $field->label,
                'type' => $field->type,
                'value' => $validated['answers'][$field->id] ?? null,
            ];
        }

        FormResponse::withoutGlobalScopes()->create([
            'organization_id' => $form->organization_id,
            'form_id' => $form->id,
            'friend_id' => null,
            'answers' => $answers,
            'submitted_at' => now(),
        ]);

        return redirect()->route('publicForm.show', ['token' => $token])
            ->with('form_submitted', true);
    }
}
