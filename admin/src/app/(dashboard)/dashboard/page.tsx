import { PlaceholderPage } from "@/components/placeholder-page";
import { faGaugeHigh } from "@fortawesome/free-solid-svg-icons";

export default function DashboardPage() {
  return (
    <PlaceholderPage
      title="ダッシュボード"
      description="プラットフォーム全体の KPI を確認"
      icon={faGaugeHigh}
      step="Step AB-4 で KPI カードと簡易グラフを作ります"
    />
  );
}
