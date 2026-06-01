<?php

namespace App\Services;

use App\Models\Friend;
use App\Models\ShortLink;
use Illuminate\Support\Str;

class UrlShortener
{
    /**
     * テキスト中の http(s) URL を短縮リンクに置換して返す。
     * 公開 base URL が https でない場合はクリック不能になるため何もしない。
     */
    public function shorten(string $text, Friend $friend): string
    {
        $base = rtrim((string) config('line.public_base_url'), '/');
        if (! str_starts_with($base, 'https://')) {
            return $text;
        }

        return preg_replace_callback(
            '#https?://[^\s　]+#u',
            function (array $m) use ($friend, $base) {
                $url = $m[0];

                // 自身の短縮URLは二重短縮しない
                if (str_starts_with($url, $base.'/s/')) {
                    return $url;
                }

                $link = $this->linkFor($friend, $url);

                return $base.'/s/'.$link->token;
            },
            $text,
        );
    }

    /** 同一 (組織・友だち・URL) は再利用してクリック数を集約する。 */
    private function linkFor(Friend $friend, string $url): ShortLink
    {
        $existing = ShortLink::where('friend_id', $friend->id)
            ->where('original_url', $url)
            ->first();

        if ($existing) {
            return $existing;
        }

        return ShortLink::create([
            'line_channel_id' => $friend->line_channel_id,
            'friend_id' => $friend->id,
            'token' => $this->uniqueToken(),
            'original_url' => $url,
        ]);
    }

    private function uniqueToken(): string
    {
        do {
            $token = Str::lower(Str::random(8));
        } while (ShortLink::withoutGlobalScopes()->where('token', $token)->exists());

        return $token;
    }
}
