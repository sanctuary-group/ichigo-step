# メール送信（Brevo SMTP）セットアップ

ichigo-step の送信メール（登録のメール認証リンク等）を Brevo 経由で送る設定手順。
無料プランで 1 日 300 通まで。送信元は `noreply@one-step-studio.jp`。

---

## 1. Brevo アカウント + SMTP キー発行

1. <https://www.brevo.com/> で無料アカウント作成（会社情報・送信目的の入力あり）
2. 管理画面右上のアカウント名 → **SMTP & API** → **SMTP** タブ
3. 表示される値を控える:
   - **SMTP Server**: `smtp-relay.brevo.com`
   - **Port**: `587`
   - **Login**: 自分のアカウントのメールアドレス（これが `MAIL_USERNAME`）
   - **「Generate a new SMTP key」** で SMTP キーを発行（これが `MAIL_PASSWORD`）
     - ※ アカウントのログインパスワードではない。発行時にしか表示されないので控える

---

## 2. 送信ドメイン認証（届くために必須）

Brevo 管理画面 → **Senders, Domains & Dedicated IPs** → **Domains** → `one-step-studio.jp` を追加 → 「Authenticate」。
Brevo が表示する **DNS レコードをお名前.com に登録**する（値は Brevo 画面のものを必ずコピー）:

| 種類 | 用途 | 登録先 |
|---|---|---|
| TXT（`brevo-code:...`） | ドメイン所有確認 | お名前.com DNS |
| TXT（DKIM） | 署名（迷惑メール対策） | Brevo 指定のホスト名で登録 |
| TXT（SPF / 任意） | 送信元許可 | 下記の注意を参照 |
| TXT（DMARC / 任意推奨） | ポリシー | `_dmarc.one-step-studio.jp` |

### ⚠️ SPF は「既存とマージ」

`one-step-studio.jp` に既に SPF レコード（`v=spf1 ...`）がある場合、**新しい SPF を別途追加してはいけない**（SPF は1ドメイン1レコード）。既存の値に `include:spf.brevo.com` を**追記**する:

```
v=spf1 include:_spf.google.com include:spf.brevo.com ~all   # ← 既存 include に足すイメージ
```

登録後、Brevo の Domains 画面で各レコードが「Verified（緑）」になれば完了（反映に最大数時間）。

---

## 3. `.env` に設定

`apps/api/.env`（本番）の `MAIL_*` を編集:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp-relay.brevo.com
MAIL_PORT=587
MAIL_USERNAME=（Brevo の Login = アカウントのメールアドレス）
MAIL_PASSWORD=（発行した SMTP キー）
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@one-step-studio.jp"
MAIL_FROM_NAME="ichigo-step"
```

反映:

```bash
docker compose -f docker-compose.prod.yml run --rm api php artisan config:cache
```

---

## 4. 送信テスト

```bash
docker compose -f docker-compose.prod.yml run --rm api php artisan tinker
```
```php
>>> Mail::raw('ichigo-step Brevo 送信テスト', function ($m) {
...     $m->to('自分の受信できるアドレス@example.com')->subject('テスト送信');
... });
```

- 受信できれば成功。Brevo 管理画面の **Transactional → Logs** にも送信履歴が出る
- 迷惑メールフォルダに入る場合は、ドメイン認証（DKIM/SPF）が Verified か再確認

---

## 5. 本番フローでの確認

1. `https://message.one-step-studio.jp/register` でメールアドレス入力 → 「認証メールを送信」
2. 実際に認証メールが届く → リンクから登録完了まで進める

---

## トラブルシュート

| 症状 | 対処 |
|---|---|
| 送信が 535 認証エラー | `MAIL_USERNAME` はアカウントのメール、`MAIL_PASSWORD` は SMTP キー（ログインPWではない）か確認 |
| 届くが迷惑メール扱い | Brevo Domains で DKIM/SPF が Verified か。`From` が認証済みドメインか |
| 1 日 300 通を超えた | 翌日まで送信停止。継続的に必要なら有料プラン or Amazon SES へ移行 |
| `config:cache` 後も古い設定 | `php artisan config:clear` → 再度 `config:cache` |
