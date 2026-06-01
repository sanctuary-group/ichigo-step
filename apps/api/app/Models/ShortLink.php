<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'organization_id',
    'line_channel_id',
    'friend_id',
    'token',
    'original_url',
    'click_count',
    'last_clicked_at',
])]
class ShortLink extends Model
{
    use BelongsToOrganization;

    protected function casts(): array
    {
        return [
            'click_count' => 'integer',
            'last_clicked_at' => 'datetime',
        ];
    }

    public function friend(): BelongsTo
    {
        return $this->belongsTo(Friend::class);
    }
}
