# Supabase セットアップ手順

デジタルメッセージボード用のデータベース・Storage を Supabase 上に構築する手順です。

## 前提

- [Supabase](https://supabase.com/) アカウント
- 新規プロジェクトを 1 つ作成済みであること

---

## 1. プロジェクト作成

1. Supabase Dashboard で **New project** をクリック
2. プロジェクト名・リージョン・DB パスワードを設定
3. 作成完了後、**Project Settings → API** から以下を控える
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

ローカルの `.env.local` に設定します（`.env.example` を参照）。

```bash
cp .env.example .env.local
```

---

## 2. テーブル作成（SQL 実行）

### 方法 A: SQL Editor（手軽）

1. Dashboard → **SQL Editor → New query**
2. 次の SQL を順に実行
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_anonymous_pages.sql`（ログインなしで HP 作成）
   - `supabase/migrations/003_page_profile.sql`（表示名・アイコン・開式時刻）
3. **Run** を実行
4. **Table Editor** で `pages` / `messages` / `photos` が作成されていることを確認

### 方法 B: Supabase CLI（推奨・チーム開発向け）

```bash
# CLI インストール（未導入の場合）
npm install -g supabase

# ログイン & プロジェクトリンク
supabase login
supabase link --project-ref <your-project-ref>

# マイグレーション適用
supabase db push
```

---

## 3. Storage バケットの確認

`001_initial_schema.sql` 実行時に `page-photos` バケットも作成されます。

Dashboard → **Storage** で以下を確認してください。

| 項目 | 値 |
|------|-----|
| バケット名 | `page-photos` |
| Public bucket | **ON**（公開読み取り） |
| ファイルサイズ上限 | 5 MB |
| 許可 MIME | jpeg, png, webp, gif |

### 画像パスの命名規則

アップロード時は次の形式を使います。

```
{page_id}/{uuid}.{ext}
```

例: `a1b2c3d4-....-....-....-............../f47ac10b-....-....-....-............jpg`

- 第 1 階層フォルダ名 = `pages.id`（UUID）
- RLS により UUID 形式のフォルダのみアップロード可能

---

## 5. スキーマ概要

### pages

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | 主キー（公開 URL `/pages/[page_id]` に使用） |
| user_id | uuid | 作成者（任意・匿名作成時は null） |
| title | text | ページタイトル |
| description | text | 説明文（任意） |
| start_date | date | 募集開始日（任意） |
| end_date | date | 募集終了日（任意） |
| created_at | timestamptz | 作成日時 |
| updated_at | timestamptz | 更新日時 |

### messages

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | 主キー |
| page_id | uuid | 投稿先ページ |
| sender_name | text | 投稿者名 |
| content | text | メッセージ本文 |
| created_at | timestamptz | 投稿日時 |

### photos

| カラム | 型 | 説明 |
|--------|-----|------|
| id | uuid | 主キー |
| page_id | uuid | 投稿先ページ |
| image_url | text | Storage の公開 URL |
| sender_name | text | 投稿者名 |
| created_at | timestamptz | 投稿日時 |

---

## 6. RLS（Row Level Security）ポリシー概要

| テーブル | 操作 | 権限 |
|----------|------|------|
| pages | SELECT | 全員（公開ページ閲覧） |
| pages | INSERT | 全員（匿名で HP 作成可） |
| messages | SELECT / INSERT | 全員（匿名投稿可） |
| messages | DELETE | ページ所有者のみ |
| photos | SELECT / INSERT | 全員（匿名投稿可） |
| photos | DELETE | ページ所有者のみ |
| storage.objects | SELECT | 全員（page-photos） |
| storage.objects | INSERT | 全員（UUID フォルダ配下のみ） |
| storage.objects | DELETE | ページ所有者のみ |

---

## 7. 動作確認用 SQL（任意）

SQL Editor で実行し、テーブルが正しく動くか確認できます。

```sql
insert into public.pages (title, description)
values (
  'みんなの寄せ書き',
  'メッセージと写真を自由に投稿してください'
)
returning id;
```

返ってきた `id` を使って:

```sql
insert into public.messages (page_id, sender_name, content)
values ('<上記の id>', '山田太郎', 'いつもありがとうございました！');
```

---

## トラブルシューティング

| 症状 | 対処 |
|------|------|
| HP 作成に失敗 | `002_anonymous_pages.sql` を実行したか確認 |
| Storage アップロード失敗 | パスが `{page_id}/{filename}` 形式か確認 |
| RLS で INSERT 拒否 | `page_id` が `pages` に存在するか確認 |
| 環境変数エラー | `.env.local` の URL / anon key を再確認 |
