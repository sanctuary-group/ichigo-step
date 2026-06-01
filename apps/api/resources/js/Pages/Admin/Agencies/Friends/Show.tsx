import { Head, Link } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faUser, faComments } from "@fortawesome/free-solid-svg-icons";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminLayout } from "@/Layouts/AdminLayout";
import { useAdminBase } from "@/lib/admin";

type TagLite = { id: number; name: string; color: string };
type FieldValue = { friend_field_id: number; value: string | null };

type FriendField = {
    id: number;
    friend_field_folder_id: number | null;
    name: string;
    field_type: string;
    options: string[] | null;
    folder?: { id: number; name: string } | null;
};

type Friend = {
    id: number;
    display_name: string | null;
    system_display_name: string | null;
    picture_url: string | null;
    status_message: string | null;
    line_user_id: string;
    source: string | null;
    note: string | null;
    is_following: boolean;
    is_hidden: boolean;
    unread_count: number;
    followed_at: string | null;
    unfollowed_at: string | null;
    last_message_at: string | null;
    channel_name: string | null;
    chat_status: { name: string; color: string } | null;
    tags: TagLite[];
    field_values: FieldValue[];
};

type PageProps = {
    agency: { id: number; name: string };
    friend: Friend;
    friendFields: FriendField[];
    messageCount: number;
};

const SOURCE_LABELS: Record<string, string> = {
    qr: "QR コード",
    card: "名刺",
    web: "Web",
    manual: "手動追加",
    other: "その他",
};

