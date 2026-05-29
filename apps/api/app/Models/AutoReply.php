<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

#[Fillable([
    'organization_id',
    'auto_reply_folder_id',
    'trigger_type',
    'match_mode',
    'keywords',
    'exclude_bracket',
    'audience',
    'schedule_type',
    'schedule_start',
    'schedule_end',
    'action_mode',
    'message_type',
    'text_content',
    'image_url',
    'image_preview_url',
    'is_active',
    'hit_count',
])]
class AutoReply extends Model
{
    use BelongsToOrganization;

    protected function casts(): array
    {
        return [
            'keywords' => 'array',
            'exclude_bracket' => 'boolean',
            'is_active' => 'boolean',
            'schedule_start' => 'datetime',
            'schedule_end' => 'datetime',
        ];
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(AutoReplyFolder::class, 'auto_reply_folder_id');
    }

    /**
     * いま（$now）この応答がスケジュール的に有効か。
     */
    public function isWithinSchedule(Carbon $now): bool
    {
        return match ($this->schedule_type) {
            'custom' => (! $this->schedule_start || $now->greaterThanOrEqualTo($this->schedule_start))
                && (! $this->schedule_end || $now->lessThanOrEqualTo($this->schedule_end)),
            // 'business' は営業時間機能が未実装のため常時許可として扱う
            default => true,
        };
    }

    /**
     * 受信テキストがこの応答のトリガーに一致するか（all / keyword）。
     */
    public function matchesText(string $text): bool
    {
        if ($this->trigger_type === 'all') {
            return true;
        }

        if ($this->trigger_type !== 'keyword') {
            return false;
        }

        if ($this->exclude_bracket && preg_match('/^\s*【.*?】/u', $text) === 1) {
            return false;
        }

        $keywords = array_filter(
            $this->keywords ?? [],
            fn ($k) => trim((string) $k) !== '',
        );

        foreach ($keywords as $keyword) {
            $keyword = trim((string) $keyword);
            if ($this->match_mode === 'exact') {
                if (trim($text) === $keyword) {
                    return true;
                }
            } elseif (mb_strpos($text, $keyword) !== false) {
                return true;
            }
        }

        return false;
    }
}
