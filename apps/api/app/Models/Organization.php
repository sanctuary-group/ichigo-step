<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable(['name', 'slug', 'plan', 'is_active'])]
class Organization extends Model
{
    use HasFactory;

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class)
            ->withPivot('role')
            ->withTimestamps();
    }

    public function lineChannels(): HasMany
    {
        return $this->hasMany(LineChannel::class);
    }

    public function friends(): HasMany
    {
        return $this->hasMany(Friend::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }
}
