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
            self::start($friend, $scenario);
        }
    }

    /**
     * Enroll a friend into one specific active scenario (e.g. fired by a QR action).
     * 組織 / チャネルが一致し、ステップを持つ稼働中シナリオのみ。
     */
    public static function enrollOne(Friend $friend, int $scenarioId): void
    {
        $scenario = Scenario::withoutGlobalScopes()
            ->where('id', $scenarioId)
            ->where('organization_id', $friend->organization_id)
            ->where('line_channel_id', $friend->line_channel_id)
            ->where('is_active', true)
            ->with('steps')
            ->first();

        if ($scenario) {
            self::start($friend, $scenario);
        }
    }

    private static function start(Friend $friend, Scenario $scenario): void
    {
        $firstStep = $scenario->steps->first();
        if (! $firstStep) {
            return;
        }

        $now = Carbon::now();
        FriendScenario::withoutGlobalScopes()->updateOrCreate(
            ['friend_id' => $friend->id, 'scenario_id' => $scenario->id],
            [
                'organization_id' => $friend->organization_id,
                'current_step_order' => 0,
                'status' => 'active',
                'started_at' => $now,
                'next_delivery_at' => $firstStep->computeDeliveryAt($now),
                'completed_at' => null,
                'error_message' => null,
            ],
        );
    }
}
