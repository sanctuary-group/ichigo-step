import { Head } from "@inertiajs/react";
import { faUserCheck } from "@fortawesome/free-solid-svg-icons";

import { DashboardLayout } from "@/Layouts/DashboardLayout";
import { GreetingForm } from "@/components/greetings/greeting-form";

export default function GreetingsExisting() {
    return (
        <>
            <Head title="あいさつメッセージ (既存友だち用)" />
            <GreetingForm
                type="existing"
                submitUrl="/greetings/existing"
                sendUrl="/greetings/existing/send"
                theme={{
                    badgeLabel: "既存友だち用",
                    badgeClass: "bg-sky-500 text-white",
                    icon: faUserCheck,
                    iconColorClass: "text-sky-500",
                    description: (
                        <>
                            このページで設定したメッセージ・アクションは{" "}
                            <span className="font-bold">既存友だち</span>{" "}
                            に対する一括送信です。「保存」した後に「既存友だち全員に今すぐ送信」ボタンで配信できます。
                        </>
                    ),
                    sectionTitle: "既存友だち向けメッセージ・アクション設定",
                    showSendButton: true,
                    testSteps: [
                        "友だち詳細ページ\n「削除」より\n友だち情報を削除",
                        "友だちのLINE上で\nLINE公式アカウントに\nスタンプを送信",
                        "設定した\nアクションが稼働すれば\nテスト成功",
                    ],
                }}
            />
        </>
    );
}

GreetingsExisting.layout = (page: React.ReactNode) => (
    <DashboardLayout>{page}</DashboardLayout>
);
