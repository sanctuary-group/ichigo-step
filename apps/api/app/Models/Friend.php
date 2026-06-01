<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'organization_id',
    'line_channel_id',
    'line_user_id',
    'display_name',
    'system_display_name',
    'picture_url',
    'status_message',
    'source',
    'note',
    'is_following',
    'is_hidden',
    'pinned_at',
    'chat_status_id',
    'followed_at',
    'unfollowed_at',
    'last_message_preview',
    'last_message_at',
    'unread_count',
    'metadata',
    'pending_reply_token',
    'pending_reply_received_at',
])]
class Friend extends Model
{
    use BelongsToOrganization;

    protected function casts(): array
    {
        return [
            'is_following' => 'boolean',
            'is_hidden' => 'boolean',
            'followed_at' => 'datetime',
            'unfollowed_at' => 'datetime',
            'last_message_at' => 'datetime',
            'metadata' => 'array',
            'pending_reply_received_at' => 'datetime',
            'pinned_at' => 'datetime',
        ];
    }

    public function lineChannel(): BelongsTo
    {
        return $this->belongsTo(LineChannel::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }

    public function tags(): BelongsToMany
    {
        return $this->belongsToMany(Tag::class)
            ->withPivot('assigned_at');
    }

    public function chatStatus(): BelongsTo
    {
        return $this->belongsTo(ChatStatus::class);
    }

    public function fieldValues(): HasMany
    {
        return $this->hasMany(FriendFieldValue::class);
    }
}
