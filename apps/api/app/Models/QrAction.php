<?php

namespace App\Models;

use App\Models\Concerns\BelongsToOrganization;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable([
    'organization_id',
    'line_channel_id',
    'qr_action_folder_id',
    'token',
    'name',
    'audience',
    'action_type',
    'action_tag_id',
    'action_scenario_id',
    'is_active',
    'scan_count',
    'follow_count',
])]
class QrAction extends Model
{
    use BelongsToOrganization;

    protected function casts(): array
    {
        return [
            'is_active' => 'boolean',
        ];
    }

    public function folder(): BelongsTo
    {
        return $this->belongsTo(QrActionFolder::class, 'qr_action_folder_id');
    }

    public function lineChannel(): BelongsTo
    {
        return $this->belongsTo(LineChannel::class);
    }

    public function actionTag(): BelongsTo
    {
        return $this->belongsTo(Tag::class, 'action_tag_id');
    }

    public function actionScenario(): BelongsTo
    {
        return $this->belongsTo(Scenario::class, 'action_scenario_id');
    }
}
