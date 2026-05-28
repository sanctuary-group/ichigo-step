<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'organization_id',
    'line_channel_id',
    'http_status',
    'error_code',
    'error_message',
    'risk_level',
    'checked_at',
])]
class ChannelHealthLog extends Model
{
    use BelongsToOrganization;

    protected function casts(): array
    {
        return [
            'checked_at' => 'datetime',
        ];
    }

    public function lineChannel(): BelongsTo
    {
        return $this->belongsTo(LineChannel::class);
    }
}
