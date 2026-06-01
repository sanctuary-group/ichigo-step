<?php

namespace App\Services;

use App\Models\Friend;
use App\Models\LineChannel;
use App\Models\QrAction;
use App\Models\QrAttribution;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class QrActionApplier
{
    /**
     * QR アクションを友だちに適用する（タグ付与 / シナリオ開始 / 流入元記録）。
     */
    public static function apply(QrAction $qr, Friend $friend): void
    {
        // 流入元を QR に（未設定時のみ）
        if (blank($friend->source)) {
            $friend->forceFill(['source' => 'qr'])->save();
        }

        switch ($qr->action_type) {
            case 'add_tag':
                if ($qr->action_tag_id) {
                    $friend->tags()->syncWithoutDetaching([
                        $qr->action_tag_id => ['assigned_at' => Carbon::now()],
                    ]);
                    // タグ付与トリガーのシナリオも発火させる
                    ScenarioEnroller::enroll($friend, 'tag_added', $qr->action_tag_id);
                }
                break;

            case 'start_scenario':
                if ($qr->action_scenario_id) {
                    ScenarioEnroller::enrollOne($friend, $qr->action_scenario_id);
                }
                break;

            // track_source / none は source 記録のみ
        }

        QrAction::withoutGlobalScopes()->where('id', $qr->id)->increment('follow_count');
    }

    /**
     * LIFF で記録された未消費の紐付けを follow 時に解決して適用する。
     *
     * @param  bool  $isNewFriend  新規友だち追加か
     * @param  bool  $isUnblock     ブロック解除での再追加か
     */
    public static function applyPending(Friend $friend, LineChannel $channel, bool $isNewFriend, bool $isUnblock): void
    {
        $attribution = QrAttribution::where('line_channel_id', $channel->id)
            ->where('line_user_id', $friend->line_user_id)
            ->whereNull('consumed_at')
            ->where('expires_at', '>', Carbon::now())
            ->orderByDesc('id')
            ->first();

        if (! $attribution) {
            return;
        }

        $qr = QrAction::withoutGlobalScopes()->find($attribution->qr_action_id);

        // audience='new' は新規追加時のみ発火、'all' は新規/解除どちらでも発火
        $shouldApply = $qr && $qr->is_active && (
            $qr->audience === 'all' || ($qr->audience === 'new' && $isNewFriend)
        );

        if ($shouldApply) {
            self::apply($qr, $friend);
        }

        // 二重発火防止のため消費済みにする（適用条件を満たさなくても消費）
        $attribution->forceFill(['consumed_at' => Carbon::now()])->save();
    }

    /**
     * LIFF 着地時点での適用（既存の友だちが再スキャンしたケース）。
     * 未追加なら何もせず（follow webhook で applyPending が拾う）、
     * 既に友だちなら audience に応じて即時適用する。
     *
     * @return bool 即時適用したか
     */
    public static function applyNowIfFriendExists(QrAction $qr, LineChannel $channel, string $lineUserId): bool
    {
        $friend = Friend::withoutGlobalScopes()
            ->where('line_channel_id', $channel->id)
            ->where('line_user_id', $lineUserId)
            ->first();

        // 未追加 or ブロック中なら follow を待つ
        if (! $friend || ! $friend->is_following) {
            return false;
        }

        // 既存友だちは「新規」ではないので audience='new' は対象外
        if ($qr->audience !== 'all') {
            return true; // 既に友だち & new 対象 → 何もしないが follow も来ないので消費扱い
        }

        DB::transaction(fn () => self::apply($qr, $friend));

        return true;
    }
}
