import { Head, Link, router, useForm, usePage } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faChevronRight,
    faCopy,
    faDownload,
    faTag,
    faStairs,
    faChartLine,
    faBan,
} from "@fortawesome/free-solid-svg-icons";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import type { QrAction, QrActionFolder, QrActionType, QrAudience } from "@/types/qr-action";
import type { Tag } from "@/types/broadcast";

type FolderOption = Pick<QrActionFolder, "id" | "name" | "is_system">;
type ScenarioOption = { id: number; name: string };

type PageProps = {
    qrAction: (QrAction & { public_url?: string; image_url?: string }) | null;
    folders: FolderOption[];
    scenarios: ScenarioOption[];
    defaultName?: string;
    defaultFolderId: number | null;
    defaultAudience?: QrAudience;
};

type FormShape = {
    qr_action_folder_id: number;
    name: string;
    audience: QrAudience;
    action_type: QrActionType;
    action_tag_id: number | null;
    action_scenario_id: number | null;
    is_active: boolean;
};

const ACTIONS: { value: QrActionType; label: string; icon: typeof faTag; desc: string }[] = [
    { value: "track_source", label: "流入計測のみ", icon: faChartLine, desc: "このURL経由の読み込み数を計測します" },
    { value: "add_tag", label: "タグを付与", icon: faTag, desc: "登録した友だちにタグを付けます（LIFF対応時に発火）" },
    { value: "start_scenario", label: "シナリオ開始", icon: faStairs, desc: "登録した友だちにステップ配信を開始します（LIFF対応時に発火）" },
    { value: "none", label: "なし", icon: faBan, desc: "アクションを設定しません" },
];

