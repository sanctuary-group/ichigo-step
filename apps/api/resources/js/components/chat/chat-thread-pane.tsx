import { useForm } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPaperclip,
    faEnvelope,
    faFaceSmile,
    faPaperPlane,
    faChevronLeft,
    faCircleInfo,
    faComments,
} from "@fortawesome/free-solid-svg-icons";
import { FormEvent, useEffect, useRef } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatBubble } from "@/components/chat/chat-bubble";
import { EmptyState } from "@/components/empty-state";
import { friendDisplayName } from "@/lib/friend";
import { formatDateLabel } from "@/lib/time";
import type { Friend, Message } from "@/types/chat";

export function ChatThreadPane({
    friend,
    messages,
    mobileVisible = true,
    onBack,
    onShowInfo,
}: {
    friend: Friend | null;
    messages: Message[];
    mobileVisible?: boolean;
    onBack?: () => void;
    onShowInfo?: () => void;
}) {
    const mobileVisibilityClass = mobileVisible ? "flex" : "hidden";

    if (!friend) {
        return (
            <div
                className={`${mobileVisibilityClass} lg:flex flex-1 place-items-center bg-muted/20 min-w-0`}
            >
                <EmptyState
                    icon={faComments}
                    title="友だちを選択してください"
                    description="左の一覧からトークを開始する友だちを選びます"
                />
            </div>
        );
    }

    const name = friendDisplayName(friend);

    return (
        <div
            className={`${mobileVisibilityClass} lg:flex flex-1 flex-col min-w-0 bg-muted/20`}
        >
            <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 h-14 border-b border-border bg-background shrink-0">
                <Button
                    variant="ghost"
                    className="lg:hidden text-muted-foreground size-9 p-0"
                    onClick={onBack}
                    aria-label="一覧に戻る"
                >
                    <FontAwesomeIcon icon={faChevronLeft} className="size-4" />
                </Button>
                <Avatar className="size-8">
                    {friend.picture_url && (
                        <AvatarImage src={friend.picture_url} alt={name} />
                    )}
                    <AvatarFallback>{name.slice(0, 1)}</AvatarFallback>
                </Avatar>
                <div className="font-medium text-sm text-primary truncate min-w-0">
                    {name}
                </div>
                <div className="flex-1" />
                <Button
                    variant="ghost"
                    className="lg:hidden text-muted-foreground size-9 p-0"
                    onClick={onShowInfo}
                    aria-label="友だち情報を表示"
                >
                    <FontAwesomeIcon icon={faCircleInfo} className="size-4" />
                </Button>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-6">
                {messages.length === 0 ? (
                    <EmptyState
                        icon={faComments}
                        title="まだメッセージがありません"
                        description="LINE から最初のメッセージを送ってもらいましょう"
                    />
                ) : (
                    <div className="flex flex-col gap-3 max-w-3xl mx-auto">
                        <DateDivider
                            label={formatDateLabel(messages[0].created_at)}
                        />
                        {messages.map((m, i) => {
                            const showDate =
                                i > 0 &&
                                formatDateLabel(
                                    messages[i - 1].created_at,
                                ) !== formatDateLabel(m.created_at);
                            return (
                                <div
                                    key={m.id}
                                    className="flex flex-col gap-3"
                                >
                                    {showDate && (
                                        <DateDivider
                                            label={formatDateLabel(m.created_at)}
                                        />
                                    )}
                                    <ChatBubble message={m} />
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <Composer friend={friend} />
        </div>
    );
}

function Composer({ friend }: { friend: Friend }) {
    const form = useForm({ content: "" });
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        form.clearErrors();
        form.setData("content", "");
    }, [friend.id]);

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (! form.data.content.trim() || form.processing) return;
        form.post(`/chat/${friend.id}/messages`, {
            preserveScroll: true,
            preserveState: true,
            onSuccess: () => {
                form.reset("content");
                inputRef.current?.focus();
            },
        });
    };

    const canSend = friend.is_following && form.data.content.trim().length > 0 && ! form.processing;

    return (
        <div className="border-t border-border bg-background px-4 py-3 shrink-0">
            <form onSubmit={onSubmit} className="flex flex-col gap-2 max-w-3xl mx-auto">
                <div className="flex items-center gap-1.5">
                    <Button
                        type="button"
                        variant="ghost"
                        className="rounded-full text-muted-foreground size-9 p-0"
                        aria-label="ファイル添付"
                        disabled
                    >
                        <FontAwesomeIcon icon={faPaperclip} className="size-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className="rounded-full text-muted-foreground size-9 p-0"
                        aria-label="テンプレート"
                        disabled
                    >
                        <FontAwesomeIcon icon={faEnvelope} className="size-4" />
                    </Button>
                    <Input
                        ref={inputRef}
                        placeholder={
                            friend.is_following
                                ? "メッセージを入力してください"
                                : "ブロック中のため送信できません"
                        }
                        className="flex-1 h-10 rounded-full bg-muted/40 border-transparent"
                        value={form.data.content}
                        onChange={(e) => form.setData("content", e.target.value)}
                        disabled={! friend.is_following || form.processing}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        className="rounded-full text-muted-foreground size-9 p-0"
                        aria-label="絵文字"
                        disabled
                    >
                        <FontAwesomeIcon icon={faFaceSmile} className="size-4" />
                    </Button>
                    <Button
                        type="submit"
                        className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 size-9 p-0"
                        aria-label="送信"
                        disabled={! canSend}
                    >
                        <FontAwesomeIcon
                            icon={faPaperPlane}
                            className="size-3.5"
                        />
                    </Button>
                </div>
                {form.errors.content && (
                    <div className="text-[11px] text-destructive text-center">
                        {form.errors.content}
                    </div>
                )}
            </form>
        </div>
    );
}

function DateDivider({ label }: { label: string }) {
    return (
        <div className="flex items-center gap-2 my-2 self-center">
            <span className="text-[11px] text-muted-foreground px-3 py-0.5 rounded-full bg-background border border-border">
                {label}
            </span>
        </div>
    );
}
