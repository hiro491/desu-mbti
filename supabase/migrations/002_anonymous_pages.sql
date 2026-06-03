-- ログインなしで HP（ページ）を作成できるようにする

alter table public.pages
  alter column user_id drop not null;

drop trigger if exists pages_limit_before_insert on public.pages;
drop function if exists public.enforce_page_limit();

drop policy if exists "pages_insert_own" on public.pages;

create policy "pages_insert_public"
  on public.pages
  for insert
  to anon, authenticated
  with check (
    user_id is null
    or (auth.uid() is not null and auth.uid() = user_id)
  );
