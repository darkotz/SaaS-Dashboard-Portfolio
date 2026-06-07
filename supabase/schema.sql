create type public.app_role as enum ('user', 'admin');
create type public.customer_status as enum ('active', 'trial', 'at_risk', 'churned');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role public.app_role not null default 'user',
  company text not null default 'Personal Workspace',
  created_at timestamptz not null default now()
);

create table public.customers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade default auth.uid(),
  name text not null,
  email text not null,
  company text not null,
  status public.customer_status not null default 'trial',
  seats integer not null default 1 check (seats > 0),
  mrr integer not null default 0 check (mrr >= 0),
  created_at timestamptz not null default now()
);

create table public.subscriptions (
  user_id uuid primary key references auth.users(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  stripe_price_id text,
  status text not null default 'incomplete',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, company)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'company', 'Personal Workspace')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.customers enable row level security;
alter table public.subscriptions enable row level security;

create policy "profiles are readable by owner or admin"
  on public.profiles for select
  using (
    auth.uid() = id or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "customers are readable by owner or admin"
  on public.customers for select
  using (
    auth.uid() = owner_id or exists (
      select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'
    )
  );

create policy "users manage their own customers"
  on public.customers for all
  using (auth.uid() = owner_id)
  with check (auth.uid() = owner_id);

create policy "subscriptions are readable by owner"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create index customers_owner_id_idx on public.customers(owner_id);
create index subscriptions_customer_idx on public.subscriptions(stripe_customer_id);

-- Apply supabase/migrations/202606070001_add_customer_operations_crm.sql
-- after this base schema to add the CRM account, contact, pipeline,
-- activity, and task model.
