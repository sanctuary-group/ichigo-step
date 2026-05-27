import { Head, router, useForm, usePage } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPlus,
    faTrash,
    faEye,
    faEyeSlash,
    faPlug,
} from "@fortawesome/free-solid-svg-icons";
import { FormEvent, useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsLayout } from "@/Layouts/SettingsLayout";

type Channel = {
    id: number;
    name: string;
    basic_id: string | null;
    channel_id: string;
    liff_id: string | null;
    is_active: boolean;
};

type PageProps = {
    channels: Channel[];
    flash?: { success?: string; error?: string };
};

export default function Channels() {
    const { props } = usePage<PageProps>();
    const [showAdd, setShowAdd] = useState(false);
    const [toast, setToast] = useState<
        { kind: "success" | "error"; text: string } | null
    >(null);

    useEffect(() => {
        if (props.flash?.success) {
            setToast({ kind: "success", text: props.flash.success });
        } else if (props.flash?.error) {
            setToast({ kind: "error", text: props.flash.error });
        }
    }, [props.flash?.success, props.flash?.error]);

    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(null), 5000);
        return () => clearTimeout(t);
    }, [toast]);

    const handleDelete = (channel: Channel) => {
        if (!confirm(`「${channel.name}」を削除しますか？`)) return;
        router.delete(`/settings/channels/${channel.id}`, {
            preserveScroll: true,
        });
    };

    const handleTest = (channel: Channel) => {
        router.post(
            `/settings/channels/${channel.id}/test`,
            {},
            { preserveScroll: true },
        );
    };

    return (
        <>
            <Head title="LINE チャネル" />
            <div className="space-y-6">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h2 className="text-lg font-semibold">LINE チャネル</h2>
                        <p className="text-xs text-muted-foreground mt-1">
                            複数の LINE 公式アカウントを束ねて管理できます
                        </p>
                    </div>
                    <Button onClick={() => setShowAdd((v) => !v)}>
                        <FontAwesomeIcon icon={faPlus} className="size-3.5" />
                        チャネルを追加
                    </Button>
                </div>

                {toast && (
                    <div
                        className={
                            toast.kind === "success"
                                ? "rounded-md px-3 py-2 text-sm bg-primary/10 text-primary"
                                : "rounded-md px-3 py-2 text-sm bg-destructive/10 text-destructive"
                        }
                    >
                        {toast.text}
                    </div>
                )}

                <div className="space-y-3">
                    {props.channels.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="p-6 text-center text-sm text-muted-foreground">
                                まだチャネルが登録されていません
                            </CardContent>
                        </Card>
                    ) : (
                        props.channels.map((c) => (
                            <Card key={c.id}>
                                <CardContent className="p-4 flex items-center gap-4">
                                    <div className="grid place-items-center size-11 rounded-xl bg-primary/10 text-primary font-bold">
                                        {c.name.slice(0, 1)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-medium truncate">
                                            {c.name}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate">
                                            {c.basic_id ?? c.channel_id}
                                        </div>
                                    </div>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleTest(c)}
                                    >
                                        <FontAwesomeIcon
                                            icon={faPlug}
                                            className="size-3.5"
                                        />
                                        接続テスト
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        aria-label="削除"
                                        className="text-muted-foreground hover:text-destructive size-9 p-0"
                                        onClick={() => handleDelete(c)}
                                    >
                                        <FontAwesomeIcon
                                            icon={faTrash}
                                            className="size-3.5"
                                        />
                                    </Button>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {showAdd && <AddChannelCard onClose={() => setShowAdd(false)} />}

                <Card className="border-dashed">
                    <CardContent className="p-4 text-xs text-muted-foreground space-y-2">
                        <div className="font-medium text-foreground">
                            Webhook URL
                        </div>
                        <code className="block bg-muted/60 rounded p-2 font-mono text-[11px] break-all">
                            POST {window?.location?.origin ?? ""}
                            /api/line/webhook/{"{channelId}"}
                        </code>
                        <p>
                            LINE Developers の Messaging API 設定で、登録したチャネルの Channel ID を {"{channelId}"} に当てはめた URL を設定してください。
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

function AddChannelCard({ onClose }: { onClose: () => void }) {
    const [showSecret, setShowSecret] = useState(false);
    const [showToken, setShowToken] = useState(false);
    const form = useForm({
        name: "",
        basic_id: "",
        channel_id: "",
        channel_secret: "",
        channel_access_token: "",
        liff_id: "",
    });

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        form.post("/settings/channels", {
            preserveScroll: true,
            onSuccess: () => {
                form.reset();
                onClose();
            },
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>新しいチャネルを追加</CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={onSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label htmlFor="ch-name">表示名（社内管理用）</Label>
                        <Input
                            id="ch-name"
                            placeholder="例: 株式会社サンプル 公式LINE"
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData("name", e.target.value)
                            }
                        />
                        {form.errors.name && (
                            <p className="text-xs text-destructive">
                                {form.errors.name}
                            </p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor="ch-id">Channel ID</Label>
                            <Input
                                id="ch-id"
                                placeholder="1234567890"
                                value={form.data.channel_id}
                                onChange={(e) =>
                                    form.setData("channel_id", e.target.value)
                                }
                            />
                            {form.errors.channel_id && (
                                <p className="text-xs text-destructive">
                                    {form.errors.channel_id}
                                </p>
                            )}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="ch-basic">Basic ID（@xxx）</Label>
                            <Input
                                id="ch-basic"
                                placeholder="@example"
                                value={form.data.basic_id}
                                onChange={(e) =>
                                    form.setData("basic_id", e.target.value)
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="ch-secret">Channel Secret</Label>
                        <div className="relative">
                            <Input
                                id="ch-secret"
                                type={showSecret ? "text" : "password"}
                                placeholder="LINE Developers Console から取得"
                                className="pr-9"
                                value={form.data.channel_secret}
                                onChange={(e) =>
                                    form.setData(
                                        "channel_secret",
                                        e.target.value,
                                    )
                                }
                            />
                            <button
                                type="button"
                                onClick={() => setShowSecret((v) => !v)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label="表示切替"
                            >
                                <FontAwesomeIcon
                                    icon={showSecret ? faEyeSlash : faEye}
                                    className="size-3.5"
                                />
                            </button>
                        </div>
                        {form.errors.channel_secret && (
                            <p className="text-xs text-destructive">
                                {form.errors.channel_secret}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="ch-token">Channel Access Token</Label>
                        <div className="relative">
                            <Input
                                id="ch-token"
                                type={showToken ? "text" : "password"}
                                placeholder="長期トークン"
                                className="pr-9"
                                value={form.data.channel_access_token}
                                onChange={(e) =>
                                    form.setData(
                                        "channel_access_token",
                                        e.target.value,
                                    )
                                }
                            />
                            <button
                                type="button"
                                onClick={() => setShowToken((v) => !v)}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                aria-label="表示切替"
                            >
                                <FontAwesomeIcon
                                    icon={showToken ? faEyeSlash : faEye}
                                    className="size-3.5"
                                />
                            </button>
                        </div>
                        {form.errors.channel_access_token && (
                            <p className="text-xs text-destructive">
                                {form.errors.channel_access_token}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label htmlFor="ch-liff">LIFF ID（任意）</Label>
                        <Input
                            id="ch-liff"
                            placeholder="2000xxxxxx-xxxxxxxx"
                            value={form.data.liff_id}
                            onChange={(e) =>
                                form.setData("liff_id", e.target.value)
                            }
                        />
                    </div>

                    <div className="flex items-center justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={form.processing}
                        >
                            キャンセル
                        </Button>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing ? "登録中..." : "登録"}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

Channels.layout = (page: React.ReactNode) => (
    <SettingsLayout>{page}</SettingsLayout>
);
