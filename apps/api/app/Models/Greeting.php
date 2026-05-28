<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'organization_id',
    'line_channel_id',
    'type',
    'is_active',
    'message_type',
    'text_content',
    'image_url',
    'image_preview_url',
    'actions',
])]
class Greeting extends Model
{
    use BelongsToOrganization;

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
            'actions' => 'array',
        ];
    }

    public function lineChannel(): BelongsTo
    {
        return $this->belongsTo(LineChannel::class);
    }
}
