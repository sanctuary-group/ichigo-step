import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export function DashboardLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex h-screen bg-background overflow-hidden">
            <Sidebar />
            <div className="flex flex-col flex-1 min-w-0 min-h-0">
                <Header />
                <main className="flex-1 min-h-0 flex flex-col overflow-hidden">{children}</main>
            </div>
        </div>
    );
}
