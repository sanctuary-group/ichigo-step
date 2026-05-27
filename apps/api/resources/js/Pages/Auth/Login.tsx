import { Head, Link, useForm, usePage } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleCheck } from "@fortawesome/free-solid-svg-icons";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "@/Layouts/AuthLayout";

type PageProps = {
    flash?: { success?: string };
    errors: Record<string, string>;
};

export default function Login() {
    const { props } = usePage<PageProps>();
    const form = useForm({ email: "", password: "" });

    const submit: React.FormEventHandler = (e) => {
        e.preventDefault();
        form.post("/login");
    };

    return (
        <>
            <Head title="ログイン" />
            <div className="w-full max-w-sm mx-auto">
                {props.flash?.success && (
                    <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-lg bg-primary/10 text-primary text-sm">
                        <FontAwesomeIcon
                            icon={faCircleCheck}
                            className="size-4"
                        />
                        {props.flash.success}
                    </div>
                )}
                <Card className="border-border/60">
                    <CardHeader>
                        <CardTitle className="text-center">ログイン</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="email">メールアドレス</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    value={form.data.email}
                                    onChange={(e) =>
                                        form.setData("email", e.target.value)
                                    }
                                />
                                {form.errors.email && (
                                    <div className="text-xs text-destructive font-medium">
                                        {form.errors.email}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="password">パスワード</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={form.data.password}
                                    onChange={(e) =>
                                        form.setData("password", e.target.value)
                                    }
                                />
                                {form.errors.password && (
                                    <div className="text-xs text-destructive font-medium">
                                        {form.errors.password}
                                    </div>
                                )}
                            </div>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={form.processing}
                            >
                                {form.processing ? "ログイン中..." : "ログイン"}
                            </Button>
                        </form>
                        <div className="text-center text-sm text-muted-foreground">
                            アカウントをお持ちでない方は{" "}
                            <Link
                                href="/register"
                                className="text-primary hover:underline"
                            >
                                新規登録
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Login.layout = (page: React.ReactNode) => <AuthLayout>{page}</AuthLayout>;
