create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to authenticated;

drop policy if exists "profiles are readable by owner or admin" on public.profiles;
drop policy if exists "users can update their own profile" on public.profiles;
drop policy if exists "profiles select own or admin" on public.profiles;
drop policy if exists "profiles update own public fields" on public.profiles;

create policy "profiles select own or admin"
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

create policy "profiles update own public fields"
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

revoke update on public.profiles from authenticated;
grant update (full_name, company) on public.profiles to authenticated;

drop policy if exists "customers are readable by owner or admin" on public.customers;
drop policy if exists "users manage their own customers" on public.customers;
drop policy if exists "customers select own or admin" on public.customers;
drop policy if exists "customers insert own or admin" on public.customers;
drop policy if exists "customers update own or admin" on public.customers;
drop policy if exists "customers delete own or admin" on public.customers;

create policy "customers select own or admin"
  on public.customers
  for select
  to authenticated
  using (owner_id = auth.uid() or public.is_admin());

create policy "customers insert own or admin"
  on public.customers
  for insert
  to authenticated
  with check (owner_id = auth.uid() or public.is_admin());

create policy "customers update own or admin"
  on public.customers
  for update
  to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

create policy "customers delete own or admin"
  on public.customers
  for delete
  to authenticated
  using (owner_id = auth.uid() or public.is_admin());