function dt(iso: string | null) {
    if (!iso) return "—";
    const d = new Date(iso);
    return d.toLocaleString("ja-JP", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
}

function displayName(f: Friend) {
    return (
        f.system_display_name?.trim() ||
        f.display_name?.trim() ||
        "(名前未取得)"
    );
}

export default function AgencyFriendShow({
    agency,
    friend,
    friendFields,
    messageCount,
}: PageProps) {
    const base = useAdminBase();
    const valueOf = (fieldId: number) =>
        friend.field_values.find((v) => v.friend_field_id === fieldId)?.value ??
        "";

    return (
        <>
            <Head title={displayName(friend)} />
            <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-4xl">
                <div className="flex items-center gap-3">
                    <Link
                        href={`${base}/agencies/${agency.id}/friends`}
                        className="grid place-items-center size-9 rounded-md hover:bg-muted text-muted-foreground"
                        aria-label="友だち一覧に戻る"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="size-4" />
                    </Link>
                    <h1 className="text-xl font-bold tracking-tight">
                        友だち詳細
                    </h1>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        閲覧専用
                    </span>
                </div>

                {/* ヘッダーカード */}
                <Card>
                    <CardContent className="p-5 flex items-center gap-4">
                        <div className="relative flex shrink-0 items-center justify-center overflow-hidden rounded-full size-14">
                            {friend.picture_url ? (
                                <img
                                    src={friend.picture_url}
                                    alt=""
                                    className="size-full object-cover"
                                />
                            ) : (
                                <div className="size-full bg-gradient-to-br from-zinc-500 to-zinc-700 flex items-center justify-center text-white">
                                    <FontAwesomeIcon
                                        icon={faUser}
                                        className="size-1/2"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-lg font-bold truncate">
                                    {displayName(friend)}
                                </span>
                                <StateBadge friend={friend} />
                                {friend.chat_status && (
                                    <span
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold"
                                        style={{
                                            backgroundColor: `${friend.chat_status.color}22`,
                                            color: friend.chat_status.color,
                                        }}
                                    >
                                        {friend.chat_status.name}
                                    </span>
                                )}
                            </div>
                            {friend.status_message && (
                                <p className="text-xs text-muted-foreground mt-1 truncate">
                                    {friend.status_message}
                                </p>
                            )}
                        </div>
                        <div className="text-right shrink-0">
                            <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
                                <FontAwesomeIcon
                                    icon={faComments}
                                    className="size-3"
                                />
                                メッセージ
                            </div>
                            <div className="text-xl font-bold tabular-nums">
                                {messageCount.toLocaleString()}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* 基本情報 */}
                <Card>
                    <CardHeader>
                        <CardTitle>基本情報</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <dl className="divide-y divide-border">
                            <Row label="LINE名" value={friend.display_name ?? "—"} />
                            <Row
                                label="システム表示名"
                                value={friend.system_display_name ?? "—"}
                            />
                            <Row
                                label="LINE ユーザーID"
                                value={friend.line_user_id}
                                mono
                            />
                            <Row
                                label="チャネル"
                                value={friend.channel_name ?? "—"}
                            />
                            <Row
                                label="友だち追加日時"
                                value={`${dt(friend.followed_at)}（${SOURCE_LABELS[friend.source ?? ""] ?? "未設定"}）`}
                            />
                            <Row
                                label="最終メッセージ受信"
                                value={dt(friend.last_message_at)}
                            />
                            <Row
                                label="未読数"
                                value={String(friend.unread_count)}
                            />
                            {!friend.is_following && (
                                <Row
                                    label="ブロック日時"
                                    value={dt(friend.unfollowed_at)}
                                />
                            )}
                        </dl>
                    </CardContent>
                </Card>

                {/* 友だち情報（カスタム項目） */}
                <Card>
                    <CardHeader>
                        <CardTitle>友だち情報</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        {friendFields.length === 0 ? (
                            <p className="p-5 text-sm text-muted-foreground">
                                カスタム項目が登録されていません。
                            </p>
                        ) : (
                            <dl className="divide-y divide-border">
                                {friendFields.map((field) => (
                                    <Row
                                        key={field.id}
                                        label={field.name}
                                        value={valueOf(field.id) || "—"}
                                    />
                                ))}
                            </dl>
                        )}
                    </CardContent>
                </Card>

                {/* タグ */}
                <Card>
                    <CardHeader>
                        <CardTitle>タグ</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {friend.tags.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                タグが付与されていません。
                            </p>
                        ) : (
                            <div className="flex items-center gap-1.5 flex-wrap">
                                {friend.tags.map((t) => (
                                    <TagChip key={t.id} tag={t} />
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* メモ */}
                {friend.note && (
                    <Card>
                        <CardHeader>
                            <CardTitle>メモ</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm whitespace-pre-wrap text-foreground">
                                {friend.note}
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

AgencyFriendShow.layout = (page: React.ReactNode) => (
    <AdminLayout>{page}</AdminLayout>
);

function Row({
    label,
    value,
    mono,
}: {
    label: string;
    value: string;
    mono?: boolean;
}) {
    return (
        <div className="grid grid-cols-[140px_1fr] gap-3 px-5 py-3">
            <dt className="text-sm text-muted-foreground">{label}</dt>
            <dd
                className={`text-sm text-foreground break-all ${mono ? "font-mono" : ""}`}
            >
                {value}
            </dd>
        </div>
    );
}

function StateBadge({ friend }: { friend: Friend }) {
    if (!friend.is_following) {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-destructive/15 text-destructive">
                ブロック
            </span>
        );
    }
    if (friend.is_hidden) {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-muted text-muted-foreground">
                非表示
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-primary/15 text-primary">
            アクティブ
        </span>
    );
}

function TagChip({ tag }: { tag: TagLite }) {
    return (
        <span
            className="inline-flex items-center gap-1 rounded-full font-medium border h-6 px-2 text-xs"
            style={{
                backgroundColor: hexToRgba(tag.color, 0.12),
                borderColor: hexToRgba(tag.color, 0.4),
                color: tag.color,
            }}
        >
            <span
                className="inline-block size-1.5 rounded-full"
                style={{ backgroundColor: tag.color }}
            />
            {tag.name}
        </span>
    );
}

function hexToRgba(hex: string, alpha: number): string {
    const normalized = hex.replace("#", "");
    const r = parseInt(normalized.slice(0, 2), 16);
    const g = parseInt(normalized.slice(2, 4), 16);
    const b = parseInt(normalized.slice(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
