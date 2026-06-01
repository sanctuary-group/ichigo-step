import { Head, useForm } from "@inertiajs/react";
import { FormEvent } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faShieldHalved } from "@fortawesome/free-solid-svg-icons";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLogin() {
    const form = useForm({ email: "", password: "", remember: false });

    const submit = (e: FormEvent) => {
        e.preventDefault();
        form.post("/admin/login");
    };

    return (
        <div className="dark">
            <Head title="運営管理 ログイン" />
            <div className="min-h-screen bg-background text-foreground grid place-items-center p-4">
                <div className="w-full max-w-sm">
                    <div className="flex flex-col items-center gap-2 mb-6">
                        <div className="grid place-items-center size-12 rounded-xl bg-primary/15 text-primary">
                            <FontAwesomeIcon
                                icon={faShieldHalved}
                                className="size-6"
                            />
                        </div>
                        <div className="text-center">
                            <div className="font-bold text-lg tracking-tight">
                                ichigo-step 運営管理
                            </div>
                            <div className="text-xs text-muted-foreground">
                                Platform Operator Console
                            </div>
                        </div>
                    </div>

                    <div className="rounded-xl border border-border bg-card p-6">
                        <form onSubmit={submit} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label htmlFor="email">メールアドレス</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={form.data.email}
                                    onChange={(e) =>
                                        form.setData("email", e.target.value)
                                    }
                                    autoFocus
                                    autoComplete="email"
                                />
                                {form.errors.email && (
                                    <p className="text-xs text-destructive">
                                        {form.errors.email}
                                    </p>
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
                                    autoComplete="current-password"
                                />
                            </div>
                            <label className="flex items-center gap-2 text-sm cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={form.data.remember}
                                    onChange={(e) =>
                                        form.setData(
                                            "remember",
                                            e.target.checked,
                                        )
                                    }
                                    className="size-4 rounded border-border accent-primary"
                                />
                                ログイン状態を保持
                            </label>
                            <Button
                                type="submit"
                                disabled={form.processing}
                                className="w-full"
                            >
                                {form.processing ? "ログイン中..." : "ログイン"}
                            </Button>
                        </form>
                    </div>
                    <p className="text-center text-[11px] text-muted-foreground mt-4">
                        運営者専用。利用者ログインは
                        <a href="/login" className="underline mx-1">
                            こちら
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
