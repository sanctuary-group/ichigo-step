<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'scenario_id',
    'step_order',
    'delay_minutes',
    'timing_mode',
    'message_type',
    'text_content',
    'image_url',
    'image_preview_url',
])]
class ScenarioStep extends Model
{
    public function scenario(): BelongsTo
    {
        return $this->belongsTo(Scenario::class);
    }
}
