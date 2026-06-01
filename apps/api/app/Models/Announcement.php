<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

/**
 * 運営からの全代理店向けお知らせ（プラットフォーム共通・組織スコープなし）。
 */
#[Fillable([
    'title',
    'body',
    'importance',
    'status',
    'published_at',
    'created_by',
])]
class Announcement extends Model
{
    protected function casts(): array
    {
        return [
            'published_at' => 'datetime',
        ];
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(Operator::class, 'created_by');
    }

    /**
     * 公開済み（status=published かつ published_at が現在以前）のみ。
     */
    public function scopePublished(Builder $query): Builder
    {
        return $query->where('status', 'published')
            ->where(function ($q) {
                $q->whereNull('published_at')->orWhere('published_at', '<=', now());
            });
    }
}
