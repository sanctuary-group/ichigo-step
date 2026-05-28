<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

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

    /**
     * 指定アンカー時刻 (前ステップ送信時刻 or enroll 時刻) からこのステップの配信時刻を計算する。
     *
     * - immediate: anchor をそのまま返す
     * - elapsed:   anchor + delay_minutes (分単位の経過時間)
     * - datetime:  anchor から N 日後の HH:MM (壁時計)。過去なら翌日にスライド
     *              N = floor(delay_minutes / 1440), HH:MM = delay_minutes % 1440
     */
    public function computeDeliveryAt(Carbon $anchor): Carbon
    {
        $anchor = $anchor->copy();

        if ($this->timing_mode === 'immediate' || (int) $this->delay_minutes === 0) {
            return $anchor;
        }

        if ($this->timing_mode === 'datetime') {
            $minutes = (int) $this->delay_minutes;
            $days = intdiv($minutes, 1440);
            $timeOfDay = $minutes % 1440;
            $hour = intdiv($timeOfDay, 60);
            $minute = $timeOfDay % 60;

            $target = $anchor->copy()
                ->addDays($days)
                ->setTime($hour, $minute, 0);

            // 過去 (アンカー以下) なら翌日同時刻にスライド
            if ($target->lessThanOrEqualTo($anchor)) {
                $target->addDay();
            }
            return $target;
        }

        // elapsed (default)
        return $anchor->addMinutes((int) $this->delay_minutes);
    }
}
