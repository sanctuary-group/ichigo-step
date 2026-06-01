import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faCopy,
    faDownload,
    faCircleQuestion,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { LineChannel } from "@/types/broadcast";

export function FriendAddUrlCard({ channel }: { channel: LineChannel | null }) {
    const [copied, setCopied] = useState(false);

    // 追跡リダイレクト URL（/add/{token}）。BAN 後はアクティブ/予備チャネルへ自動追従する。
    // 未設定時は basic_id からの直リンクにフォールバック。
    const trackedUrl =
        channel?.friend_add_url ??
        (channel?.basic_id
            ? `https://line.me/R/ti/p/${encodeURIComponent(channel.basic_id)}`
            : null);
    const url = trackedUrl ?? "（@basic_id が未設定です）";

    const onCopy = async () => {
        if (!trackedUrl) return;
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            /* clipboard not available */
        }
    };

    return (
        <Card>
            <CardContent className="p-4 space-y-3">
                <div className="text-sm font-bold">友だち追加URL</div>
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-6 items-start">
                    <div className="space-y-2">
                        <div className="relative">
                            <Input
                                value={url}
                                readOnly
                                className="h-10 pr-10 bg-muted/30"
                            />
                            <button
                                type="button"
                                onClick={onCopy}
                                disabled={!trackedUrl}
                                className="absolute right-2 top-1/2 -translate-y-1/2 grid place-items-center size-7 rounded hover:bg-muted text-muted-foreground disabled:opacity-40"
                                aria-label="URLをコピー"
                            >
                                <FontAwesomeIcon
                                    icon={faCopy}
                                    className="size-3.5"
                                />
                            </button>
                            {copied && (
                                <span className="absolute right-10 top-1/2 -translate-y-1/2 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                                    コピー済
                                </span>
                            )}
                        </div>
                        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                            <FontAwesomeIcon
                                icon={faCircleQuestion}
                                className="size-3.5"
                            />
                            このURLを友だちに送ると公式アカウントに追加されます（BAN時は予備アカウントへ自動誘導）
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="size-28 grid place-items-center rounded-md border border-border bg-background p-2 text-[10px] text-muted-foreground text-center">
                            QR コード
                            <br />
                            (実装予定)
                        </div>
                        <button
                            type="button"
                            disabled
                            className="grid place-items-center size-8 rounded hover:bg-muted text-muted-foreground self-end opacity-40"
                            aria-label="QRコードをダウンロード"
                        >
                            <FontAwesomeIcon
                                icon={faDownload}
                                className="size-3.5"
                            />
                        </button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
