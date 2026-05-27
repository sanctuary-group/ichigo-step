import { Head, router, usePage } from "@inertiajs/react";
import { useEffect, useState } from "react";

import { ChatThreadPane } from "@/components/chat/chat-thread-pane";
import { FriendListPane } from "@/components/chat/friend-list-pane";
import { RightInfoPanel } from "@/components/chat/right-info-panel";
import { DashboardLayout } from "@/Layouts/DashboardLayout";
import type { Friend, Message } from "@/types/chat";

type ChatMobileView = "list" | "thread" | "info";

type PageProps = {
    friends: Friend[];
    selectedFriend: Friend | null;
    messages: Message[];
};

const POLL_INTERVAL_MS = 5000;

export default function ChatIndex() {
    const { props } = usePage<PageProps>();
    const [view, setView] = useState<ChatMobileView>(
        props.selectedFriend ? "thread" : "list",
    );

    useEffect(() => {
        const id = setInterval(() => {
            router.reload({
                only: ["friends", "selectedFriend", "messages"],
                preserveScroll: true,
                preserveState: true,
            });
        }, POLL_INTERVAL_MS);
        return () => clearInterval(id);
    }, []);

    const handleSelect = (friendId: number) => {
        router.get(
            "/chat",
            { friend: friendId },
            {
                preserveState: true,
                preserveScroll: true,
                only: ["selectedFriend", "messages", "friends"],
            },
        );
        setView("thread");
    };

    return (
        <>
            <Head title="1:1 チャット" />
            <div className="flex h-full min-h-0 flex-1">
                <FriendListPane
                    friends={props.friends}
                    selectedId={props.selectedFriend?.id ?? null}
                    onSelect={handleSelect}
                    mobileVisible={view === "list"}
                />
                <ChatThreadPane
                    friend={props.selectedFriend}
                    messages={props.messages}
                    mobileVisible={view === "thread"}
                    onBack={() => setView("list")}
                    onShowInfo={() => setView("info")}
                />
                {props.selectedFriend && (
                    <RightInfoPanel
                        friend={props.selectedFriend}
                        mobileVisible={view === "info"}
                        onBack={() => setView("thread")}
                    />
                )}
            </div>
        </>
    );
}

ChatIndex.layout = (page: React.ReactNode) => (
    <DashboardLayout>{page}</DashboardLayout>
);
