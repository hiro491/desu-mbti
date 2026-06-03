-- ============================================================
-- デジタルメッセージボード: 初期スキーマ
-- Supabase Dashboard > SQL Editor で実行するか、
-- Supabase CLI で `supabase db push` してください。
-- ============================================================

-- 拡張機能（UUID 生成）
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. pages（イベントページ / 寄せ書きページ）
-- ------------------------------------------------------------
create table public.pages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null check (char_length(trim(title)) > 0),
  description text,
  start_date date,
  end_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint pages_date_range check (
    start_date is null
    or end_date is null
    or start_date <= end_date
  )
);

comment on table public.pages is 'ユーザーが作成する寄せ書き・思い出共有ページ（1ユーザー最大3件）';

create index pages_user_id_idx on public.pages (user_id);
create index pages_created_at_idx on public.pages (created_at desc);

-- 1ユーザーあたり最大3ページ
create or replace function public.enforce_page_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  page_count integer;
begin
  select count(*)
  into page_count
  from public.pages
  where user_id = new.user_id;

  if page_count >= 3 then
    raise exception 'PAGE_LIMIT_EXCEEDED: 1ユーザーあたり最大3ページまで作成できます';
  end if;

  return new;
end;
$$;

create trigger pages_limit_before_insert
  before insert on public.pages
  for each row
  execute function public.enforce_page_limit();

-- updated_at 自動更新
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger pages_set_updated_at
  before update on public.pages
  for each row
  execute function public.set_updated_at();

-- ------------------------------------------------------------
-- 2. messages（テキスト投稿）
-- ------------------------------------------------------------
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages (id) on delete cascade,
  sender_name text not null check (char_length(trim(sender_name)) > 0),
  content text not null check (char_length(trim(content)) > 0),
  created_at timestamptz not null default now()
);

comment on table public.messages is 'ページへのテキストメッセージ投稿';

create index messages_page_id_created_at_idx
  on public.messages (page_id, created_at desc);

-- ------------------------------------------------------------
-- 3. photos（写真投稿）
-- ------------------------------------------------------------
create table public.photos (
  id uuid primary key default gen_random_uuid(),
  page_id uuid not null references public.pages (id) on delete cascade,
  image_url text not null check (char_length(trim(image_url)) > 0),
  sender_name text not null check (char_length(trim(sender_name)) > 0),
  created_at timestamptz not null default now()
);

comment on table public.photos is 'ページへの写真投稿（Storage の公開 URL を保存）';

create index photos_page_id_created_at_idx
  on public.photos (page_id, created_at desc);

-- ------------------------------------------------------------
-- Row Level Security (RLS)
-- ------------------------------------------------------------
alter table public.pages enable row level security;
alter table public.messages enable row level security;
alter table public.photos enable row level security;

-- pages: 所有者は CRUD、一般公開は SELECT のみ
create policy "pages_select_public"
  on public.pages
  for select
  using (true);

create policy "pages_insert_own"
  on public.pages
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "pages_update_own"
  on public.pages
  for update
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "pages_delete_own"
  on public.pages
  for delete
  to authenticated
  using (auth.uid() = user_id);

-- messages: 誰でも閲覧・投稿、所有者のみ削除
create policy "messages_select_public"
  on public.messages
  for select
  using (true);

create policy "messages_insert_public"
  on public.messages
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1
      from public.pages p
      where p.id = page_id
    )
  );

create policy "messages_delete_page_owner"
  on public.messages
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.pages p
      where p.id = messages.page_id
        and p.user_id = auth.uid()
    )
  );

-- photos: 誰でも閲覧・投稿、所有者のみ削除
create policy "photos_select_public"
  on public.photos
  for select
  using (true);

create policy "photos_insert_public"
  on public.photos
  for insert
  to anon, authenticated
  with check (
    exists (
      select 1
      from public.pages p
      where p.id = page_id
    )
  );

create policy "photos_delete_page_owner"
  on public.photos
  for delete
  to authenticated
  using (
    exists (
      select 1
      from public.pages p
      where p.id = photos.page_id
        and p.user_id = auth.uid()
    )
  );

-- ------------------------------------------------------------
-- Storage: page-photos バケット
-- （Dashboard から作成する場合は 002_storage_setup.sql も参照）
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'page-photos',
  'page-photos',
  true,
  5242880, -- 5MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- Storage RLS: 公開読み取り
create policy "page_photos_public_read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'page-photos');

-- Storage RLS: 誰でもアップロード可（page_id フォルダ配下のみ）
create policy "page_photos_public_upload"
  on storage.objects
  for insert
  to anon, authenticated
  with check (
    bucket_id = 'page-photos'
    and (storage.foldername(name))[1] ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
  );

-- Storage RLS: ページ所有者のみ削除
create policy "page_photos_owner_delete"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'page-photos'
    and exists (
      select 1
      from public.pages p
      where p.id = ((storage.foldername(name))[1])::uuid
        and p.user_id = auth.uid()
    )
  );
