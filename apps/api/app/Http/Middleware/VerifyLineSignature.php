<?php

namespace App\Http\Middleware;

use App\Models\LineChannel;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpKernel\Exception\HttpException;

class VerifyLineSignature
{
    public function handle(Request $request, Closure $next, string $channelIdParam = 'channelId')
    {
        $channelId = (string) $request->route($channelIdParam);

        $channel = LineChannel::withoutGlobalScopes()
            ->where('channel_id', $channelId)
            ->where('is_active', true)
            ->first();

        if (! $channel) {
            throw new HttpException(404, 'Channel not found');
        }

        $signature = (string) $request->header('X-Line-Signature', '');
        $body = $request->getContent();

        $expected = base64_encode(
            hash_hmac('sha256', $body, $channel->channel_secret, true)
        );

        if ($signature === '' || ! hash_equals($expected, $signature)) {
            throw new HttpException(401, 'Invalid signature');
        }

        $request->attributes->set('lineChannel', $channel);

        return $next($request);
    }
}
