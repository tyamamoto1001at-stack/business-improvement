# 業務棚卸し台帳

社内向けの業務棚卸し・方針整理アプリです。メンバーが自分の担当業務を登録し、
「新規・強化・維持・削減・委譲・廃止」の方針を設定して工数の変化を見える化します。

## 技術スタック

- [Next.js 16](https://nextjs.org/) (App Router, TypeScript)
- [Prisma 7](https://www.prisma.io/) + PostgreSQL
- [Auth.js (next-auth v5)](https://authjs.dev/) — Credentials認証
- [Tailwind CSS v4](https://tailwindcss.com/)
- [Recharts](https://recharts.org/) — チーム集計グラフ

## 画面構成

| 画面 | パス | 説明 |
| --- | --- | --- |
| ログイン | `/login` | Auth.js Credentials認証。未ログインは全画面アクセス不可 |
| 個人ワーク | `/work` | 自分の業務のCRUD、工数サマリー表示 |
| チーム集計 | `/team` | 全メンバー横断の方針別・メンバー別 Before/After グラフ |
| 管理者 | `/admin` | カテゴリ管理、メンバー追加・権限(ADMIN/MEMBER)管理 (ADMIN限定) |

## 方針と想定工数の自動提案

方針を選択すると、想定工数(方針適用後)の初期値が自動提案されます(`src/lib/ledger.ts`)。

| 方針 | 現状工数 | 想定工数の初期提案 |
| --- | --- | --- |
| 新規 | 0h固定 | 手入力 |
| 強化 | 現状のまま | 現状と同値 (手動調整可) |
| 維持 | 現状のまま | 現状と同値 (手動調整可) |
| 削減 | 現状のまま | 現状の60% |
| 委譲 | 現状のまま | 現状の10% |
| 廃止 | 現状のまま | 0h固定 |

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.example` を `.env` にコピーして値を設定してください。

```bash
cp .env.example .env
```

- `DATABASE_URL`: PostgreSQL接続文字列
- `AUTH_SECRET`: Auth.js署名用シークレット (`openssl rand -base64 32` で生成)
- `SEED_ADMIN_NAME` / `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD`: 初期管理者アカウント (シード時のみ使用)

### 3. データベースのマイグレーション & シード

```bash
npm run db:migrate   # マイグレーション適用 (開発用)
npm run db:seed       # 初期管理者ユーザー + カテゴリのシード
```

初期管理者アカウントでログイン後、管理者画面から他のメンバーを追加できます
(自己アカウント登録の画面はありません。メンバー追加は管理者のみ可能です)。

### 4. 開発サーバー起動

```bash
npm run dev
```

[http://localhost:3000](http://localhost:3000) を開いてください。

## スクリプト

| コマンド | 説明 |
| --- | --- |
| `npm run dev` | 開発サーバー起動 |
| `npm run build` | 本番ビルド |
| `npm run lint` | ESLint実行 |
| `npm run db:migrate` | Prismaマイグレーション (開発用、`prisma migrate dev`) |
| `npm run db:deploy` | Prismaマイグレーション適用 (本番用、`prisma migrate deploy`) |
| `npm run db:seed` | 初期管理者・カテゴリのシード |
| `npm run db:studio` | Prisma Studio起動 |

## Vercelへのデプロイ

1. PostgreSQLデータベースを用意 (Vercel Postgres / Neon / Supabase など)
2. Vercelプロジェクトの環境変数に `DATABASE_URL` と `AUTH_SECRET` を設定
3. Vercelプロジェクトの Build Command を `npm run vercel-build` に変更する
   (`prisma migrate deploy && next build` を実行し、デプロイ時にマイグレーションを自動適用します)
4. デプロイ後、初回のみ `npm run db:seed`
   (`DATABASE_URL` を本番用に設定したローカル環境、または `vercel env pull` した環境から実行) で
   初期管理者アカウントを作成してください

`postinstall` フックで `prisma generate` が自動実行されるため、
Prismaクライアントの生成コマンドを別途実行する必要はありません。

## ディレクトリ構成 (抜粋)

```
prisma/schema.prisma        # User / Category / BusinessTask モデル
prisma/seed.ts               # 初期管理者・カテゴリのシード
src/auth.ts                  # Auth.js (Credentials Provider) 設定
src/auth.config.ts           # proxy.ts と共有するEdge-safe設定 (ルート保護ロジック)
src/proxy.ts                 # ルート保護 (Next.js 16の Proxy, 旧middleware)
src/lib/ledger.ts             # 方針・頻度の定義、想定工数の自動提案ロジック
src/lib/dal.ts                # 認証・認可のデータアクセス層 (requireUser / requireAdmin)
src/app/login/                # ログイン画面
src/app/(app)/work/           # 個人ワーク画面
src/app/(app)/team/           # チーム集計画面
src/app/(app)/admin/          # 管理者画面 (カテゴリ管理・メンバー管理)
```
