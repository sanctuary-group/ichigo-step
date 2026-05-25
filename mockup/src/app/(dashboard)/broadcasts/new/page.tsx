"use client";

import { useState } from "react";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faFont,
  faImage,
  faLayerGroup,
} from "@fortawesome/free-solid-svg-icons";

import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MessagePreview } from "@/components/message-preview";
import { MOCK_TAGS, type MockMessageType } from "@/mocks/data";

type MessageDraft = {
  text: string;
  imageCaption: string;
  flexLabel: string;
};

export default function NewBroadcastPage() {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<MockMessageType>("text");
  const [draft, setDraft] = useState<MessageDraft>({
    text: "",
    imageCaption: "",
    flexLabel: "[Flex] 新商品キャンペーン",
  });
  const [targetType, setTargetType] = useState<"all" | "tag">("all");
  const [targetTagId, setTargetTagId] = useState<string>("tag_vip");
  const [schedule, setSchedule] = useState<"now" | "later">("now");
  const [scheduledAt, setScheduledAt] = useState<string>("");

  const previewContent =
    type === "text"
      ? draft.text
      : type === "image"
        ? draft.imageCaption
        : draft.flexLabel;

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8">
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/broadcasts"
          className={buttonVariants({ variant: "ghost", size: "icon" })}
        >
          <FontAwesomeIcon icon={faChevronLeft} className="size-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">配信を作成</h1>
          <p className="text-sm text-muted-foreground mt-1">
            メッセージ・対象・送信タイミングを設定します
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_360px] gap-6">
        {/* Left: form */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>基本情報</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="title">配信タイトル（管理用）</Label>
                <Input
                  id="title"
                  placeholder="例: 5月末セールのお知らせ"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>メッセージ内容</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs
                value={type}
                onValueChange={(v) => setType(v as MockMessageType)}
              >
                <TabsList className="mb-4">
                  <TabsTrigger value="text">
                    <FontAwesomeIcon icon={faFont} className="size-3.5" />
                    テキスト
                  </TabsTrigger>
                  <TabsTrigger value="image">
                    <FontAwesomeIcon icon={faImage} className="size-3.5" />
                    画像
                  </TabsTrigger>
                  <TabsTrigger value="flex">
                    <FontAwesomeIcon icon={faLayerGroup} className="size-3.5" />
                    Flex
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="text" className="space-y-2">
                  <Label htmlFor="text">本文</Label>
                  <Textarea
                    id="text"
                    rows={8}
                    placeholder="送信するメッセージ本文を入力…"
                    value={draft.text}
                    onChange={(e) =>
                      setDraft({ ...draft, text: e.target.value })
                    }
                  />
                  <div className="text-[11px] text-muted-foreground text-right">
                    {draft.text.length} / 5000 文字
                  </div>
                </TabsContent>
                <TabsContent value="image" className="space-y-3">
                  <div className="space-y-1.5">
                    <Label>画像アップロード</Label>
                    <div className="border-2 border-dashed border-border rounded-lg p-8 grid place-items-center text-center text-xs text-muted-foreground">
                      <FontAwesomeIcon icon={faImage} className="size-6 mb-2" />
                      モックでは画像アップロードはできません
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="caption">キャプション（任意）</Label>
                    <Input
                      id="caption"
                      placeholder="画像下のテキスト"
                      value={draft.imageCaption}
                      onChange={(e) =>
                        setDraft({ ...draft, imageCaption: e.target.value })
                      }
                    />
                  </div>
                </TabsContent>
                <TabsContent value="flex" className="space-y-2">
                  <Label htmlFor="flex">Flex Message ラベル（プレビュー用）</Label>
                  <Input
                    id="flex"
                    value={draft.flexLabel}
                    onChange={(e) =>
                      setDraft({ ...draft, flexLabel: e.target.value })
                    }
                  />
                  <p className="text-xs text-muted-foreground">
                    Flex Message Designer は MVP 後に対応予定です
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>配信対象</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <RadioGroup
                value={targetType}
                onValueChange={(v) => setTargetType(v as "all" | "tag")}
                className="space-y-2"
              >
                <Label className="flex items-center gap-2 cursor-pointer font-normal">
                  <RadioGroupItem value="all" />
                  全ての友だち（フォロー中）
                </Label>
                <Label className="flex items-center gap-2 cursor-pointer font-normal">
                  <RadioGroupItem value="tag" />
                  タグで絞り込む
                </Label>
              </RadioGroup>
              {targetType === "tag" && (
                <Select
                  value={targetTagId}
                  onValueChange={(v) => v && setTargetTagId(v)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {MOCK_TAGS.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>送信タイミング</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <RadioGroup
                value={schedule}
                onValueChange={(v) => setSchedule(v as "now" | "later")}
                className="space-y-2"
              >
                <Label className="flex items-center gap-2 cursor-pointer font-normal">
                  <RadioGroupItem value="now" />
                  すぐに送信
                </Label>
                <Label className="flex items-center gap-2 cursor-pointer font-normal">
                  <RadioGroupItem value="later" />
                  日時を指定して予約
                </Label>
              </RadioGroup>
              {schedule === "later" && (
                <Input
                  type="datetime-local"
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                />
              )}
            </CardContent>
          </Card>

          <div className="flex items-center justify-end gap-2 pb-6">
            <Link
              href="/broadcasts"
              className={buttonVariants({ variant: "outline" })}
            >
              キャンセル
            </Link>
            <Button variant="outline">下書き保存</Button>
            <Button>
              {schedule === "now" ? "今すぐ送信" : "予約する"}
            </Button>
          </div>
        </div>

        {/* Right: preview */}
        <div className="space-y-3 xl:sticky xl:top-4 self-start">
          <div className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
            LINE プレビュー
          </div>
          <MessagePreview type={type} content={previewContent} />
          <div className="text-[11px] text-muted-foreground">
            実機での見た目とは多少異なる場合があります
          </div>
        </div>
      </div>
    </div>
  );
}
