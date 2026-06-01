<?php

namespace App\Http\Controllers;

use App\Models\Friend;
use App\Models\FriendField;
use App\Models\FriendFieldValue;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FriendFieldValueController extends Controller
{
    public function update(Request $request, Friend $friend): RedirectResponse
    {
        $validated = $request->validate([
            'values' => ['present', 'array'],
            'values.*' => ['nullable', 'string', 'max:1000'],
        ]);

        $fields = FriendField::whereIn('id', array_keys($validated['values']))
            ->get()
            ->keyBy('id');

        foreach ($validated['values'] as $fieldId => $value) {
            $field = $fields->get((int) $fieldId);
            if (! $field) {
                continue; // 自組織外 or 存在しない項目は無視
            }

            $value = is_string($value) ? trim($value) : null;

            // 選択肢タイプは定義済みの選択肢のみ許可
            if ($field->field_type === 'choice'
                && $value !== null && $value !== ''
                && ! in_array($value, $field->options ?? [], true)) {
                continue;
            }

            if ($value === null || $value === '') {
                // 空値は行ごと削除 → 回答人数カウントに含めない
                FriendFieldValue::where('friend_field_id', $field->id)
                    ->where('friend_id', $friend->id)
                    ->delete();

                continue;
            }

            FriendFieldValue::updateOrCreate(
                ['friend_field_id' => $field->id, 'friend_id' => $friend->id],
                ['value' => $value],
            );
        }

        return back()->with('flash.success', '友だち情報を保存しました');
    }
}
