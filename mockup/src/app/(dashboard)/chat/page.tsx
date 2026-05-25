"use client";

import { useState } from "react";

import { FriendListPane } from "@/components/chat/friend-list-pane";
import { ChatThreadPane } from "@/components/chat/chat-thread-pane";
import { RightInfoPanel } from "@/components/chat/right-info-panel";
import { MOCK_FRIENDS, getFriend } from "@/mocks/data";

export default function ChatPage() {
  const [selectedId, setSelectedId] = useState<string | null>(
    MOCK_FRIENDS[1]?.id ?? null
  );
  const friend = selectedId ? getFriend(selectedId) : undefined;

  return (
    <div className="flex h-full min-h-0">
      <FriendListPane selectedId={selectedId} onSelect={setSelectedId} />
      <ChatThreadPane friendId={selectedId} />
      {friend && <RightInfoPanel friend={friend} />}
    </div>
  );
}
