<?php

namespace App\Console\Commands;

use App\Jobs\Broadcast\DispatchBroadcastJob;
use App\Models\Broadcast;
use Illuminate\Console\Command;

class ProcessScheduledBroadcastsCommand extends Command
{
    protected $signature = 'broadcasts:process-scheduled';

    protected $description = '配信予定時刻を過ぎた配信を順次キューに投入する';

    public function handle(): int
    {
        $now = now();

        $ids = Broadcast::withoutGlobalScopes()
            ->where('status', 'scheduled')
            ->where('scheduled_at', '<=', $now)
            ->orderBy('scheduled_at')
            ->limit(50)
            ->pluck('id');

        foreach ($ids as $id) {
            DispatchBroadcastJob::dispatch($id);
            $this->info("dispatched broadcast #{$id}");
        }

        return self::SUCCESS;
    }
}
