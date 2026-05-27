import { Head, usePage } from "@inertiajs/react";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DashboardLayout } from "@/Layouts/DashboardLayout";

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
            <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-4xl w-full mx-auto">
                <Card>
                    <CardHeader>
                        <CardTitle>ようこそ、{user?.name} さん</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground">
                            アカウントの設定が完了しました。サイドバーから各機能にアクセスできます。
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
                            ※ LINE 公式アカウント連携・配信機能はまだ実装中です（Phase B-3b 以降で追加予定）。
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Home.layout = (page: React.ReactNode) => (
    <DashboardLayout>{page}</DashboardLayout>
);
