<?php

namespace App\Console\Commands;

use App\Models\LineChannel;
use App\Services\Line\ChannelHealthMonitor;
use Illuminate\Console\Command;

class CheckChannelHealthCommand extends Command
{
    protected $signature = 'channels:check-health {--channel= : 特定の line_channel_id だけチェック}';

    protected $description = '全 LINE チャネル (or 指定の 1 件) に対して /v2/bot/info を ping し健全性を判定';

    public function handle(ChannelHealthMonitor $monitor): int
    {
        $query = LineChannel::withoutGlobalScopes();
        if ($id = $this->option('channel')) {
            $query->where('id', (int) $id);
        }

        $channels = $query->get();
        foreach ($channels as $channel) {
            $log = $monitor->check($channel);
            $this->info("#{$channel->id} {$channel->name} → {$log->risk_level} (http={$log->http_status})");
        }

        return self::SUCCESS;
    }
}
