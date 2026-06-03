# 本番公開手順（Vercel + Supabase）

このアプリ（**みんなの寄せ書き**）をインターネット上に公開する手順です。  
**desu-mbti とは別リポジトリ・別 Vercel プロジェクト**としてデプロイしてください。

**本番では Supabase が必須**です（Vercel 上ではローカル保存は使えません）。

---

## 1. Supabase の準備

1. [Supabase](https://supabase.com/) で **新規プロジェクト**を作成（desu-mbti 用 DB と共用しないことを推奨）
2. **SQL Editor** で次を **順番に** 実行
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_anonymous_pages.sql`
   - `supabase/migrations/003_page_profile.sql`
3. **Project Settings → API** から控える
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 2. 新しい GitHub リポジトリを作成

1. GitHub で新規リポジトリを作成（例: `minna-yosegaki`）
2. ローカルで remote を差し替え（初回のみ）

```bash
git remote rename origin old-origin   # 既存が desu-mbti の場合
git remote add origin https://github.com/＜ユーザー名＞/minna-yosegaki.git
```

3. コードを push

```bash
git add .
git commit -m "みんなの寄せ書き: 初回公開"
git push -u origin main
```

---

## 3. Vercel にデプロイ

1. https://vercel.com にログイン
2. **Add New → Project**
3. 新しいリポジトリ（例: `minna-yosegaki`）を **Import**
4. プロジェクト名は `minna-yosegaki` など **desu-mbti と別名**にする
5. **Environment Variables** に追加

| 名前 | 値 |
|------|-----|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase の Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase の anon key |
| `NEXT_PUBLIC_SITE_URL` | デプロイ後の URL（後からでも可） |

6. **Deploy** をクリック

初回デプロイ後、表示された URL（例: `https://minna-yosegaki.vercel.app`）をコピーし、Vercel の環境変数 `NEXT_PUBLIC_SITE_URL` に設定して **Redeploy** してください（招待リンクのコピー用）。

---

## 4. 動作確認

1. 公開 URL のトップを開く
2. 表示名・プロフィール画像を入力して **HPを作成する**
3. 寄せ書きページでメッセージ・写真を投稿
4. 下部 **招待** で URL をコピーし、別端末からアクセス

---

## 代替: Vercel CLI

```bash
npx vercel login
npx vercel link
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
npx vercel env add NEXT_PUBLIC_SITE_URL
npx vercel --prod
```

---

## トラブルシューティング

| 症状 | 対処 |
|------|------|
| ページ作成に失敗 | Supabase の SQL（001〜003）を実行したか確認 |
| 写真がアップロードできない | Storage バケット `page-photos` が存在するか確認 |
| 招待 URL が localhost になる | `NEXT_PUBLIC_SITE_URL` を本番 URL に設定して再デプロイ |
| desu-mbti のサイトが開く | Vercel で別プロジェクト・別ドメインか確認 |
