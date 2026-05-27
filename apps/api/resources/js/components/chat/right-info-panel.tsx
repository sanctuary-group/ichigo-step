import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faDatabase,
    faAddressCard,
    faTag as faTagSolid,
    faNoteSticky,
    faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";

import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { TagBadge } from "@/components/tag-badge";
import { formatDateTime } from "@/lib/time";
import type { Friend } from "@/types/chat";

export function RightInfoPanel({
    friend,
    mobileVisible = false,
    onBack,
}: {
    friend: Friend;
    mobileVisible?: boolean;
    onBack?: () => void;
}) {
    const tags = friend.tags ?? [];
    const name = friend.display_name ?? "(名前未取得)";

    return (
        <aside
            className={`${mobileVisible ? "flex" : "hidden"} xl:flex w-full xl:w-80 shrink-0 flex-col border-l border-border bg-background`}
        >
            <div className="flex items-center gap-2 h-12 px-3 border-b border-border xl:hidden">
                <Button
                    variant="ghost"
                    className="text-muted-foreground size-9 p-0"
                    onClick={onBack}
                    aria-label="トークに戻る"
                >
                    <FontAwesomeIcon icon={faChevronLeft} className="size-4" />
                </Button>
                <div className="text-sm font-medium">友だち情報</div>
            </div>
            <Tabs defaultValue="basic" className="flex-1 flex flex-col min-h-0">
                <TabsList className="mx-3 mt-3 grid grid-cols-4 h-9 bg-muted/60 w-auto">
                    <TabsTrigger value="basic" aria-label="基本情報">
                        <FontAwesomeIcon icon={faDatabase} className="size-3.5" />
                    </TabsTrigger>
                    <TabsTrigger value="profile" aria-label="友だち情報">
                        <FontAwesomeIcon
                            icon={faAddressCard}
                            className="size-3.5"
                        />
                    </TabsTrigger>
                    <TabsTrigger value="tags" aria-label="タグ">
                        <FontAwesomeIcon icon={faTagSolid} className="size-3.5" />
                    </TabsTrigger>
                    <TabsTrigger value="memo" aria-label="メモ">
                        <FontAwesomeIcon
                            icon={faNoteSticky}
                            className="size-3.5"
                        />
                    </TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-y-auto p-4 space-y-5">
                    <TabsContent value="basic" className="space-y-5">
                        <SectionTitle>基本情報</SectionTitle>

                        <InfoRow label="LINE名">
                            <div className="text-sm">{name}</div>
                            {friend.followed_at && (
                                <div className="text-[11px] text-muted-foreground mt-0.5">
                                    {formatDateTime(friend.followed_at)} 友だち追加
                                </div>
                            )}
                        </InfoRow>

                        {friend.status_message && (
                            <InfoRow label="ステータスメッセージ">
                                <div className="text-sm">
                                    {friend.status_message}
                                </div>
                            </InfoRow>
                        )}

                        <InfoRow label="LINE userId">
                            <div className="text-xs font-mono text-muted-foreground break-all">
                                {friend.line_user_id}
                            </div>
                        </InfoRow>
                    </TabsContent>

                    <TabsContent value="profile" className="space-y-3">
                        <SectionTitle>友だち情報</SectionTitle>
                        <InfoRow label="フォロー状態">
                            <div className="text-sm">
                                {friend.is_following
                                    ? "アクティブ"
                                    : "ブロック済み"}
                            </div>
                        </InfoRow>
                        {friend.unfollowed_at && (
                            <InfoRow label="ブロック日時">
                                <div className="text-sm text-muted-foreground">
                                    {formatDateTime(friend.unfollowed_at)}
                                </div>
                            </InfoRow>
                        )}
                    </TabsContent>

                    <TabsContent value="tags" className="space-y-3">
                        <SectionTitle>タグ</SectionTitle>
                        <div className="flex flex-wrap gap-1.5">
                            {tags.length === 0 ? (
                                <div className="text-xs text-muted-foreground">
                                    タグはまだありません
                                </div>
                            ) : (
                                tags.map((t) => <TagBadge key={t.id} tag={t} />)
                            )}
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            disabled
                        >
                            タグを追加（次フェーズ）
                        </Button>
                    </TabsContent>

                    <TabsContent value="memo" className="space-y-3">
                        <SectionTitle>メモ</SectionTitle>
                        <div className="text-xs text-muted-foreground italic">
                            メモはまだありません
                        </div>
                    </TabsContent>
                </div>
            </Tabs>
        </aside>
    );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
    return (
        <div className="text-sm font-semibold text-foreground/90">
            {children}
        </div>
    );
}

function InfoRow({
    label,
    children,
}: {
    label: string;
    children: React.ReactNode;
}) {
    return (
        <div>
            <div className="flex items-center gap-2 mb-1.5">
                <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide">
                    {label}
                </div>
            </div>
            <div>{children}</div>
        </div>
    );
}
