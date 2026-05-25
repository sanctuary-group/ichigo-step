import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  return (
    <Card className="border-border/60">
      <CardHeader>
        <CardTitle className="text-center">運営者ログイン</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form action="/dashboard" className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">メールアドレス</Label>
            <Input id="email" type="email" placeholder="ops@ichigo-step.com" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">パスワード</Label>
            <Input id="password" type="password" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="otp">2 段階認証コード</Label>
            <Input id="otp" inputMode="numeric" placeholder="000000" maxLength={6} />
          </div>
          <Button type="submit" className="w-full">
            ログイン
          </Button>
        </form>
        <div className="text-center text-[11px] text-muted-foreground">
          運営者専用ポータルです。テナント側ログインは <a href="https://ichigo-step.vercel.app/login" className="text-primary hover:underline">こちら</a>
        </div>
      </CardContent>
    </Card>
  );
}
