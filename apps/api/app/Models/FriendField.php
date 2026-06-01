<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'organization_id',
    'friend_field_folder_id',
    'name',
    'field_type',
    'options',
    'run_mode',
    'sort_order',
])]
class FriendField extends Model
{
    use BelongsToOrganization;

    protected function casts(): array
    {
        return [
            'options' => 'array',
            'sort_order' => 'integer',
        ];
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(FriendFieldFolder::class, 'friend_field_folder_id');
    }

    public function values(): HasMany
    {
        return $this->hasMany(FriendFieldValue::class);
    }
}
