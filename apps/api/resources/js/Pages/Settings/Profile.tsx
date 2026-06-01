import { Head, Link, useForm } from "@inertiajs/react";
import { FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faRightFromBracket,
    faTriangleExclamation,
    faCircleCheck,
    faCircleExclamation,
} from "@fortawesome/free-solid-svg-icons";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SettingsLayout } from "@/Layouts/SettingsLayout";

type Profile = {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    company: string | null;
    email_verified: boolean;
};

type PageProps = { profile: Profile };

export default function ProfileSettings({ profile }: PageProps) {
    const info = useForm({
        name: profile.name,
        email: profile.email,
        company: profile.company ?? "",
        phone: profile.phone ?? "",
    });

    const pass = useForm({
        current_password: "",
        password: "",
        password_confirmation: "",
    });

    const submitInfo = (e: FormEvent) => {
        e.preventDefault();
        info.patch("/settings/profile", { preserveScroll: true });
    };

    const submitPass = (e: FormEvent) => {
        e.preventDefault();
        pass.patch("/settings/profile/password", {
            preserveScroll: true,
            onSuccess: () => pass.reset(),
        });
    };

    const dirty =
        info.data.name !== profile.name ||
        info.data.email !== profile.email ||
        info.data.company !== (profile.company ?? "") ||
        info.data.phone !== (profile.phone ?? "");

    return (
        <>
            <Head title="マイページ" />
            <div className="space-y-6">
                <div>
                    <h2 className="text-lg font-semibold">プロフィール</h2>
                    <p className="text-xs text-muted-foreground mt-1">
                        ご自身のアカウント情報を編集します
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>基本情報</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submitInfo} className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="size-16">
                                    <AvatarFallback className="text-xl">
                                        {info.data.name.slice(0, 1) || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-1">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        disabled
                                    >
                                        画像を変更
                                    </Button>
                                    <div className="text-[11px] text-muted-foreground">
                                        推奨: 正方形 PNG/JPG 512px 以上
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <Field
                                    id="name"
                                    label="表示名"
                                    error={info.errors.name}
                                >
                                    <Input
                                        id="name"
                                        value={info.data.name}
                                        onChange={(e) =>
                                            info.setData("name", e.target.value)
                                        }
                                        maxLength={50}
                                    />
                                </Field>
                                <Field
                                    id="email"
                                    label="メールアドレス"
                                    error={info.errors.email}
                                >
                                    <Input
                                        id="email"
                                        type="email"
                                        value={info.data.email}
                                        onChange={(e) =>
                                            info.setData(
                                                "email",
                                                e.target.value,
                                            )
                                        }
                                    />
                                    {profile.email_verified ? (
                                        <p className="text-[11px] text-primary flex items-center gap-1">
                                            <FontAwesomeIcon
                                                icon={faCircleCheck}
                                                className="size-3"
                                            />
                                            確認済み
                                        </p>
                                    ) : (
                                        <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                            <FontAwesomeIcon
                                                icon={faCircleExclamation}
                                                className="size-3"
                                            />
                                            未確認
                                        </p>
                                    )}
                                </Field>
                                <Field
                                    id="company"
                                    label="会社名・屋号"
                                    error={info.errors.company}
                                >
                                    <Input
                                        id="company"
                                        value={info.data.company}
                                        onChange={(e) =>
                                            info.setData(
                                                "company",
                                                e.target.value,
                                            )
                                        }
                                        maxLength={100}
                                    />
                                </Field>
                                <Field
                                    id="phone"
                                    label="電話番号（ハイフンなし）"
                                    error={info.errors.phone}
                                >
                                    <Input
                                        id="phone"
                                        value={info.data.phone}
                                        onChange={(e) =>
                                            info.setData(
                                                "phone",
                                                e.target.value,
                                            )
                                        }
                                        inputMode="numeric"
                                        placeholder="09012345678"
                                    />
                                </Field>
                            </div>

                            <div className="flex items-center justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={!dirty || info.processing}
                                    onClick={() =>
                                        info.setData({
                                            name: profile.name,
                                            email: profile.email,
                                            company: profile.company ?? "",
                                            phone: profile.phone ?? "",
                                        })
                                    }
                                >
                                    キャンセル
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={!dirty || info.processing}
                                >
                                    {info.processing ? "保存中..." : "保存"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>パスワード変更</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={submitPass} className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <Field
                                    id="cur"
                                    label="現在のパスワード"
                                    error={pass.errors.current_password}
                                >
                                    <Input
                                        id="cur"
                                        type="password"
                                        value={pass.data.current_password}
                                        onChange={(e) =>
                                            pass.setData(
                                                "current_password",
                                                e.target.value,
                                            )
                                        }
                                        autoComplete="current-password"
                                    />
                                </Field>
                                <Field
                                    id="new"
                                    label="新しいパスワード"
                                    error={pass.errors.password}
                                >
                                    <Input
                                        id="new"
                                        type="password"
                                        value={pass.data.password}
                                        onChange={(e) =>
                                            pass.setData(
                                                "password",
                                                e.target.value,
                                            )
                                        }
                                        autoComplete="new-password"
                                    />
                                </Field>
                                <Field id="conf" label="確認用">
                                    <Input
                                        id="conf"
                                        type="password"
                                        value={pass.data.password_confirmation}
                                        onChange={(e) =>
                                            pass.setData(
                                                "password_confirmation",
                                                e.target.value,
                                            )
                                        }
                                        autoComplete="new-password"
                                    />
                                </Field>
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                                英大文字・小文字・数字・記号をそれぞれ1文字以上含む6〜12文字
                            </p>
                            <div className="flex items-center justify-end gap-2">
                                <Button
                                    type="submit"
                                    disabled={
                                        pass.processing ||
                                        !pass.data.current_password ||
                                        !pass.data.password
                                    }
                                >
                                    {pass.processing
                                        ? "更新中..."
                                        : "パスワードを更新"}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>セッション</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-input bg-background text-sm font-medium hover:bg-muted transition-colors"
                        >
                            <FontAwesomeIcon
                                icon={faRightFromBracket}
                                className="size-3.5"
                            />
                            このブラウザからログアウト
                        </Link>
                    </CardContent>
                </Card>

                <Card className="border-destructive/40">
                    <CardHeader>
                        <CardTitle className="text-destructive flex items-center gap-2">
                            <FontAwesomeIcon
                                icon={faTriangleExclamation}
                                className="size-4"
                            />
                            危険な操作
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <div className="text-sm text-muted-foreground">
                            アカウントを削除すると、関連する組織からの脱退が必要です。
                        </div>
                        <Button variant="destructive" disabled>
                            アカウントを削除
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

ProfileSettings.layout = (page: React.ReactNode) => (
    <SettingsLayout>{page}</SettingsLayout>
);

function Field({
    id,
    label,
    error,
    children,
}: {
    id: string;
    label: string;
    error?: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-1.5">
            <Label htmlFor={id}>{label}</Label>
            {children}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
