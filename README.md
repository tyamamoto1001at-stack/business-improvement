# 業務棚卸し台帳

社内向けの業務棚卸し・方針管理Webアプリです。メンバーが自分の担当業務を登録し、
「新規・強化・維持・削減・委譲・廃止」の方針を設定して工数インパクトを見える化し、
チーム横断で集計・可視化します。

## 技術スタック

- [Next.js](https://nextjs.org/) 16 (App Router, TypeScript)
- [Prisma](https://www.prisma.io/) 7 + PostgreSQL (`@prisma/adapter-pg` ドライバアダプタ)
- [Auth.js](https://authjs.dev/) v5 (Credentials認証 / JWTセッション)
- [Tailwind CSS](https://tailwindcss.com/) v4
- [Recharts](https://recharts.org/) (集計グラフ)

## 画面構成

| 画面 | パス | 説明 |
| --- | --- | --- |
| ログイン / 新規登録 | `/login`, `/register` | Auth.js Credentials認証。**最初に登録したユーザーが自動的に管理者(ADMIN)になります。** |
| 個人ワーク | `/tasks` | 自分の業務のCRUD、現状/適用後工数計・削減見込みのサマリー |
| チーム集計 | `/team` | 全メンバーの業務を横断集計し、方針別・メンバー別のBefore/Afterグラフを表示 |
| 管理者 | `/admin` | カテゴリマスタの追加・削除、メンバーのADMIN/MEMBER権限切り替え(ADMIN限定) |

## 業務データモデル

各業務(`Task`)は以下を持ちます。

- 業務名 / カテゴリ(管理者が管理するマスタから選択) / 頻度(日次〜随時)
- 現状の月間工数 / 方針 / 方針適用後の想定月間工数 / 理由メモ

方針を選択すると、想定工数が自動提案されます(手動調整可能)。

| 方針 | 現状工数 | 適用後工数の初期提案 |
| --- | --- | --- |
| 新規 | 0h固定 | 手入力 |
| 強化 | 変更なし | 現状と同値 |
| 維持 | 変更なし | 現状と同値 |
| 削減 | 変更なし | 現状の60% |
| 委譲 | 変更なし | 現状の10% |
| 廃止 | 変更なし | 0h固定 |

## ローカル開発

### 1. 依存関係のインストール

```bash
npm install
```

`postinstall` で `prisma generate` が自動実行されます。

### 2. 環境変数の設定

```bash
cp .env.example .env
```

`.env` を編集し、`DATABASE_URL` にPostgreSQLの接続文字列を設定してください。
`AUTH_SECRET` は以下のいずれかで生成できます。

```bash
npx auth secret
# または
openssl rand -base64 33
```

### 3. データベースのマイグレーション

```bash
npx prisma migrate dev --name init
```

初期カテゴリ(営業・経理財務など)を投入する場合:

```bash
npm run db:seed
```

### 4. 開発サーバーの起動

```bash
npm run dev
```

`http://localhost:3000` にアクセスし、`/register` から最初のユーザー(管理者)を作成してください。

## Vercelへのデプロイ

1. GitHubリポジトリをVercelにインポートします。
2. Vercelプロジェクトの環境変数に以下を設定します。
   - `DATABASE_URL`: PostgreSQL接続文字列(Vercel Postgres、Neon、Supabase等)
   - `AUTH_SECRET`: `npx auth secret` などで生成したランダムな文字列
3. ビルドコマンドは `package.json` の `build` スクリプト(`prisma generate && next build`)がそのまま利用されます。
4. 初回デプロイ後、マイグレーションをデータベースに適用します(ローカルまたはCIから接続文字列を向けて実行)。

   ```bash
   npm run db:deploy
   ```

5. デプロイ後のアプリで `/register` にアクセスし、最初のユーザー(管理者)を作成してください。

## 主要なディレクトリ構成

```
prisma/
  schema.prisma       # User / Category / Task モデル
  seed.ts             # 初期カテゴリの投入スクリプト
src/
  auth.ts             # Auth.js設定(Credentials + JWT)
  lib/
    prisma.ts          # Prismaクライアント(driver adapter使用)
    constants.ts        # 方針・頻度のラベル、想定工数の自動提案ロジック
  app/
    login/, register/   # 認証画面
    (protected)/
      layout.tsx         # ログイン必須ガード + ナビゲーション
      tasks/              # 個人ワーク画面
      team/               # チーム集計画面
      admin/              # 管理者画面
```
