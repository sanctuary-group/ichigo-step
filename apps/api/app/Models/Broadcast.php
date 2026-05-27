<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'organization_id',
    'line_channel_id',
    'title',
    'message_type',
    'text_content',
    'image_url',
    'image_preview_url',
    'target_type',
    'target_tag_id',
    'status',
    'scheduled_at',
    'sent_at',
    'total_count',
    'success_count',
    'error_message',
])]
class Broadcast extends Model
{
    use BelongsToOrganization;

    protected function casts(): array
    {
        return [
            'scheduled_at' => 'datetime',
            'sent_at' => 'datetime',
        ];
    }

    public function lineChannel(): BelongsTo
    {
        return $this->belongsTo(LineChannel::class);
    }

    public function targetTag(): BelongsTo
    {
        return $this->belongsTo(Tag::class, 'target_tag_id');
    }
}
