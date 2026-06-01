<?php

namespace App\Services\Line;

use App\Models\LineChannel;

class ChannelResolver
{
    /**
     * 指定チャネルから「現在アクティブなチャネル」を解決する。
     *
     * - 自身が is_active ならそれを返す。
     * - 停止中なら fallback_channel_id を辿り、最初に見つかった is_active を返す。
     * - 連鎖をすべて辿ってもアクティブが無ければ null。
     *
     * ループ（A→B→A 等）に陥らないよう訪問済み id を記録する。
     */
    public function activeFor(?LineChannel $intended): ?LineChannel
    {
        $seen = [];
        $current = $intended;

        while ($current && ! in_array($current->id, $seen, true)) {
            if ($current->is_active) {
                return $current;
            }

            $seen[] = $current->id;

            $current = $current->fallback_channel_id
                ? LineChannel::withoutGlobalScopes()->find($current->fallback_channel_id)
                : null;
        }

        return null;
    }
}
