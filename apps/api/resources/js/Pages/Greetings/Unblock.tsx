import { Head } from "@inertiajs/react";
import { faUserSlash } from "@fortawesome/free-solid-svg-icons";

import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { GreetingForm } from "@/components/greetings/greeting-form";

export default function GreetingsUnblock() {
    return (
        <>
            <Head title="あいさつメッセージ (ブロック解除友だち用)" />
            <GreetingForm
                type="unblock"
                submitUrl="/greetings/unblock"
                theme={{
                    badgeLabel: "ブロック解除時用",
                    badgeClass: "bg-orange-500 text-white",
                    icon: faUserSlash,
                    iconColorClass: "text-orange-500",
                    description: (
                        <>
                            このページで設定したメッセージ・アクションは{" "}
                            <span className="font-bold">
                                友だちのブロック解除時のみ
                            </span>{" "}
                            稼働します。
                        </>
                    ),
                    sectionTitle: "ブロック解除時のメッセージ・アクション設定",
                    testSteps: [
                        "友だち詳細ページ\n「削除」より\n友だち情報を削除",
                        "スマホのLINE上で\nLINE公式アカウントを\nブロック",
                        "スマホのLINE上で\nLINE公式アカウントを\nブロック解除",
                        "設定したアクションが\n稼働すれば\nテスト成功",
                    ],
                }}
            />
        </>
    );
}

GreetingsUnblock.layout = (page: React.ReactNode) => (
    <DashboardLayout>{page}</DashboardLayout>
);
