import { Head, Link, usePage } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { StrawberryIcon } from "@/components/strawberry-icon";
import { cn } from "@/lib/utils";

type PageProps = {
    auth: {
        user: { id: number; name: string; email: string } | null;
    };
};

export default function Home() {
    const { props } = usePage<PageProps>();
    const user = props.auth.user;

    return (
        <>
            <Head title="ホーム" />
            <div className="min-h-screen bg-muted/30 flex flex-col">
                <header className="bg-background border-b border-border h-16 flex items-center px-6">
                    <div className="flex items-center gap-2">
                        <div className="grid place-items-center size-9 rounded-xl bg-primary/10">
                            <StrawberryIcon className="size-5" />
                        </div>
                        <div className="text-base font-bold">ichigo-step</div>
                    </div>
                    <div className="ml-auto flex items-center gap-3">
                        <span className="text-sm text-muted-foreground">
                            {user?.name}
                        </span>
                        <Link
                            href="/logout"
                            method="post"
                            as="button"
                            className={cn(
                                buttonVariants({ variant: "outline" }),
                                "h-9 gap-2",
                            )}
                        >
                            <FontAwesomeIcon
                                icon={faRightFromBracket}
                                className="size-3.5"
                            />
                            ログアウト
                        </Link>
                    </div>
                </header>

                <main className="flex-1 p-8 max-w-4xl w-full mx-auto">
                    <Card>
                        <CardHeader>
                            <CardTitle>ようこそ、{user?.name} さん</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                                アカウントの設定が完了しました。
                            </p>
                            <div className="text-sm space-y-1">
                                <div>
                                    <span className="text-muted-foreground">
                                        メールアドレス:{" "}
                                    </span>
                                    {user?.email}
                                </div>
                                <div>
                                    <span className="text-muted-foreground">
                                        User ID:{" "}
                                    </span>
                                    {user?.id}
                                </div>
                            </div>
                            <div className="pt-4 text-xs text-muted-foreground">
                                ※ LINE 公式アカウント連携・配信機能はまだ実装中です（Phase B-3 以降で追加予定）。
                            </div>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </>
    );
}
