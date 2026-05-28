<?php

namespace App\Services;

use App\Models\Friend;
use App\Models\FriendScenario;
use App\Models\Scenario;
use Illuminate\Support\Carbon;

class ScenarioEnroller
{
    /**
     * Enroll a friend into all active scenarios that match the given trigger.
     */
    public static function enroll(Friend $friend, string $triggerType, ?int $triggerTagId = null): void
    {
        $query = Scenario::withoutGlobalScopes()
            ->where('organization_id', $friend->organization_id)
            ->where('line_channel_id', $friend->line_channel_id)
            ->where('is_active', true)
            ->where('trigger_type', $triggerType);

        if ($triggerType === 'tag_added') {
            $query->where('trigger_tag_id', $triggerTagId);
        }

        $scenarios = $query->with('steps')->get();

        foreach ($scenarios as $scenario) {
            $firstStep = $scenario->steps->first();
            if (! $firstStep) {
                continue;
            }

            FriendScenario::withoutGlobalScopes()->updateOrCreate(
                ['friend_id' => $friend->id, 'scenario_id' => $scenario->id],
                [
                    'organization_id' => $friend->organization_id,
                    'current_step_order' => 0,
                    'status' => 'active',
                    'started_at' => Carbon::now(),
                    'next_delivery_at' => Carbon::now()->addMinutes($firstStep->delay_minutes),
                    'completed_at' => null,
                    'error_message' => null,
                ],
            );
        }
    }
}
