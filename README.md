# 業務棚卸し台帳

社内の業務を棚卸しし、方針(新規・強化・維持・削減・委譲・廃止)ごとの工数インパクトを可視化するための社内向けWebアプリです。

## 技術スタック

- [Next.js](https://nextjs.org) (App Router / TypeScript)
- [Prisma](https://www.prisma.io) + PostgreSQL
- [Auth.js (NextAuth v5)](https://authjs.dev) — メール/パスワードによる認証
- [Tailwind CSS v4](https://tailwindcss.com)
- [Recharts](https://recharts.org) — チーム集計グラフ

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` を `.env` にコピーし、値を設定してください。

```bash
cp .env.example .env
```

| 変数名 | 説明 |
| --- | --- |
| `DATABASE_URL` | PostgreSQLの接続文字列 |
| `AUTH_SECRET` | Auth.jsのセッション署名用シークレット(`openssl rand -base64 32` などで生成) |

### 3. データベースのマイグレーション & シード投入

```bash
npx prisma migrate dev
npx prisma db seed
```

シードでは以下が作成されます。

- 管理者アカウント: `admin@example.com` / `ChangeMe123!`(`SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` 環境変数で上書き可能。本番投入時は必ず変更してください)
- カテゴリのマスタデータ初期セット

### 4. 開発サーバーの起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開いてください。未ログインの場合は `/login` にリダイレクトされます。

## 画面構成

- `/tasks` — 個人ワーク: 自分の業務のCRUD、方針選択時の想定工数自動提案、工数サマリー表示
- `/team` — チーム集計: 全メンバーの業務を横断集計し、方針別・メンバー別のBefore/Afterグラフを表示
- `/admin` — 管理者専用: カテゴリマスタ管理、メンバーの権限(ADMIN/MEMBER)管理

## 方針と想定工数の自動提案ルール

| 方針 | 現状工数 | 適用後工数の初期提案 |
| --- | --- | --- |
| 新規 | 0h固定 | 手入力 |
| 強化 | 手入力 | 現状と同値(調整可) |
| 維持 | 手入力 | 現状と同値(調整可) |
| 削減 | 手入力 | 現状の60%(調整可) |
| 委譲 | 手入力 | 現状の10%(調整可) |
| 廃止 | 手入力 | 0h固定 |

## Vercelへのデプロイ

1. VercelでこのリポジトリをImportします。
2. Environment Variablesに `DATABASE_URL` と `AUTH_SECRET` を設定します(PostgreSQLは [Vercel Postgres](https://vercel.com/storage/postgres) や [Neon](https://neon.tech) 等を利用してください)。
3. ビルドコマンドは `next build` のままで問題ありません。`prisma generate` は `postinstall` で自動実行されます。
4. デプロイ後、初回のみマイグレーションとシードを実行してください。

```bash
npx prisma migrate deploy
npx prisma db seed
```

## 開発コマンド

```bash
npm run dev      # 開発サーバー起動
npm run build    # 本番ビルド
npm run lint     # ESLint
npx prisma studio # DBの内容をGUIで確認
```
