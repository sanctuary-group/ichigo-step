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
    'scenario_folder_id',
    'name',
    'description',
    'trigger_type',
    'trigger_tag_id',
    'is_active',
])]
class Scenario extends Model
{
    use BelongsToOrganization;

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function lineChannel(): BelongsTo
    {
        return $this->belongsTo(LineChannel::class);
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(ScenarioFolder::class, 'scenario_folder_id');
    }

    public function triggerTag(): BelongsTo
    {
        return $this->belongsTo(Tag::class, 'trigger_tag_id');
    }

    public function steps(): HasMany
    {
        return $this->hasMany(ScenarioStep::class)->orderBy('step_order');
    }

    public function friendScenarios(): HasMany
    {
        return $this->hasMany(FriendScenario::class);
    }
}
