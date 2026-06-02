# ichigo-step 本番デプロイ手順（ConoHa VPS）

ConoHa VPS（ichigo-step 専用）に Docker で本番環境を構築する手順。
SSL はホストの nginx + certbot が終端し、Docker のアプリ（127.0.0.1:8080）へプロキシする。

```
インターネット ──443──▶ ホスト nginx + certbot ──▶ 127.0.0.1:8080 ──▶ Docker(nginx → php-fpm)
                         message.one-step-studio.jp                     mysql / redis / worker / scheduler
```

- ドメイン: **message.one-step-studio.jp**
- 構成: 単一 VPS 全部載せ（app / mysql / redis / worker / scheduler）
- メール: 当面 `log` ドライバ（**認証メールは送信されない** → 後述）

---

## 0. 事前準備（DNS）

お名前.com の DNS に **A レコードを 1 本追加**（既存レコードは触らない）:

| ホスト名 | TYPE | VALUE |
|---|---|---|
| `message` | A | VPS のグローバル IP |

`dig message.one-step-studio.jp +short` で VPS の IP が返れば OK。

---

## 1. VPS 初期セットアップ（Ubuntu 想定・初回のみ）

```bash
# Docker + compose plugin
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker "$USER"   # 再ログインで反映

# ホスト nginx + certbot
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx git

# ファイアウォール（22/80/443 のみ開放。3306/6379/8080 は開けない）
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

---

## 2. コード配置 + 環境設定

```bash
sudo mkdir -p /var/www && sudo chown "$USER" /var/www
cd /var/www
git clone <このリポジトリのURL> ichigo-step
cd ichigo-step

# compose 用 .env（DB パスワード等）
cp .env.prod.example .env
nano .env                      # DB_ROOT_PASSWORD / DB_PASSWORD を強固な値に

# Laravel 用 .env
cp apps/api/.env.production.example apps/api/.env
nano apps/api/.env             # ADMIN_PATH を秘密値に / DB_* を .env と一致させる
```

> ⚠️ `.env`（root）と `apps/api/.env` の **DB_DATABASE / DB_USERNAME / DB_PASSWORD は必ず一致**させること。

---

## 3. 依存インストール + アセットビルド

```bash
# PHP 依存（api イメージの composer を使用。先にイメージをビルド）
docker compose -f docker-compose.prod.yml build api
docker compose -f docker-compose.prod.yml run --rm api \
  composer install --no-dev --optimize-autoloader --no-interaction

# フロント（Vite）ビルド ※ ホストに node 不要、使い捨て node コンテナで実行
docker run --rm -v "$PWD/apps/api:/app" -w /app node:22-alpine \
  sh -c "corepack enable && pnpm install --frozen-lockfile && pnpm build"

# storage / cache 書き込み権限
chmod -R ug+w apps/api/storage apps/api/bootstrap/cache
```

---

## 4. 起動 + 初期化

```bash
docker compose -f docker-compose.prod.yml up -d

# APP_KEY 生成（apps/api/.env に書き込まれる）
docker compose -f docker-compose.prod.yml run --rm api php artisan key:generate

# マイグレーション
docker compose -f docker-compose.prod.yml run --rm api php artisan migrate --force

# 設定キャッシュ + storage シンボリックリンク
docker compose -f docker-compose.prod.yml run --rm api php artisan storage:link
docker compose -f docker-compose.prod.yml run --rm api php artisan config:cache
docker compose -f docker-compose.prod.yml run --rm api php artisan route:cache
docker compose -f docker-compose.prod.yml run --rm api php artisan view:cache

# 運営者アカウントの作成（seeder がある場合）。無ければ tinker で作成:
#   docker compose -f docker-compose.prod.yml run --rm api php artisan tinker
#   >>> \App\Models\Operator::create(['name'=>'運営','email'=>'admin@one-step-studio.jp','password'=>\Hash::make('強固なPW'),'role'=>'owner','is_active'=>true]);

# 動作確認（コンテナ側）
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:8080/login   # 200 を期待
```

---

## 5. ホスト nginx + SSL

```bash
sudo cp docker/host-nginx/message.one-step-studio.jp.conf \
        /etc/nginx/sites-available/message.one-step-studio.jp
sudo ln -s /etc/nginx/sites-available/message.one-step-studio.jp /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Let's Encrypt 証明書取得（443 / リダイレクトを自動追記）
sudo certbot --nginx -d message.one-step-studio.jp
# 自動更新の確認
sudo systemctl status certbot.timer
```

ブラウザで **https://message.one-step-studio.jp/login** が表示されれば完了。
運営管理は **https://message.one-step-studio.jp/<ADMIN_PATH>**。

---

## 6. バックアップ（必須）

```bash
chmod +x scripts/backup-db.sh
# cron 登録（毎日 3:15）
( crontab -l 2>/dev/null; echo "15 3 * * * /var/www/ichigo-step/scripts/backup-db.sh >> /var/log/ichigo-backup.log 2>&1" ) | crontab -
```

> ★ VPS が飛ぶとローカルバックアップごと失う。`scripts/backup-db.sh` 末尾の手順で
> **オブジェクトストレージ等へのオフサイト退避**を必ず設定すること。

---

## 7. 再デプロイ（コード更新時）

```bash
cd /var/www/ichigo-step
git pull

# 依存に変更があれば
docker compose -f docker-compose.prod.yml run --rm api composer install --no-dev --optimize-autoloader
docker run --rm -v "$PWD/apps/api:/app" -w /app node:22-alpine \
  sh -c "corepack enable && pnpm install --frozen-lockfile && pnpm build"

docker compose -f docker-compose.prod.yml run --rm api php artisan migrate --force
docker compose -f docker-compose.prod.yml run --rm api php artisan config:cache
docker compose -f docker-compose.prod.yml run --rm api php artisan route:cache
docker compose -f docker-compose.prod.yml run --rm api php artisan view:cache

# OPcache(validate_timestamps=0) のため、コード反映には再起動が必要
docker compose -f docker-compose.prod.yml up -d --build
docker compose -f docker-compose.prod.yml restart api api-worker api-scheduler
```

---

## 8. 各代理店（利用者）側の LINE 設定

本番ドメインで以下を案内:

- **Webhook URL**: `https://message.one-step-studio.jp/api/line/webhook/{channel_id}`
- **LIFF エンドポイント**: `https://message.one-step-studio.jp/liff/qr`（LINE Login チャネルは Messaging API と同一プロバイダー）
- **QR / 友だち追加 公開URL**: `https://message.one-step-studio.jp/qr/{token}` ほか

---

## 未対応・要対応メモ

- **メール送信（Brevo SMTP）**: `apps/api/.env.production.example` は Brevo 用に設定済み。
  実運用前に Brevo の SMTP キーを `apps/api/.env` の `MAIL_USERNAME` / `MAIL_PASSWORD` に入れ、
  Brevo の Domains で `one-step-studio.jp` を認証（SPF/DKIM をお名前.com に登録）すること。
  詳細手順は `docs/mail-brevo.md` を参照。設定後は `php artisan config:cache` し直す。
- **既存友だちの一括インポート**は未実装（認証済みアカウントなら `followers/ids` で実装可能）。
- DB は同一 VPS 内（コンテナ）。負荷増・HA が必要になったら同一リージョンの別インスタンス /
  マネージド DB へ分離を検討。
