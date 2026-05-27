import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-solid-svg-icons";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { friendDisplayName } from "@/lib/friend";
import { cn } from "@/lib/utils";
import type { Friend } from "@/types/chat";

export function FriendAvatar({
    friend,
    className,
}: {
    friend: Friend;
    className?: string;
}) {
    const name = friendDisplayName(friend);
    return (
        <Avatar className={className}>
            {friend.picture_url && (
                <AvatarImage src={friend.picture_url} alt={name} />
            )}
            <AvatarFallback
                className={cn(
                    "bg-gradient-to-br from-zinc-300 to-zinc-500 text-white/90",
                )}
            >
                <FontAwesomeIcon icon={faUser} className="size-1/2" />
            </AvatarFallback>
        </Avatar>
    );
}
