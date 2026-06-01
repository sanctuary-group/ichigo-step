import { Head, Link, useForm } from "@inertiajs/react";
import { FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminLayout } from "@/Layouts/AdminLayout";
import { useAdminBase } from "@/lib/admin";
import {
    ImportanceBadge,
    StatusBadge,
    type Importance,
    type Status,
} from "@/components/admin/announcement-badges";

type AnnouncementData = {
    id: number;
    title: string;
    body: string;
    importance: Importance;
    status: Status;
    published_at: string | null;
};

type PageProps = {
    announcement: AnnouncementData | null;
};

export default function AnnouncementForm({ announcement }: PageProps) {
    const base = useAdminBase();
    const isEdit = !!announcement;

    const form = useForm({
        title: announcement?.title ?? "",
        body: announcement?.body ?? "",
        importance: (announcement?.importance ?? "normal") as Importance,
        status: (announcement?.status ?? "draft") as Status,
    });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        if (isEdit) {
            form.patch(`${base}/announcements/${announcement!.id}`);
        } else {
            form.post(`${base}/announcements`);
        }
    };

    return (
        <>
            <Head title={isEdit ? "お知らせ編集" : "お知らせ作成"} />
            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-3xl">
                <div className="flex items-center gap-3">
                    <Link
                        href={`${base}/announcements`}
                        className="grid place-items-center size-9 rounded-md hover:bg-muted text-muted-foreground"
                        aria-label="一覧に戻る"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="size-4" />
                    </Link>
                    <h1 className="text-xl font-bold tracking-tight">
                        {isEdit ? "お知らせ編集" : "お知らせ作成"}
                    </h1>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <Card>
                        <CardContent className="p-5 space-y-5">
                            <div className="space-y-1.5">
                                <Label htmlFor="title">タイトル</Label>
                                <Input
                                    id="title"
                                    value={form.data.title}
                                    onChange={(e) =>
                                        form.setData("title", e.target.value)
                                    }
                                    placeholder="例: メンテナンスのお知らせ"
                                    autoFocus
                                />
                                {form.errors.title && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.title}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="body">本文</Label>
                                <textarea
                                    id="body"
                                    value={form.data.body}
                                    onChange={(e) =>
                                        form.setData("body", e.target.value)
                                    }
                                    rows={8}
                                    placeholder="お知らせの内容を入力してください"
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-y focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                />
                                {form.errors.body && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.body}
                                    </p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <div className="space-y-1.5">
                                    <Label htmlFor="importance">
                                        重要度
                                    </Label>
                                    <select
                                        id="importance"
                                        value={form.data.importance}
                                        onChange={(e) =>
                                            form.setData(
                                                "importance",
                                                e.target.value as Importance,
                                            )
                                        }
                                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                                    >
                                        <option value="normal">通常</option>
                                        <option value="important">重要</option>
                                        <option value="maintenance">
                                            メンテナンス
                                        </option>
                                    </select>
                                </div>

                                <div className="space-y-1.5">
                                    <Label htmlFor="status">公開状態</Label>
                                    <select
                                        id="status"
                                        value={form.data.status}
                                        onChange={(e) =>
                                            form.setData(
                                                "status",
                                                e.target.value as Status,
                                            )
                                        }
                                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                                    >
                                        <option value="draft">
                                            下書き（非公開）
                                        </option>
                                        <option value="published">
                                            公開
                                        </option>
                                    </select>
                                </div>
                            </div>

                            <div className="rounded-md bg-muted/40 px-4 py-3 space-y-2">
                                <div className="text-xs text-muted-foreground">
                                    プレビュー
                                </div>
                                <div className="flex items-center gap-2 flex-wrap">
                                    <ImportanceBadge
                                        importance={form.data.importance}
                                    />
                                    <StatusBadge status={form.data.status} />
                                    <span className="font-bold text-sm">
                                        {form.data.title || "（タイトル未入力）"}
                                    </span>
                                </div>
                                {form.data.status === "draft" && (
                                    <p className="text-xs text-muted-foreground">
                                        ※下書きのままでは代理店ホームに表示されません。
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center justify-end gap-3">
                        <Link href={`${base}/announcements`}>
                            <Button type="button" variant="outline">
                                キャンセル
                            </Button>
                        </Link>
                        <Button type="submit" disabled={form.processing}>
                            {form.processing
                                ? "保存中..."
                                : isEdit
                                  ? "更新する"
                                  : "作成する"}
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

AnnouncementForm.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);
