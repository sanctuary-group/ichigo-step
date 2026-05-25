# ichigo-step

LINE 公式アカウント向けのマーケティングオートメーション SaaS（**MVP モックアップ**）。

エルメ（L Message）相当の機能を、Laravel 11 + MySQL + Next.js + マルチテナント構成で実装することを目指したプロジェクトの **フロントエンド静的モックアップ** です。バックエンド API は次フェーズで実装予定。

## デモ

公開 URL: **<https://ichigo-step.vercel.app/>**

ログイン画面でメール・パスワードを適当に入れて「ログイン」を押すと、ダッシュボードの 1:1 チャット画面に遷移します。すべての画面はモックデータで動作します。

## 構成

```
ichigo-step/
└── mockup/      # Next.js 16 + TypeScript + Tailwind v4 + shadcn/ui + Font Awesome
                 # 静的ダミーデータでデザイン確認用
```

将来 `apps/api/`（Laravel）を追加してモノレポ化する予定。

## 機能（モックアップ範囲）

- 1:1 チャット画面（3 ペイン: 友だちリスト + チャット履歴 + 右情報パネル）
- ダッシュボード（KPI カード + 折れ線 / 棒チャート + 最近の配信 / 進行中シナリオ）
- メッセージ配信（一覧 + エディタ、テキスト / 画像 / Flex の LINE 風プレビュー）
- ステップ配信（一覧 + エディタ、`@dnd-kit` でステップ並べ替え）
- 友だち一覧（検索 + タグ・状態フィルタ + タグ付与モーダル）
- タグ管理（カードグリッド + 色プリセット選択）
- 設定（チャネル登録 / メンバー招待・ロール管理 / プロフィール）
- ログイン / 新規登録 画面

すべての CRUD・送信ボタンはモック動作（実 API は呼ばない）。

## 技術スタック

- [Next.js 16](https://nextjs.org/) (App Router, Turbopack)
- [TypeScript](https://www.typescriptlang.org/) (strict)
- [Tailwind CSS v4](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/) (base-nova preset, base-ui ベース)
- [Font Awesome](https://fontawesome.com/) (アイコン)
- [@dnd-kit](https://dndkit.com/) (ドラッグ並べ替え)

## ローカルで動かす

前提: Node.js 20+ と pnpm。

```bash
cd mockup
pnpm install
pnpm dev
```

→ http://localhost:3000

## 参考

UI レイアウトは [L Message](https://lme.jp/) の実画面を参考に設計しています。バックエンド設計は line-harness-oss（Cloudflare Workers ベースの OSS）を参考にしており、Laravel + MySQL に翻訳予定です。

## ライセンス

[MIT](./LICENSE)
