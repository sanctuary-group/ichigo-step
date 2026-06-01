<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

#[Fillable([
    'organization_id',
    'send_shortcut',
    'short_url',
    'send_preview',
    'auto_read',
])]
class ChatSetting extends Model
{
    use BelongsToOrganization;

    protected function casts(): array
    {
        return [
            'short_url' => 'boolean',
            'send_preview' => 'boolean',
            'auto_read' => 'array',
        ];
    }

    /** auto_read のデフォルト値 */
    public const AUTO_READ_DEFAULTS = [
        'bracket' => false,
        'sticker' => false,
        'reactAll' => false,
        'reactKeyword' => false,
        'onReply' => false,
        'onBlock' => false,
    ];

    /** 画面/共有props 用に正規化した配列を返す。 */
    public function toPayload(): array
    {
        return [
            'send_shortcut' => $this->send_shortcut,
            'short_url' => (bool) $this->short_url,
            'send_preview' => (bool) $this->send_preview,
            'auto_read' => array_merge(self::AUTO_READ_DEFAULTS, $this->auto_read ?? []),
        ];
    }

    /** 未設定の組織向けのデフォルト payload。 */
    public static function defaultPayload(): array
    {
        return [
            'send_shortcut' => 'shift_enter_send',
            'short_url' => false,
            'send_preview' => true,
            'auto_read' => self::AUTO_READ_DEFAULTS,
        ];
    }
}
