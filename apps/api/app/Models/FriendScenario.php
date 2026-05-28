<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'organization_id',
    'friend_id',
    'scenario_id',
    'current_step_order',
    'status',
    'started_at',
    'next_delivery_at',
    'completed_at',
    'error_message',
])]
class FriendScenario extends Model
{
    use BelongsToOrganization;

    protected function casts(): array
    {
        return [
            'started_at' => 'datetime',
            'next_delivery_at' => 'datetime',
            'completed_at' => 'datetime',
        ];
    }

    public function friend(): BelongsTo
    {
        return $this->belongsTo(Friend::class);
    }

    public function scenario(): BelongsTo
    {
        return $this->belongsTo(Scenario::class);
    }
}
