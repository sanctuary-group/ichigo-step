"use client";

import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faFilter,
  faComments,
  faPlus,
} from "@fortawesome/free-solid-svg-icons";

import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TagBadge } from "@/components/tag-badge";
import { EmptyState } from "@/components/empty-state";
import {
  MOCK_FRIENDS,
  MOCK_TAGS,
  type MockFriend,
} from "@/mocks/data";
import { formatDateTime, formatRelativeShort } from "@/lib/time";
import Link from "next/link";

export default function FriendsPage() {
  const [query, setQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [tagTargetFriend, setTagTargetFriend] = useState<MockFriend | null>(
    null
  );

  const filtered = useMemo(() => {
    return MOCK_FRIENDS.filter((f) => {
      if (statusFilter === "following" && !f.isFollowing) return false;
      if (statusFilter === "blocked" && f.isFollowing) return false;
      if (tagFilter !== "all" && !f.tagIds.includes(tagFilter)) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (!f.displayName.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [query, tagFilter, statusFilter]);

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">友だち一覧</h1>
        <p className="text-sm text-muted-foreground mt-1">
          全 {MOCK_FRIENDS.length} 件 / フォロー中{" "}
          {MOCK_FRIENDS.filter((f) => f.isFollowing).length} 件
        </p>
      </div>

      <Card className="p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <FontAwesomeIcon
              icon={faMagnifyingGlass}
              className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            />
            <Input
              placeholder="LINE名で検索"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-9 h-9"
            />
          </div>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FontAwesomeIcon icon={faFilter} className="size-3" />
            タグ
          </div>
          <Select value={tagFilter} onValueChange={(v) => v && setTagFilter(v)}>
            <SelectTrigger className="w-40 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">すべて</SelectItem>
              {MOCK_TAGS.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={statusFilter}
            onValueChange={(v) => v && setStatusFilter(v)}
          >
            <SelectTrigger className="w-40 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全状態</SelectItem>
              <SelectItem value="following">フォロー中のみ</SelectItem>
              <SelectItem value="blocked">ブロック済のみ</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            title="該当する友だちがいません"
            description="検索条件を変えてみてください"
          />
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[28%]">名前</TableHead>
                <TableHead>タグ</TableHead>
                <TableHead>流入経路</TableHead>
                <TableHead>友だち追加</TableHead>
                <TableHead>最終接触</TableHead>
                <TableHead className="w-32 text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((f) => {
                const tags = MOCK_TAGS.filter((t) => f.tagIds.includes(t.id));
                return (
                  <TableRow key={f.id} className="hover:bg-muted/40">
                    <TableCell>
                      <div className="flex items-center gap-2.5">
                        <Avatar className="size-8">
                          <AvatarImage src={f.pictureUrl} />
                          <AvatarFallback>
                            {f.displayName.slice(0, 1)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0">
                          <div className="text-sm font-medium truncate">
                            {f.displayName}
                          </div>
                          {!f.isFollowing && (
                            <div className="text-[10px] text-destructive">
                              ブロック済み
                            </div>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1">
                        {tags.length === 0 ? (
                          <span className="text-xs text-muted-foreground">
                            —
                          </span>
                        ) : (
                          tags.map((t) => (
                            <TagBadge key={t.id} tag={t} size="sm" />
                          ))
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {f.source}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground tabular-nums">
                      {formatDateTime(f.followedAt)}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground tabular-nums">
                      {f.lastMessageAt
                        ? formatRelativeShort(f.lastMessageAt)
                        : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setTagTargetFriend(f)}
                        >
                          <FontAwesomeIcon icon={faPlus} className="size-3" />
                          タグ
                        </Button>
                        <Link
                          href="/chat"
                          className="inline-flex items-center justify-center size-8 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
                          aria-label="チャットを開く"
                        >
                          <FontAwesomeIcon
                            icon={faComments}
                            className="size-3.5"
                          />
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </Card>

      <TagAssignDialog
        friend={tagTargetFriend}
        onClose={() => setTagTargetFriend(null)}
      />
    </div>
  );
}

function TagAssignDialog({
  friend,
  onClose,
}: {
  friend: MockFriend | null;
  onClose: () => void;
}) {
  const [selected, setSelected] = useState<string[]>([]);

  // モーダルを開くたびに現在のタグを初期化
  useMemoOnFriendChange(friend, () => {
    setSelected(friend?.tagIds ?? []);
  });

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <Dialog open={!!friend} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>タグを編集</DialogTitle>
          <DialogDescription>
            {friend?.displayName} に付与するタグを選択
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-wrap gap-2 py-2">
          {MOCK_TAGS.map((t) => {
            const isOn = selected.includes(t.id);
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => toggle(t.id)}
                className={`inline-flex items-center gap-1 rounded-full border h-7 px-2.5 text-xs transition-colors ${
                  isOn
                    ? "bg-primary/10 border-primary/40 text-primary"
                    : "bg-background border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{ backgroundColor: t.color }}
                />
                {t.name}
              </button>
            );
          })}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={onClose}>保存（モック）</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function useMemoOnFriendChange(
  friend: MockFriend | null,
  fn: () => void
) {
  useEffect(() => {
    if (friend) fn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [friend?.id]);
}
