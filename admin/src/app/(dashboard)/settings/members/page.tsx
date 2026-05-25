import { PlaceholderPage } from "@/components/placeholder-page";
import { faUsersGear } from "@fortawesome/free-solid-svg-icons";

export default function MembersSettingsPage() {
  return (
    <PlaceholderPage
      title="設定 / 運営メンバー"
      description="運営側メンバーのロール管理と監査ログ"
      icon={faUsersGear}
      step="Step AB-10 で招待 UI と監査ログを作ります"
    />
  );
}
