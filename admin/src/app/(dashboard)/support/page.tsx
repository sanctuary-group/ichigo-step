import { PlaceholderPage } from "@/components/placeholder-page";
import { faLifeRing } from "@fortawesome/free-solid-svg-icons";

export default function SupportPage() {
  return (
    <PlaceholderPage
      title="サポート"
      description="テナントからの問い合わせチケット管理"
      icon={faLifeRing}
      step="Step AB-9 でチケット UI を作ります"
    />
  );
}
