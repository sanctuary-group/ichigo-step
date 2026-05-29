<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'organization_id',
    'line_channel_id',
    'form_folder_id',
    'token',
    'name',
    'title',
    'description',
    'form_type',
    'status',
    'submit_message',
])]
class Form extends Model
{
    use BelongsToOrganization;

    public function fields(): HasMany
    {
        return $this->hasMany(FormField::class)->orderBy('sort_order');
    }

    public function responses(): HasMany
    {
        return $this->hasMany(FormResponse::class);
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(FormFolder::class, 'form_folder_id');
    }

    public function lineChannel(): BelongsTo
    {
        return $this->belongsTo(LineChannel::class);
    }
}
