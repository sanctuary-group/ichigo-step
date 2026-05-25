import { PlaceholderPage } from "@/components/placeholder-page";
import { faFileInvoiceDollar } from "@fortawesome/free-solid-svg-icons";

export default function BillingPage() {
  return (
    <PlaceholderPage
      title="課金・請求"
      description="請求書一覧と未払い管理"
      icon={faFileInvoiceDollar}
      step="Step AB-7 で請求書テーブルを作ります"
    />
  );
}
