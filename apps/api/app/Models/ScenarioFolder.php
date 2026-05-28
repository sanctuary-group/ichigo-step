<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

#[Fillable([
    'organization_id',
    'name',
    'sort_order',
    'is_system',
])]
class ScenarioFolder extends Model
{
    use BelongsToOrganization;

    protected function casts(): array
    {
        return [
            'is_system' => 'boolean',
        ];
    }

    public function scenarios(): HasMany
    {
        return $this->hasMany(Scenario::class);
    }
}
