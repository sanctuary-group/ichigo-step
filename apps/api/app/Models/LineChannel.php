<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

#[Fillable([
    'organization_id',
    'name',
    'basic_id',
    'channel_id',
    'channel_secret',
    'channel_access_token',
    'liff_id',
    'is_active',
    'fallback_channel_id',
    'public_token',
    'risk_level',
    'last_health_checked_at',
    'last_health_error',
])]
#[Hidden(['channel_secret', 'channel_access_token'])]
class LineChannel extends Model
{
    use BelongsToOrganization;

    protected $appends = ['friend_add_url'];

    protected function casts(): array
    {
        return [
            'channel_secret' => 'encrypted',
            'channel_access_token' => 'encrypted',
            'is_active' => 'boolean',
            'last_health_checked_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (LineChannel $channel) {
            if (empty($channel->public_token)) {
                $channel->public_token = Str::lower(Str::random(16));
            }
        });
    }

    public function healthLogs(): HasMany
    {
        return $this->hasMany(ChannelHealthLog::class);
    }

    /**
     * BAN 検知時の自動切替先（あらかじめセットした予備チャネル）。
     */
    public function fallbackChannel(): BelongsTo
    {
        return $this->belongsTo(LineChannel::class, 'fallback_channel_id');
    }

    /**
     * 配布用の友だち追加 URL。
     * public_token があれば追跡リダイレクト (/add/{token}) を返し、
     * クリック時に「現在アクティブなチャネル」へ解決される（BAN 後は予備へ自動誘導）。
     */
    public function getFriendAddUrlAttribute(): ?string
    {
        if (! empty($this->public_token)) {
            $base = rtrim((string) config('line.public_base_url'), '/');
            if ($base !== '') {
                return $base.'/add/'.$this->public_token;
            }
        }

        if (! empty($this->basic_id)) {
            return 'https://line.me/R/ti/p/'.rawurlencode($this->basic_id);
        }

        return null;
    }
}
