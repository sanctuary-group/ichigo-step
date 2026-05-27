import { Head, usePage } from "@inertiajs/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClock } from "@fortawesome/free-solid-svg-icons";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { DashboardLayout } from "@/Layouts/DashboardLayout";

type PageProps = {
    title: string;
};

export default function Placeholder() {
    const { props } = usePage<PageProps>();
    return (
        <>
            <Head title={props.title} />
            <div className="flex-1 flex items-center justify-center p-8">
                <Card className="max-w-md w-full">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <FontAwesomeIcon
                                icon={faClock}
                                className="size-5 text-primary"
                            />
                            {props.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            この画面は実装中です。
                        </p>
                        <p className="text-xs text-muted-foreground">
                            B-3b 以降のフェーズで順次実装予定です。
                        </p>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

Placeholder.layout = (page: React.ReactNode) => (
    <DashboardLayout>{page}</DashboardLayout>
);
