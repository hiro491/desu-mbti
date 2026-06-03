# みんなの寄せ書き

**desu-mbti（デスMBTI）とは別プロジェクト**の、デジタル寄せ書き Web アプリです。

ボタンひとつで寄せ書きページができ、メッセージと写真が集まります。

## ローカル開発

```bash
npm install
cp .env.example .env.local
# .env.local に Supabase のキーを設定（省略時は .data にローカル保存）
npm run dev
```

http://localhost:3000 を開いてください。

## 本番公開

**Vercel + Supabase** で公開します。

- [docs/deploy.md](docs/deploy.md) — Vercel デプロイ手順
- [docs/supabase-setup.md](docs/supabase-setup.md) — DB・Storage 設定

公開用には **新しい GitHub リポジトリ**（例: `minna-yosegaki`）を作成し、`desu-mbti` とは分けて管理することを推奨します。

## 技術スタック

- Next.js (App Router) / TypeScript / Tailwind CSS / shadcn/ui
- Supabase（PostgreSQL + Storage）
