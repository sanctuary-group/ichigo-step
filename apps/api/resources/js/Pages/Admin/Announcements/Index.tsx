import { Head, Link, router } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AdminLayout } from "@/Layouts/AdminLayout";
import { useAdminBase } from "@/lib/admin";
import {
    ImportanceBadge,
    StatusBadge,
    type Importance,
    type Status,
} from "@/components/admin/announcement-badges";

type AnnouncementRow = {
    id: number;
    title: string;
    importance: Importance;
    status: Status;
    published_at: string | null;
    created_by_name: string | null;
    created_at: string | null;
};

type PageProps = {
    announcements: AnnouncementRow[];
};

function ymd(iso: string | null) {
    return iso ? iso.slice(0, 10).replace(/-/g, "/") : "—";
}

export default function AnnouncementsIndex({ announcements }: PageProps) {
    const base = useAdminBase();

    const remove = (a: AnnouncementRow) => {
        if (!confirm(`「${a.title}」を削除しますか？`)) return;
        router.delete(`${base}/announcements/${a.id}`, {
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title="お知らせ" />
            <div className="p-4 sm:p-6 lg:p-8 space-y-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">
                            お知らせ
                        </h1>
                        <p className="text-sm text-muted-foreground mt-1">
                            全代理店のホームに表示される運営からのお知らせ
                        </p>
                    </div>
                    <Link href={`${base}/announcements/create`}>
                        <Button>
                            <FontAwesomeIcon icon={faPlus} className="size-3.5" />
                            新規作成
                        </Button>
                    </Link>
                </div>

                <Card className="p-0 overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/40">
                            <tr>
                                <th className="px-4 py-3 text-left font-bold">
                                    タイトル
                                </th>
                                <th className="px-4 py-3 text-left font-bold w-32">
                                    重要度
                                </th>
                                <th className="px-4 py-3 text-left font-bold w-28">
                                    状態
                                </th>
                                <th className="px-4 py-3 text-left font-bold w-32">
                                    公開日
                                </th>
                                <th className="px-4 py-3 text-left font-bold w-28">
                                    作成者
                                </th>
                                <th className="px-4 py-3 w-24" />
                            </tr>
                        </thead>
                        <tbody>
                            {announcements.length === 0 ? (
                                <tr>
                                    <td
                                        colSpan={6}
                                        className="px-4 py-10 text-center text-sm text-muted-foreground"
                                    >
                                        お知らせがまだありません。
                                    </td>
                                </tr>
                            ) : (
                                announcements.map((a) => (
                                    <tr
                                        key={a.id}
                                        className="border-b border-border hover:bg-muted/30"
                                    >
                                        <td className="px-4 py-3">
                                            <div className="font-medium">
                                                {a.title}
                                            </div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <ImportanceBadge
                                                importance={a.importance}
                                            />
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={a.status} />
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground tabular-nums">
                                            {a.status === "published"
                                                ? ymd(a.published_at)
                                                : "—"}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            {a.created_by_name ?? "—"}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-1 justify-end">
                                                <Link
                                                    href={`${base}/announcements/${a.id}/edit`}
                                                    className="grid place-items-center size-8 rounded-md hover:bg-muted text-muted-foreground"
                                                    aria-label="編集"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faPenToSquare}
                                                        className="size-3.5"
                                                    />
                                                </Link>
                                                <button
                                                    type="button"
                                                    onClick={() => remove(a)}
                                                    className="grid place-items-center size-8 rounded-md hover:bg-destructive/10 text-destructive"
                                                    aria-label="削除"
                                                >
                                                    <FontAwesomeIcon
                                                        icon={faTrash}
                                                        className="size-3.5"
                                                    />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </Card>
            </div>
        </>
    );
}

AnnouncementsIndex.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);
