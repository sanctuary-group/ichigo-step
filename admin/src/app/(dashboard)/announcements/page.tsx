import { PlaceholderPage } from "@/components/placeholder-page";
import { faBullhorn } from "@fortawesome/free-solid-svg-icons";

export default function AnnouncementsPage() {
  return (
    <PlaceholderPage
      title="お知らせ配信"
      description="運営から全テナント / プラン別 / 個別 への通知"
      icon={faBullhorn}
      step="Step AB-8 でエディタと配信履歴を作ります"
    />
  );
}