export default function QrActionForm({
    qrAction,
    folders,
    scenarios,
    defaultName,
    defaultFolderId,
    defaultAudience,
}: PageProps) {
    const { props } = usePage<{ tags: Tag[] }>();
    const tags = props.tags;
    const isEdit = !!qrAction;

    const form = useForm<FormShape>({
        qr_action_folder_id: qrAction?.qr_action_folder_id ?? defaultFolderId ?? folders[0]?.id ?? 0,
        name: qrAction?.name ?? defaultName ?? "",
        audience: qrAction?.audience ?? defaultAudience ?? "new",
        action_type: qrAction?.action_type ?? "track_source",
        action_tag_id: qrAction?.action_tag_id ?? null,
        action_scenario_id: qrAction?.action_scenario_id ?? null,
        is_active: qrAction?.is_active ?? true,
    });

    const [copied, setCopied] = useState(false);

    const submit = () => {
        if (isEdit) {
            form.patch(`/qr-actions/${qrAction!.id}`, { preserveScroll: true });
        } else {
            form.post("/qr-actions");
        }
    };

    const copyUrl = async () => {
        if (!qrAction?.public_url) return;
        try {
            await navigator.clipboard.writeText(qrAction.public_url);
            setCopied(true);
            setTimeout(() => setCopied(false), 1500);
        } catch {
            /* noop */
        }
    };

    return (
        <>
            <Head title={isEdit ? "QRコードアクション編集" : "QRコードアクション作成"} />
            <div className="flex-1 overflow-y-auto">
                {/* ヘッダー */}
                <div className="px-4 sm:px-6 lg:px-8 pt-4 pb-3 bg-muted/30 border-b border-border">
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <Link href="/qr-actions" className="hover:text-foreground hover:underline">TOP</Link>
                        <FontAwesomeIcon icon={faChevronRight} className="size-2.5" />
                        <span className="font-bold text-foreground">
                            QRコードアクション {isEdit ? "編集" : "新規作成"}
                        </span>
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-sm">
                        <span className="text-muted-foreground">稼働対象</span>
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary px-3 py-1 text-xs font-bold">
                            <span className="size-2 rounded-full bg-primary" />
                            {form.data.audience === "new" ? "新規友だち追加時のみ" : "全ての友だち"}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 p-4 sm:p-6 lg:p-8">
                    {/* 左: 設定 */}
                    <div className="space-y-6">
                        <section className="bg-background rounded-lg border border-border overflow-hidden">
                            <div className="px-5 py-3 bg-muted/40 border-b border-border">
                                <h2 className="text-sm font-bold">基本情報</h2>
                            </div>
                            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold">管理名</Label>
                                    <Input value={form.data.name} onChange={(e) => form.setData("name", e.target.value)} maxLength={50} className="h-10" />
                                    {form.errors.name && <p className="text-xs text-destructive">{form.errors.name}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-xs font-bold">フォルダ</Label>
                                    <select
                                        value={form.data.qr_action_folder_id}
                                        onChange={(e) => form.setData("qr_action_folder_id", Number(e.target.value))}
                                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                                    >
                                        {folders.map((f) => (
                                            <option key={f.id} value={f.id}>{f.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </section>

                        <section className="bg-background rounded-lg border border-border overflow-hidden">
                            <div className="px-5 py-3 bg-muted/40 border-b border-border">
                                <h2 className="text-sm font-bold">読み込み時アクション</h2>
                            </div>
                            <div className="p-5 space-y-4">
                                <RadioGroup
                                    value={form.data.action_type}
                                    onValueChange={(v) => v && form.setData("action_type", v as QrActionType)}
                                    className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                                >
                                    {ACTIONS.map((a) => {
                                        const sel = form.data.action_type === a.value;
                                        return (
                                            <label
                                                key={a.value}
                                                className={cn(
                                                    "flex items-start gap-3 rounded-md border-2 cursor-pointer transition-colors px-4 py-3",
                                                    sel ? "border-primary bg-primary/5" : "border-border hover:border-primary/30",
                                                )}
                                            >
                                                <RadioGroupItem value={a.value} className="mt-0.5" />
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 text-sm font-bold">
                                                        <FontAwesomeIcon icon={a.icon} className="size-3.5 text-muted-foreground" />
                                                        {a.label}
                                                    </div>
                                                    <p className="text-[11px] text-muted-foreground mt-0.5">{a.desc}</p>
                                                </div>
                                            </label>
                                        );
                                    })}
                                </RadioGroup>

                                {form.data.action_type === "add_tag" && (
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold">付与するタグ</Label>
                                        <select
                                            value={form.data.action_tag_id ?? ""}
                                            onChange={(e) => form.setData("action_tag_id", e.target.value ? Number(e.target.value) : null)}
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                                        >
                                            <option value="">選択してください</option>
                                            {tags.map((t) => (
                                                <option key={t.id} value={t.id}>{t.name}</option>
                                            ))}
                                        </select>
                                        {form.errors.action_tag_id && <p className="text-xs text-destructive">{form.errors.action_tag_id}</p>}
                                    </div>
                                )}

                                {form.data.action_type === "start_scenario" && (
                                    <div className="space-y-1.5">
                                        <Label className="text-xs font-bold">開始するシナリオ</Label>
                                        <select
                                            value={form.data.action_scenario_id ?? ""}
                                            onChange={(e) => form.setData("action_scenario_id", e.target.value ? Number(e.target.value) : null)}
                                            className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                                        >
                                            <option value="">選択してください</option>
                                            {scenarios.map((s) => (
                                                <option key={s.id} value={s.id}>{s.name}</option>
                                            ))}
                                        </select>
                                        {form.errors.action_scenario_id && <p className="text-xs text-destructive">{form.errors.action_scenario_id}</p>}
                                    </div>
                                )}

                                {(form.data.action_type === "add_tag" || form.data.action_type === "start_scenario") && (
                                    <p className="text-xs text-amber-600 dark:text-amber-400">
                                        ※ 友だちの自動紐付け（タグ/シナリオの自動発火）は LIFF 対応時に有効化されます。現状はスキャン数の計測まで動作します。
                                    </p>
                                )}
                            </div>
                        </section>

                        <section className="bg-background rounded-lg border border-border overflow-hidden">
                            <div className="px-5 py-3 bg-muted/40 border-b border-border">
                                <h2 className="text-sm font-bold">稼働設定</h2>
                            </div>
                            <div className="p-5">
                                <label className="flex items-center gap-3 text-sm cursor-pointer select-none">
                                    <Switch checked={form.data.is_active} onCheckedChange={(v) => form.setData("is_active", v)} />
                                    {form.data.is_active ? "稼働中（URLが有効）" : "停止中（URLにアクセスしても友だち追加に進みません）"}
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* 右: QR + URL */}
                    <div className="lg:sticky lg:top-6 self-start">
                        <div className="bg-background rounded-lg border border-border overflow-hidden">
                            <div className="px-4 py-2 bg-muted/40 border-b border-border text-xs font-bold text-muted-foreground text-center">
                                QRコード / 配信用URL
                            </div>
                            <div className="p-5 space-y-4">
                                {isEdit && qrAction?.image_url ? (
                                    <>
                                        <div className="mx-auto w-48 h-48 rounded-md border border-border bg-white grid place-items-center overflow-hidden">
                                            <img src={qrAction.image_url} alt="QRコード" className="w-full h-full object-contain" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <code className="flex-1 text-[11px] bg-muted rounded px-2 py-1.5 truncate">{qrAction.public_url}</code>
                                            <button onClick={copyUrl} className="shrink-0 size-8 grid place-items-center rounded hover:bg-muted text-muted-foreground" aria-label="コピー">
                                                <FontAwesomeIcon icon={faCopy} className="size-3.5" />
                                            </button>
                                        </div>
                                        {copied && <p className="text-xs text-emerald-600 dark:text-emerald-400 text-center">コピーしました</p>}
                                        <a
                                            href={qrAction.image_url}
                                            download={`qr-${qrAction.token}.png`}
                                            className="flex items-center justify-center gap-2 h-9 rounded-md border border-border text-sm hover:bg-muted"
                                        >
                                            <FontAwesomeIcon icon={faDownload} className="size-3.5" />
                                            QR画像をダウンロード
                                        </a>
                                        <div className="rounded-md bg-muted/40 border border-border p-3 text-xs text-muted-foreground space-y-1">
                                            <div>URL読込人数: <span className="font-bold text-foreground tabular-nums">{qrAction.scan_count.toLocaleString()}</span></div>
                                            <div>友だち追加: <span className="font-bold text-foreground tabular-nums">{qrAction.follow_count.toLocaleString()}</span></div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-center text-sm text-muted-foreground py-10">
                                        「保存」するとQRコードと配信用URLが発行されます。
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* フッター */}
                <div className="sticky bottom-0 flex items-center justify-center gap-4 px-4 sm:px-6 lg:px-8 py-3 bg-background border-t border-border">
                    <Button variant="outline" onClick={() => router.visit("/qr-actions")} className="h-11 px-10">戻る</Button>
                    <Button onClick={submit} disabled={form.processing} className="bg-primary text-primary-foreground hover:bg-primary/90 h-11 px-12 font-bold disabled:opacity-50">
                        {form.processing ? "保存中..." : isEdit ? "更新" : "保存してQRを発行"}
                    </Button>
                </div>
            </div>
        </>
    );
}

QrActionForm.layout = (page: React.ReactNode) => <DashboardLayout>{page}</DashboardLayout>;
