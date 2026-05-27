<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Jobs\Line\ProcessLineEventJob;
use App\Models\LineChannel;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class LineWebhookController extends Controller
{
    public function store(Request $request): Response
    {
        /** @var LineChannel $channel */
        $channel = $request->attributes->get('lineChannel');

        foreach ((array) $request->input('events', []) as $event) {
            if (! is_array($event)) {
                continue;
            }
            ProcessLineEventJob::dispatch($channel->id, $event);
        }

        return response()->noContent();
    }
}
