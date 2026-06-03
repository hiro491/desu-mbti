-- ページ作成時に管理者が設定する表示名・アイコン・ラベル

alter table public.pages
  add column if not exists page_label text,
  add column if not exists person_name text,
  add column if not exists avatar_url text,
  add column if not exists start_time text default '00:00',
  add column if not exists end_time text default '00:00';

update public.pages
set person_name = title
where person_name is null;
