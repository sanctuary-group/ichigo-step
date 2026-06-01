<?php

namespace App\Http\Controllers;

use App\Models\Friend;
use App\Models\FriendScenario;
use App\Models\Scenario;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class FriendScenarioController extends Controller
{
    /** 手動でこの友だちをシナリオに登録（開始）する。 */
    public function enroll(Request $request, Friend $friend): RedirectResponse
    {
        $validated = $request->validate([
            'scenario_id' => ['required', 'integer', 'exists:scenarios,id'],
        ]);

        $scenario = Scenario::findOrFail($validated['scenario_id']);
        $firstStep = $scenario->steps()->orderBy('step_order')->first();

        if (! $firstStep) {
            return back()->with('flash.error', 'ステップが登録されていないため開始できません');
        }

        $now = now();
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

        return back()->with('flash.success', "「{$scenario->name}」のステップ配信を開始しました");
    }

    /** 進行中のステップ配信を強制停止する。 */
    public function stop(Friend $friend): RedirectResponse
    {
        $stopped = FriendScenario::where('friend_id', $friend->id)
            ->whereIn('status', ['active', 'delivering', 'paused'])
            ->update([
                'status' => 'completed',
                'completed_at' => now(),
                'next_delivery_at' => null,
            ]);

        return back()->with(
            'flash.success',
            $stopped > 0 ? 'ステップ配信を停止しました' : '進行中のステップ配信はありません',
        );
    }
}
