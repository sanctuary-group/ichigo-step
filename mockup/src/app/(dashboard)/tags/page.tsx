"use client";

import { useEffect, useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faPenToSquare,
  faTrash,
  faTag,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { MOCK_FRIENDS, MOCK_TAGS, type MockTag } from "@/mocks/data";
import { cn } from "@/lib/utils";

const PRESET_COLORS = [
  "#f59e0b",
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#14b8a6",
  "#94a3b8",
];

type EditState =
  | { mode: "create" }
  | { mode: "edit"; tag: MockTag }
  | null;

export default function TagsPage() {
  const [editing, setEditing] = useState<EditState>(null);

  const usageCount = useMemo(() => {
    const map = new Map<string, number>();
    for (const f of MOCK_FRIENDS) {
      for (const id of f.tagIds) {
        map.set(id, (map.get(id) ?? 0) + 1);
      }
    }
    return map;
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">タグ管理</h1>
          <p className="text-sm text-muted-foreground mt-1">
            タグの作成・編集・削除
          </p>
        </div>
        <Button onClick={() => setEditing({ mode: "create" })}>
          <FontAwesomeIcon icon={faPlus} className="size-3.5" />
          タグを追加
        </Button>
      </div>

      {MOCK_TAGS.length === 0 ? (
        <Card>
          <EmptyState
            icon={faTag}
            title="タグがまだありません"
            description="タグを作成して友だちを分類しましょう"
          />
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {MOCK_TAGS.map((t) => (
            <Card key={t.id}>
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0">
                  <TagBadge tag={t} />
                  <div className="text-xs text-muted-foreground mt-2">
                    使用中: {usageCount.get(t.id) ?? 0} 人
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="編集"
                    onClick={() => setEditing({ mode: "edit", tag: t })}
                  >
                    <FontAwesomeIcon
                      icon={faPenToSquare}
                      className="size-3.5"
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    aria-label="削除"
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <FontAwesomeIcon icon={faTrash} className="size-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TagEditDialog state={editing} onClose={() => setEditing(null)} />
    </div>
  );
}

function TagEditDialog({
  state,
  onClose,
}: {
  state: EditState;
  onClose: () => void;
}) {
  const initialName = state?.mode === "edit" ? state.tag.name : "";
  const initialColor =
    state?.mode === "edit" ? state.tag.color : PRESET_COLORS[1];

  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);

  // dialog が開くたびに値をリセット
  useEffect(() => {
    if (state) {
      setName(state.mode === "edit" ? state.tag.name : "");
      setColor(state.mode === "edit" ? state.tag.color : PRESET_COLORS[1]);
    }
  }, [state]);

  return (
    <Dialog open={!!state} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {state?.mode === "edit" ? "タグを編集" : "タグを追加"}
          </DialogTitle>
          <DialogDescription>
            タグ名と色を設定します
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="tag-name">タグ名</Label>
            <Input
              id="tag-name"
              placeholder="例: 見込み客"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={32}
            />
          </div>
          <div className="space-y-1.5">
            <Label>色</Label>
            <div className="flex flex-wrap gap-2">
              {PRESET_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={cn(
                    "size-7 rounded-full transition-transform",
                    color === c
                      ? "ring-2 ring-offset-2 ring-foreground scale-110"
                      : "hover:scale-105"
                  )}
                  style={{ backgroundColor: c }}
                  aria-label={c}
                />
              ))}
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>プレビュー</Label>
            <div>
              <TagBadge
                tag={{ id: "preview", name: name || "新しいタグ", color }}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button onClick={onClose}>
            {state?.mode === "edit" ? "更新（モック）" : "作成（モック）"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
