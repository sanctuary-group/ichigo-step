"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFont,
  faImage,
  faLayerGroup,
  faCircleInfo,
} from "@fortawesome/free-solid-svg-icons";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { MessagePreview } from "@/components/message-preview";
import { MOCK_GREETING, type MockMessageType } from "@/mocks/data";

export default function GreetingsPage() {
  const [isActive, setIsActive] = useState(MOCK_GREETING.isActive);
  const [type, setType] = useState<MockMessageType>(MOCK_GREETING.messageType);
  const [content, setContent] = useState(MOCK_GREETING.content);

  return (
    <div className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            あいさつメッセージ
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            友だち追加されたときに自動配信されるメッセージ
          </p>
        </div>
        <Button>変更を保存</Button>
      </div>

      <Card className="bg-muted/40 border-dashed">
        <CardContent className="p-4 flex items-start gap-3">
          <FontAwesomeIcon
            icon={faCircleInfo}
            className="size-4 text-muted-foreground mt-0.5"
          />
          <div className="text-xs text-muted-foreground leading-relaxed">
            ON にすると、新しく友だち追加されたユーザーに自動的にこのメッセージが配信されます。
            ステップ配信の初回ステップとは別枠で送信されます。
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <CardTitle>エディタ</CardTitle>
              <div className="flex items-center gap-2">
                <Label
                  htmlFor="greeting-active"
                  className="text-xs text-muted-foreground"
                >
                  {isActive ? "配信ON" : "配信OFF"}
                </Label>
                <Switch
                  id="greeting-active"
                  checked={isActive}
                  onCheckedChange={setIsActive}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={type} onValueChange={(v) => setType(v as MockMessageType)}>
              <TabsList>
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

              <TabsContent value="text" className="mt-4 space-y-1.5">
                <Label htmlFor="greeting-text">本文</Label>
                <Textarea
                  id="greeting-text"
                  rows={12}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="あいさつメッセージを入力…"
                />
                <div className="text-[11px] text-muted-foreground text-right">
                  {content.length} / 500 文字
                </div>
              </TabsContent>

              <TabsContent value="image" className="mt-4">
                <div className="border-2 border-dashed border-border rounded-xl p-10 text-center text-sm text-muted-foreground">
                  <FontAwesomeIcon
                    icon={faImage}
                    className="size-8 mb-2 text-muted-foreground/60"
                  />
                  <div>クリックして画像をアップロード（モック）</div>
                  <div className="text-xs mt-1">推奨: 1040 x 1040px / JPG・PNG</div>
                </div>
              </TabsContent>

              <TabsContent value="flex" className="mt-4">
                <div className="border-2 border-dashed border-border rounded-xl p-10 text-center text-sm text-muted-foreground">
                  <FontAwesomeIcon
                    icon={faLayerGroup}
                    className="size-8 mb-2 text-muted-foreground/60"
                  />
                  <div>Flex Message テンプレートを選択（モック）</div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>プレビュー</CardTitle>
          </CardHeader>
          <CardContent>
            <MessagePreview type={type} content={content} />
            <div className="text-[11px] text-muted-foreground mt-3 text-center">
              ※ 実機の LINE 上での見え方とは多少異なる場合があります
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
