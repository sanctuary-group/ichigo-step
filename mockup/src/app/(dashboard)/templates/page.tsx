"use client";

import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faMagnifyingGlass,
  faPenToSquare,
  faTrash,
  faPaperPlane,
  faSort,
  faFolderPlus,
  faBookOpen,
  faAngleDoubleLeft,
  faImage,
  faLayerGroup,
  faFont,
  faNoteSticky,
} from "@fortawesome/free-solid-svg-icons";
import type { IconDefinition } from "@fortawesome/fontawesome-svg-core";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MOCK_TEMPLATES,
  MOCK_TEMPLATE_FOLDERS,
  type MockMessageType,
} from "@/mocks/data";
import { cn } from "@/lib/utils";
import { formatRelativeShort } from "@/lib/time";

const TYPE_ICONS: Record<MockMessageType, IconDefinition> = {
  text: faFont,
  image: faImage,
  flex: faLayerGroup,
  sticker: faNoteSticky,
};

const TYPE_LABEL: Record<MockMessageType, string> = {
  text: "テキスト",
  image: "画像",
  flex: "Flex",
  sticker: "スタンプ",
};

export default function TemplatesPage() {
  const [selectedFolderId, setSelectedFolderId] = useState<string>("fld_default");
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [showFolderPane, setShowFolderPane] = useState(true);

  const folderCounts = useMemo(() => {
    const map = new Map<string, number>();
    for (const t of MOCK_TEMPLATES) {
      map.set(t.folderId, (map.get(t.folderId) ?? 0) + 1);
    }
    return map;
  }, []);

  const filtered = useMemo(() => {
    return MOCK_TEMPLATES.filter((t) => {
      if (t.folderId !== selectedFolderId) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (
          !t.name.toLowerCase().includes(q) &&
          !t.preview.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [selectedFolderId, query]);

  const allCheckedInView =
    filtered.length > 0 && filtered.every((t) => selectedIds.has(t.id));
  const hasSelection = selectedIds.size > 0;

  const handleFolderChange = (id: string) => {
    setSelectedFolderId(id);
    setSelectedIds(new Set());
  };

  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allCheckedInView) {
        for (const t of filtered) next.delete(t.id);
      } else {
        for (const t of filtered) next.add(t.id);
      }
      return next;
    });
  };

  return (
    <div className="flex-1 overflow-hidden flex flex-col p-6 lg:p-8 gap-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">テンプレート</h1>
          <p className="text-sm text-muted-foreground mt-1">
            よく使うメッセージを保存して再利用（モック）
          </p>
        </div>
        <Button variant="outline">
          <FontAwesomeIcon icon={faBookOpen} className="size-3.5" />
          マニュアル
        </Button>
      </div>

      <Card className="flex-1 flex overflow-hidden p-0">
        {showFolderPane && (
          <aside className="w-56 shrink-0 border-r border-border flex flex-col">
            <div className="p-3 flex items-center gap-1.5 border-b border-border">
              <Button variant="outline" size="sm" className="flex-1 h-8">
                <FontAwesomeIcon icon={faFolderPlus} className="size-3" />
                フォルダ追加
              </Button>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="フォルダ並べ替え"
              >
                <FontAwesomeIcon icon={faSort} className="size-3.5" />
              </Button>
            </div>

            <ul className="flex-1 overflow-y-auto py-2">
              {MOCK_TEMPLATE_FOLDERS.map((f) => {
                const active = f.id === selectedFolderId;
                const count = folderCounts.get(f.id) ?? 0;
                return (
                  <li key={f.id}>
                    <button
                      onClick={() => handleFolderChange(f.id)}
                      className={cn(
                        "w-full text-left px-3 h-9 text-sm transition-colors flex items-center gap-2",
                        active
                          ? "bg-primary/10 text-primary font-medium"
                          : "hover:bg-muted/50 text-foreground"
                      )}
                    >
                      <span className="flex-1 truncate">{f.name}</span>
                      <span
                        className={cn(
                          "text-[11px] tabular-nums",
                          active
                            ? "text-primary"
                            : "text-muted-foreground"
                        )}
                      >
                        ({count})
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>

            <button
              onClick={() => setShowFolderPane(false)}
              className="p-3 border-t border-border text-[11px] text-muted-foreground hover:text-foreground flex items-center gap-1.5"
            >
              <FontAwesomeIcon icon={faAngleDoubleLeft} className="size-3" />
              フォルダを非表示
            </button>
          </aside>
        )}

        <section className="flex-1 flex flex-col overflow-hidden">
          <div className="p-3 border-b border-border flex items-center gap-2 flex-wrap">
            {!showFolderPane && (
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setShowFolderPane(true)}
              >
                フォルダを表示
              </Button>
            )}
            <Button size="sm" className="h-8">
              <FontAwesomeIcon icon={faPlus} className="size-3" />
              新規作成
            </Button>
            <Button variant="outline" size="sm" className="h-8">
              <FontAwesomeIcon icon={faSort} className="size-3" />
              並べ替え
            </Button>
            <div className="ml-auto relative w-full sm:w-64">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                className="size-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              />
              <Input
                placeholder="管理名を入力"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9 h-8"
              />
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <input
                      type="checkbox"
                      checked={allCheckedInView}
                      onChange={toggleAll}
                      aria-label="すべて選択"
                      disabled={filtered.length === 0}
                      className="size-4 rounded border-border accent-primary"
                    />
                  </TableHead>
                  <TableHead>管理名</TableHead>
                  <TableHead>内容</TableHead>
                  <TableHead className="w-28">作成日</TableHead>
                  <TableHead className="w-28">最終編集日</TableHead>
                  <TableHead className="w-24">クイックテスト</TableHead>
                  <TableHead className="w-24 text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-sm text-muted-foreground py-16"
                    >
                      データがありません。
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((t) => {
                    const checked = selectedIds.has(t.id);
                    return (
                      <TableRow
                        key={t.id}
                        data-state={checked ? "selected" : undefined}
                        className="hover:bg-muted/40"
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() => toggleRow(t.id)}
                            aria-label={`${t.name} を選択`}
                            className="size-4 rounded border-border accent-primary"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2 min-w-0">
                            <div className="grid place-items-center size-7 rounded-md bg-primary/10 text-primary shrink-0">
                              <FontAwesomeIcon
                                icon={TYPE_ICONS[t.messageType]}
                                className="size-3"
                              />
                            </div>
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">
                                {t.name}
                              </div>
                              <div className="text-[10px] text-muted-foreground">
                                {TYPE_LABEL[t.messageType]}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-xs text-muted-foreground line-clamp-2 max-w-md">
                            {t.preview}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground tabular-nums">
                          {formatRelativeShort(t.createdAt)}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground tabular-nums">
                          {formatRelativeShort(t.updatedAt)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-7 text-xs"
                          >
                            <FontAwesomeIcon
                              icon={faPaperPlane}
                              className="size-2.5"
                            />
                            テスト送信
                          </Button>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="inline-flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              aria-label="編集"
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
                              <FontAwesomeIcon
                                icon={faTrash}
                                className="size-3.5"
                              />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>

          <div className="p-3 border-t border-border flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              disabled={!hasSelection}
            >
              一括フォルダ変更
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-destructive hover:text-destructive"
              disabled={!hasSelection}
            >
              <FontAwesomeIcon icon={faTrash} className="size-3" />
              一括削除
            </Button>
            {hasSelection && (
              <span className="text-xs text-muted-foreground ml-2">
                {selectedIds.size} 件選択中
              </span>
            )}
          </div>
        </section>
      </Card>
    </div>
  );
}
