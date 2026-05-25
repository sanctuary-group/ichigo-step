import Link from "next/link";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function RegisterPage() {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-center">新規登録</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action="/chat" className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="org">組織名</Label>
            <Input id="org" placeholder="株式会社サンプル" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name">お名前</Label>
            <Input id="name" placeholder="山田 太郎" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" type="email" placeholder="you@example.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">パスワード</Label>
            <Input id="password" type="password" />
          </div>
          <Button type="submit" className="w-full">
            登録してはじめる
          </Button>
        </form>
        <div className="text-center text-sm text-muted-foreground">
          すでにアカウントをお持ちの方は{" "}
          <Link href="/login" className="text-primary hover:underline">
            ログイン
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
