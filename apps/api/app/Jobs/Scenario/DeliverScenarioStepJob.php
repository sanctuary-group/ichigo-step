<?php

namespace App\Jobs\Scenario;

use App\Models\FriendScenario;
use App\Models\Message;
use App\Models\ScenarioStep;
use App\Services\Line\LineClient;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Throwable;

class DeliverScenarioStepJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 1;
    public int $timeout = 30;

    public function __construct(public int $friendScenarioId) {}

    public function handle(): void
    {
        $fs = FriendScenario::withoutGlobalScopes()
            ->with(['friend.lineChannel', 'scenario'])
            ->find($this->friendScenarioId);

        if (! $fs) {
            return;
        }

        // 楽観ロック: status=active かつ current_step_order が変わっていない場合のみ delivering へ
        $claimed = FriendScenario::withoutGlobalScopes()
            ->where('id', $fs->id)
            ->where('current_step_order', $fs->current_step_order)
            ->where('status', 'active')
            ->update(['status' => 'delivering']);

        if ($claimed === 0) {
            return;
        }

        // claim 直後に DB と同期: 後の forceFill->save() で status を確実に書き戻すため
        $fs->refresh();

        $friend = $fs->friend;
        if (! $friend || ! $friend->is_following) {
            $fs->forceFill([
                'status' => 'completed',
                'completed_at' => now(),
                'error_message' => 'ブロック済み / 友だち削除',
            ])->save();
            return;
        }

        $nextStep = ScenarioStep::where('scenario_id', $fs->scenario_id)
            ->where('step_order', '>', $fs->current_step_order)
            ->orderBy('step_order')
            ->first();

        if (! $nextStep) {
            $fs->forceFill([
                'status' => 'completed',
                'completed_at' => now(),
                'next_delivery_at' => null,
            ])->save();
            return;
        }

        $channel = $friend->lineChannel;
        if (! $channel || ! $channel->is_active) {
            $fs->forceFill([
                'status' => 'failed',
                'error_message' => 'LINE チャネルが無効です',
            ])->save();
            return;
        }

        $payload = $this->buildLineMessage($nextStep);
        if (! $payload) {
            $fs->forceFill([
                'status' => 'failed',
                'error_message' => 'メッセージ内容が不正です',
            ])->save();
            return;
        }

        try {
            $result = LineClient::forChannel($channel)
                ->pushMessage($friend->line_user_id, [$payload]);
        } catch (Throwable $e) {
            Log::warning('Scenario step push failed', [
                'friend_scenario_id' => $fs->id,
                'step_order' => $nextStep->step_order,
                'error' => $e->getMessage(),
            ]);
            $fs->forceFill([
                'status' => 'failed',
                'error_message' => mb_substr($e->getMessage(), 0, 500),
            ])->save();
            return;
        }

        // メッセージ DB 記録 + Friend 更新
        Message::withoutGlobalScopes()->create([
            'organization_id' => $fs->organization_id,
            'line_channel_id' => $channel->id,
            'friend_id' => $friend->id,
            'line_message_id' => $result['request_id'] ?? null,
            'direction' => 'outgoing',
            'message_type' => $nextStep->message_type,
            'content' => $this->buildDbContent($nextStep),
            'source' => 'scenario',
            'sent_at' => now(),
        ]);

        $friend->forceFill([
            'last_message_preview' => $this->buildPreview($nextStep),
            'last_message_at' => now(),
        ])->save();

        // 次のステップの予定を計算
        $followingStep = ScenarioStep::where('scenario_id', $fs->scenario_id)
            ->where('step_order', '>', $nextStep->step_order)
            ->orderBy('step_order')
            ->first();

        if ($followingStep) {
            $fs->forceFill([
                'current_step_order' => $nextStep->step_order,
                'status' => 'active',
                'next_delivery_at' => $followingStep->computeDeliveryAt(now()),
            ])->save();
        } else {
            $fs->forceFill([
                'current_step_order' => $nextStep->step_order,
                'status' => 'completed',
                'completed_at' => now(),
                'next_delivery_at' => null,
            ])->save();
        }
    }

    private function buildLineMessage(ScenarioStep $step): ?array
    {
        if ($step->message_type === 'text') {
            $text = (string) $step->text_content;
            if ($text === '') return null;
            return ['type' => 'text', 'text' => $text];
        }
        if ($step->message_type === 'image') {
            $original = (string) $step->image_url;
            $preview = (string) ($step->image_preview_url ?: $step->image_url);
            if (! str_starts_with($original, 'https://') || ! str_starts_with($preview, 'https://')) {
                return null;
            }
            return [
                'type' => 'image',
                'originalContentUrl' => $original,
                'previewImageUrl' => $preview,
            ];
        }
        return null;
    }

    private function buildDbContent(ScenarioStep $step): string
    {
        if ($step->message_type === 'text') {
            return (string) $step->text_content;
        }
        return json_encode([
            'originalContentUrl' => (string) $step->image_url,
            'previewImageUrl' => (string) ($step->image_preview_url ?: $step->image_url),
        ], JSON_UNESCAPED_UNICODE);
    }

    private function buildPreview(ScenarioStep $step): string
    {
        if ($step->message_type === 'text') {
            return mb_substr((string) $step->text_content, 0, 50);
        }
        return '[画像]';
    }
}
