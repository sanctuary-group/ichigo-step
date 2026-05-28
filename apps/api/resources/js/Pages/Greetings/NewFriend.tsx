import { Head } from "@inertiajs/react";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";

import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { GreetingForm } from "@/components/greetings/greeting-form";

export default function GreetingsNewFriend() {
    return (
        <>
            <Head title="あいさつメッセージ (新規友だち用)" />
            <GreetingForm
                type="new_friend"
                submitUrl="/greetings/new-friend"
                theme={{
                    badgeLabel: "新規友だち用",
                    badgeClass: "bg-primary text-primary-foreground",
                    icon: faUserPlus,
                    iconColorClass: "text-primary",
                    description: (
                        <>
                            このページで設定したメッセージ・アクションは{" "}
                            <span className="font-bold">新規友だち</span>{" "}
                            が公式アカウントを友だち追加した瞬間に稼働します。
                        </>
                    ),
                    sectionTitle: "新規友だち追加時メッセージ・アクション設定",
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

GreetingsNewFriend.layout = (page: React.ReactNode) => (
    <DashboardLayout>{page}</DashboardLayout>
);
