import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex min-h-screen min-h-0 bg-background">
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0 min-h-screen">
                <Header />
                <main className="flex-1 min-h-0 flex flex-col">{children}</main>
            </div>
        </div>
    );
}
