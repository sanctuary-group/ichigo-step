<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'organization_id',
    'friend_field_id',
    'friend_id',
    'value',
])]
class FriendFieldValue extends Model
{
    use BelongsToOrganization;

    public function friendField(): BelongsTo
    {
        return $this->belongsTo(FriendField::class);
    }

    public function friend(): BelongsTo
    {
        return $this->belongsTo(Friend::class);
    }
}
