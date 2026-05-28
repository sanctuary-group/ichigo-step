<?php

namespace App\Console\Commands;

use App\Jobs\Scenario\DeliverScenarioStepJob;
use App\Models\FriendScenario;
use Illuminate\Console\Command;

class ProcessStepDeliveriesCommand extends Command
{
    protected $signature = 'scenarios:process-deliveries';

    protected $description = '配信予定時刻を過ぎたステップ配信をキューに投入する';

    public function handle(): int
    {
        $ids = FriendScenario::withoutGlobalScopes()
            ->where('status', 'active')
            ->where('next_delivery_at', '<=', now())
            ->orderBy('next_delivery_at')
            ->limit(100)
            ->pluck('id');

        foreach ($ids as $id) {
            DeliverScenarioStepJob::dispatch($id);
            $this->info("dispatched friend_scenario #{$id}");
        }

        return self::SUCCESS;
    }
}
