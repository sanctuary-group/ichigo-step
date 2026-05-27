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
    'line_message_id',
    'direction',
    'message_type',
    'content',
    'source',
    'broadcast_id',
    'scenario_step_id',
    'sent_at',
])]
class Message extends Model
{
    use BelongsToOrganization;

    protected function casts(): array
    {
        return [
            'sent_at' => 'datetime',
        ];
    }

    public function friend(): BelongsTo
    {
        return $this->belongsTo(Friend::class);
    }

    public function lineChannel(): BelongsTo
    {
        return $this->belongsTo(LineChannel::class);
    }
}
