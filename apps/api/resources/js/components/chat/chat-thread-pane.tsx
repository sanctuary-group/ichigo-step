import { Link, router, useForm, usePage } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faPaperclip,
    faEnvelope,
    faEnvelopeOpen,
    faFaceSmile,
    faPaperPlane,
    faChevronLeft,
    faCircleInfo,
    faComments,
    faXmark,
    faBookmark,
    faAddressCard,
    faLink,
    faChevronDown,
    faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";
import {
    FormEvent,
    useEffect,
    useRef,
    useState,
} from "react";

import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ChatBubble } from "@/components/chat/chat-bubble";
import { EmptyState } from "@/components/empty-state";
import { FriendAvatar } from "@/components/friend-avatar";
import { friendDisplayName } from "@/lib/friend";
import { cn } from "@/lib/utils";
import { formatDateLabel } from "@/lib/time";
import type { ChatStatus, Friend, Message } from "@/types/chat";

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

    return (
        <div
            className={`${mobileVisibilityClass} lg:flex flex-1 flex-col min-w-0 bg-muted/20`}
        >
            <ChatHeader
                friend={friend}
                onBack={onBack}
                onShowInfo={onShowInfo}
            />

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

function ChatHeader({
    friend,
    onBack,
    onShowInfo,
}: {
    friend: Friend;
    onBack?: () => void;
    onShowInfo?: () => void;
}) {
    const { props } = usePage<{ chatStatuses?: ChatStatus[] }>();
    const chatStatuses = props.chatStatuses ?? [];
    const name = friendDisplayName(friend);
    const isPinned = !!friend.pinned_at;
    const currentStatus = chatStatuses.find(
        (s) => s.id === friend.chat_status_id,
    );

    const togglePin = () => {
        router.patch(
            `/friends/${friend.id}/pin`,
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const setChatStatus = (statusId: number | null) => {
        router.patch(
            `/friends/${friend.id}/chat-status`,
            { chat_status_id: statusId },
            { preserveScroll: true, preserveState: true },
        );
    };

    return (
        <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 h-14 border-b border-border bg-background shrink-0">
            <Button
                variant="ghost"
                className="lg:hidden text-muted-foreground size-9 p-0"
                onClick={onBack}
                aria-label="一覧に戻る"
            >
                <FontAwesomeIcon icon={faChevronLeft} className="size-4" />
            </Button>

            <Tooltip>
                <TooltipTrigger
                    render={
                        <Button
                            variant="ghost"
                            className={cn(
                                "hidden lg:inline-flex size-9 p-0",
                                isPinned
                                    ? "text-primary"
                                    : "text-muted-foreground hover:text-foreground",
                            )}
                            onClick={togglePin}
                            aria-label={isPinned ? "ピン留めを解除" : "ピン留め"}
                        />
                    }
                >
                    <FontAwesomeIcon icon={faBookmark} className="size-4" />
                </TooltipTrigger>
                <TooltipContent>
                    {isPinned ? "ピン留めを解除" : "ピン留め"}
                </TooltipContent>
            </Tooltip>

            <FriendAvatar friend={friend} className="size-8" />
            <div className="font-medium text-sm text-primary truncate min-w-0">
                {name}
            </div>

            <div className="flex-1" />

            <Tooltip>
                <TooltipTrigger
                    render={
                        <Button
                            variant="ghost"
                            className="hidden xl:inline-flex text-muted-foreground hover:text-foreground size-9 p-0"
                            disabled
                            aria-label="名刺"
                        />
                    }
                >
                    <FontAwesomeIcon icon={faAddressCard} className="size-4" />
                </TooltipTrigger>
                <TooltipContent>名刺（次フェーズ）</TooltipContent>
            </Tooltip>

            <Tooltip>
                <TooltipTrigger
                    render={
                        <Button
                            variant="ghost"
                            className="hidden xl:inline-flex text-muted-foreground hover:text-foreground size-9 p-0"
                            disabled
                            aria-label="関連リンク"
                        />
                    }
                >
                    <FontAwesomeIcon icon={faLink} className="size-4" />
                </TooltipTrigger>
                <TooltipContent>関連リンク（次フェーズ）</TooltipContent>
            </Tooltip>

            <DropdownMenu>
                <DropdownMenuTrigger
                    render={
                        <Button
                            variant="outline"
                            className="hidden sm:inline-flex h-8 rounded-full gap-1.5 text-xs px-3"
                        />
                    }
                >
                    {currentStatus ? (
                        <span
                            className="inline-flex items-center gap-1.5"
                            style={{ color: currentStatus.color }}
                        >
                            <span
                                className="inline-block size-2 rounded-full"
                                style={{ backgroundColor: currentStatus.color }}
                            />
                            {currentStatus.name}
                        </span>
                    ) : (
                        <span className="text-muted-foreground">ステータスなし</span>
                    )}
                    <FontAwesomeIcon
                        icon={faChevronDown}
                        className="size-2.5 text-muted-foreground"
                    />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-44">
                    <DropdownMenuItem
                        onClick={() => setChatStatus(null)}
                        className={
                            friend.chat_status_id === null
                                ? "bg-muted font-medium"
                                : ""
                        }
                    >
                        ステータスなし
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1" />
                    {chatStatuses.map((s) => (
                        <DropdownMenuItem
                            key={s.id}
                            onClick={() => setChatStatus(s.id)}
                            className={cn(
                                "gap-2",
                                friend.chat_status_id === s.id
                                    ? "bg-muted font-medium"
                                    : "",
                            )}
                            style={{ color: s.color }}
                        >
                            <span
                                className="inline-block size-2 rounded-full"
                                style={{ backgroundColor: s.color }}
                            />
                            {s.name}
                        </DropdownMenuItem>
                    ))}
                </DropdownMenuContent>
            </DropdownMenu>

            <Tooltip>
                <TooltipTrigger
                    render={
                        <Link
                            href="/chat/settings"
                            className="hidden xl:inline-flex items-center justify-center rounded-lg size-9 text-muted-foreground hover:text-foreground hover:bg-muted dark:hover:bg-muted/50 transition-colors"
                            aria-label="チャット設定"
                        />
                    }
                >
                    <FontAwesomeIcon icon={faPenToSquare} className="size-4" />
                </TooltipTrigger>
                <TooltipContent>チャット設定</TooltipContent>
            </Tooltip>

            <Button
                variant="ghost"
                className="lg:hidden text-muted-foreground size-9 p-0"
                onClick={onShowInfo}
                aria-label="友だち情報を表示"
            >
                <FontAwesomeIcon icon={faCircleInfo} className="size-4" />
            </Button>
        </div>
    );
}

function Composer({ friend }: { friend: Friend }) {
    const form = useForm<{ content: string; image: File | null }>({
        content: "",
        image: null,
    });
    const inputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [emojiOpen, setEmojiOpen] = useState(false);

    useEffect(() => {
        form.clearErrors();
        form.setData({ content: "", image: null });
        setImagePreview(null);
        setEmojiOpen(false);
    }, [friend.id]);

    useEffect(() => {
        if (!emojiOpen) return;
        const handler = (e: MouseEvent) => {
            const target = e.target as Node;
            if (!document.getElementById("emoji-popover")?.contains(target)
                && !document.getElementById("emoji-trigger")?.contains(target)) {
                setEmojiOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, [emojiOpen]);

    const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(URL.createObjectURL(file));
        form.setData("image", file);
    };

    const clearImage = () => {
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
        form.setData("image", null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const onSubmit = (e: FormEvent) => {
        e.preventDefault();
        const hasImage = !!form.data.image;
        const hasText = form.data.content.trim().length > 0;
        if (!hasImage && !hasText) return;
        if (form.processing) return;

        form.post(`/chat/${friend.id}/messages`, {
            preserveScroll: true,
            preserveState: true,
            forceFormData: true,
            onSuccess: () => {
                form.reset();
                clearImage();
                inputRef.current?.focus();
            },
        });
    };

    const insertEmoji = (emoji: string) => {
        form.setData("content", form.data.content + emoji);
        inputRef.current?.focus();
    };

    const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key !== "Enter") return;
        let mode = "shift_enter_send";
        try {
            const raw = localStorage.getItem("chatSettings.sendShortcut");
            if (raw) mode = JSON.parse(raw);
        } catch {
            // ignore
        }
        if (mode === "shift_enter_send") {
            if (e.shiftKey) {
                e.preventDefault();
                onSubmit(e as unknown as FormEvent);
            } else {
                e.preventDefault();
            }
        }
        // enter_send: default Enter submits form naturally — no handling needed
    };

    const toggleRead = () => {
        router.patch(
            `/friends/${friend.id}/read`,
            {},
            { preserveScroll: true, preserveState: true },
        );
    };

    const canSend =
        friend.is_following &&
        !form.processing &&
        (form.data.content.trim().length > 0 || !!form.data.image);
    const isUnread = friend.unread_count > 0;

    return (
        <div className="border-t border-border bg-background px-4 py-3 shrink-0 relative">
            {imagePreview && (
                <div className="max-w-3xl mx-auto mb-2 flex items-center gap-2 p-2 rounded-md bg-muted/40">
                    <img
                        src={imagePreview}
                        alt="送信予定の画像"
                        className="size-16 rounded object-cover"
                    />
                    <div className="flex-1 text-xs text-muted-foreground">
                        画像を送信します
                    </div>
                    <Button
                        type="button"
                        variant="ghost"
                        className="size-7 p-0 text-muted-foreground"
                        onClick={clearImage}
                        aria-label="画像を破棄"
                    >
                        <FontAwesomeIcon icon={faXmark} className="size-3.5" />
                    </Button>
                </div>
            )}

            <form
                onSubmit={onSubmit}
                className="flex flex-col gap-2 max-w-3xl mx-auto"
            >
                <div className="flex items-center gap-1.5">
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/png,image/jpeg"
                        className="hidden"
                        onChange={onFileChange}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        className="rounded-full text-muted-foreground hover:text-foreground size-9 p-0"
                        aria-label="画像を添付"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={!friend.is_following || form.processing}
                    >
                        <FontAwesomeIcon
                            icon={faPaperclip}
                            className="size-4"
                        />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        className={cn(
                            "rounded-full size-9 p-0",
                            isUnread
                                ? "text-primary hover:text-primary"
                                : "text-muted-foreground hover:text-foreground",
                        )}
                        aria-label={isUnread ? "既読にする" : "未読にする"}
                        title={isUnread ? "既読にする" : "未読にする"}
                        onClick={toggleRead}
                    >
                        <FontAwesomeIcon
                            icon={isUnread ? faEnvelope : faEnvelopeOpen}
                            className="size-4"
                        />
                    </Button>
                    <Input
                        ref={inputRef}
                        placeholder={
                            !friend.is_following
                                ? "ブロック中のため送信できません"
                                : imagePreview
                                    ? "コメント（画像と同送できません）"
                                    : "メッセージを入力してください"
                        }
                        className="flex-1 h-10 rounded-full bg-muted/40 border-transparent"
                        value={form.data.content}
                        onChange={(e) => form.setData("content", e.target.value)}
                        onKeyDown={onKeyDown}
                        disabled={
                            !friend.is_following ||
                            form.processing ||
                            !!imagePreview
                        }
                    />
                    <Button
                        id="emoji-trigger"
                        type="button"
                        variant="ghost"
                        className="rounded-full text-muted-foreground hover:text-foreground size-9 p-0"
                        aria-label="絵文字"
                        onClick={() => setEmojiOpen((v) => !v)}
                        disabled={!friend.is_following || form.processing}
                    >
                        <FontAwesomeIcon
                            icon={faFaceSmile}
                            className="size-4"
                        />
                    </Button>
                    <Button
                        type="submit"
                        className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-40 size-9 p-0"
                        aria-label="送信"
                        disabled={!canSend}
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
                {form.errors.image && (
                    <div className="text-[11px] text-destructive text-center">
                        {form.errors.image}
                    </div>
                )}
            </form>

            {emojiOpen && (
                <EmojiPopover onSelect={insertEmoji} />
            )}
        </div>
    );
}

const EMOJIS = [
    "😀", "😃", "😄", "😁", "😆", "😅", "😂", "🤣",
    "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰",
    "😘", "😗", "😙", "😚", "😋", "😛", "😝", "😜",
    "🤔", "🤨", "😐", "😑", "😶", "🙄", "😏", "😣",
    "😢", "😭", "😤", "😠", "😡", "🥺", "😱", "😨",
    "👍", "👎", "👏", "🙏", "💪", "🙌", "👌", "✌️",
    "❤️", "🧡", "💛", "💚", "💙", "💜", "🖤", "💔",
    "🎉", "🎊", "🎁", "🎂", "🍰", "☕", "🍻", "🌸",
    "⭐", "✨", "💡", "🔥", "💯", "✅", "❌", "❓",
];

function EmojiPopover({ onSelect }: { onSelect: (emoji: string) => void }) {
    return (
        <div
            id="emoji-popover"
            className="absolute bottom-16 right-12 z-40 bg-popover border border-border rounded-lg shadow-lg p-2 grid grid-cols-9 gap-0.5"
        >
            {EMOJIS.map((e) => (
                <button
                    key={e}
                    type="button"
                    onClick={() => onSelect(e)}
                    className="size-8 hover:bg-muted rounded text-lg"
                >
                    {e}
                </button>
            ))}
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
