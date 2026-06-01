<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * LIFF で QR スキャン者（line_user_id）を捕捉し、follow webhook 時に
 * QR アクション（タグ付与 / シナリオ開始）を発火させるための紐付けレコード。
 * 公開コンテキスト（LIFF / webhook）で扱うため組織グローバルスコープは持たない。
 */
#[Fillable([
    'organization_id',
    'qr_action_id',
    'line_channel_id',
    'line_user_id',
    'expires_at',
    'consumed_at',
])]
class QrAttribution extends Model
{
    protected function casts(): array
    {
        return [
            'expires_at' => 'datetime',
            'consumed_at' => 'datetime',
        ];
    }

    public function qrAction(): BelongsTo
    {
        return $this->belongsTo(QrAction::class);
    }
}
