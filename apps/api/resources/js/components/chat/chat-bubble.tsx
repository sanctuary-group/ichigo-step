import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faImage,
    faLayerGroup,
    faRobot,
    faFile,
    faVideo,
    faMicrophone,
    faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/time";
import type { Message } from "@/types/chat";

const NON_TEXT_ICON: Partial<Record<Message["message_type"], IconDefinition>> = {
    image: faImage,
    video: faVideo,
    audio: faMicrophone,
    file: faFile,
    flex: faLayerGroup,
    location: faMapMarkerAlt,
};

export function ChatBubble({ message }: { message: Message }) {
    const isOutgoing = message.direction === "outgoing";
    const icon = NON_TEXT_ICON[message.message_type];

    return (
        <div
            className={cn(
                "flex flex-col max-w-[75%]",
                isOutgoing ? "self-end items-end" : "self-start items-start",
            )}
        >
            {isOutgoing && message.source === "scenario" && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-1">
                    <FontAwesomeIcon icon={faRobot} className="size-3" />
                    <span>ステップ配信</span>
                </div>
            )}
            <div
                className={cn(
                    "rounded-2xl px-4 py-2.5 text-sm shadow-sm whitespace-pre-wrap break-words",
                    isOutgoing
                        ? "bg-primary/10 text-foreground rounded-tr-sm"
                        : "bg-white border border-border rounded-tl-sm",
                )}
            >
                {message.message_type === "text" && message.content}
                {message.message_type === "sticker" && (
                    <div className="text-muted-foreground">[スタンプ]</div>
                )}
                {message.message_type === "postback" && (
                    <div className="text-muted-foreground text-xs">
                        [ボタン操作] {message.content}
                    </div>
                )}
                {icon && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                        <FontAwesomeIcon icon={icon} className="size-4" />
                        <span>
                            {message.message_type === "image" && "画像"}
                            {message.message_type === "video" && "動画"}
                            {message.message_type === "audio" && "音声"}
                            {message.message_type === "file" && "ファイル"}
                            {message.message_type === "flex" && "Flex メッセージ"}
                            {message.message_type === "location" && "位置情報"}
                        </span>
                    </div>
                )}
            </div>
            <div className="text-[10px] text-muted-foreground mt-1 px-1">
                {formatTime(message.created_at)}
            </div>
        </div>
    );
}
