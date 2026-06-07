alter table public.customers
  add column if not exists industry text not null default '',
  add column if not exists website text not null default '',
  add column if not exists phone text not null default '',
  add column if not exists health_score integer not null default 70 check (health_score between 0 and 100),
  add column if not exists last_activity_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists archived_at timestamptz;

create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.customers(id) on delete cascade,
  owner_id uuid not null references auth.users(id) on delete cascade,
  first_name text not null,
  last_name text not null,
  title text not null default '',
  email text not null,
  phone text not null default '',
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.pipeline_stages (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  position integer not null check (position > 0),
  probability integer not null check (probability between 0 and 100),
  color text not null default '#64748b',
  is_closed boolean not null default false,
  is_won boolean not null default false,
  created_at timestamptz not null default now(),
  unique(owner_id, position),
  unique(owner_id, name)
);

create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.customers(id) on delete cascade,
  stage_id uuid not null references public.pipeline_stages(id),
  owner_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  amount numeric(14,2) not null default 0 check (amount >= 0),
  currency text not null default 'USD' check (currency in ('USD', 'EUR', 'SEK')),
  probability integer check (probability between 0 and 100),
  expected_close_date date not null,
  status text not null default 'open' check (status in ('open', 'won', 'lost')),
  loss_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  closed_at timestamptz
);

create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.customers(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('note', 'call', 'meeting', 'email', 'system')),
  subject text not null,
  body text not null default '',
  occurred_at timestamptz not null default now(),
  is_system boolean not null default false,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.crm_tasks (
  id uuid primary key default gen_random_uuid(),
  account_id uuid not null references public.customers(id) on delete cascade,
  deal_id uuid references public.deals(id) on delete set null,
  contact_id uuid references public.contacts(id) on delete set null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  assignee_id uuid not null references auth.users(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text not null default '',
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  due_at timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists contacts_one_primary_per_account_idx
  on public.contacts(account_id) where is_primary;
create index if not exists contacts_account_idx on public.contacts(account_id);
create index if not exists contacts_owner_idx on public.contacts(owner_id);
create index if not exists contacts_email_idx on public.contacts(lower(email));
create index if not exists pipeline_stages_owner_position_idx on public.pipeline_stages(owner_id, position);
create index if not exists deals_account_idx on public.deals(account_id);
create index if not exists deals_stage_status_idx on public.deals(stage_id, status);
create index if not exists deals_owner_close_idx on public.deals(owner_id, expected_close_date);
create index if not exists activities_account_occurred_idx on public.activities(account_id, occurred_at desc);
create index if not exists activities_owner_idx on public.activities(owner_id);
create index if not exists crm_tasks_account_idx on public.crm_tasks(account_id);
create index if not exists crm_tasks_assignee_due_idx on public.crm_tasks(assignee_id, due_at) where completed_at is null;
create index if not exists customers_active_owner_idx on public.customers(owner_id, created_at desc) where archived_at is null;
create index if not exists customers_company_search_idx on public.customers(lower(company));

insert into public.contacts (account_id, owner_id, first_name, last_name, email, is_primary)
select
  c.id,
  c.owner_id,
  split_part(c.name, ' ', 1),
  case
    when position(' ' in c.name) > 0 then substring(c.name from position(' ' in c.name) + 1)
    else ''
  end,
  c.email,
  true
from public.customers c
where not exists (
  select 1 from public.contacts contact where contact.account_id = c.id
);

insert into public.pipeline_stages (owner_id, name, position, probability, color, is_closed, is_won)
select owner_id, stage.name, stage.position, stage.probability, stage.color, stage.is_closed, stage.is_won
from (select distinct owner_id from public.customers) owners
cross join (
  values
    ('Lead', 1, 10, '#64748b', false, false),
    ('Qualified', 2, 30, '#2563eb', false, false),
    ('Proposal', 3, 55, '#7c3aed', false, false),
    ('Negotiation', 4, 75, '#ea580c', false, false),
    ('Won', 5, 100, '#059669', true, true),
    ('Lost', 6, 0, '#dc2626', true, false)
) as stage(name, position, probability, color, is_closed, is_won)
on conflict (owner_id, name) do nothing;

alter table public.contacts enable row level security;
alter table public.pipeline_stages enable row level security;
alter table public.deals enable row level security;
alter table public.activities enable row level security;
alter table public.crm_tasks enable row level security;

create policy "contacts owner or admin"
  on public.contacts for all to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

create policy "pipeline stages owner or admin"
  on public.pipeline_stages for all to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

create policy "deals owner or admin"
  on public.deals for all to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

create policy "activities select owner or admin"
  on public.activities for select to authenticated
  using (owner_id = auth.uid() or public.is_admin());

create policy "activities insert owner or admin"
  on public.activities for insert to authenticated
  with check (owner_id = auth.uid() or public.is_admin());

create policy "activities update non-system"
  on public.activities for update to authenticated
  using ((owner_id = auth.uid() or public.is_admin()) and (not is_system or public.is_admin()))
  with check ((owner_id = auth.uid() or public.is_admin()) and (not is_system or public.is_admin()));

create policy "activities delete non-system"
  on public.activities for delete to authenticated
  using ((owner_id = auth.uid() or public.is_admin()) and (not is_system or public.is_admin()));

create policy "crm tasks owner or admin"
  on public.crm_tasks for all to authenticated
  using (owner_id = auth.uid() or public.is_admin())
  with check (owner_id = auth.uid() or public.is_admin());

create or replace function public.crm_overview_metrics()
returns table (
  pipeline_value numeric,
  weighted_forecast numeric,
  open_deals bigint,
  won_value numeric,
  overdue_tasks bigint
)
language sql
stable
security invoker
set search_path = public
as $$
  select
    coalesce(sum(d.amount) filter (where d.status = 'open'), 0),
    coalesce(sum(d.amount * coalesce(d.probability, s.probability) / 100.0) filter (where d.status = 'open'), 0),
    count(*) filter (where d.status = 'open'),
    coalesce(sum(d.amount) filter (where d.status = 'won'), 0),
    (select count(*) from public.crm_tasks t where t.completed_at is null and t.due_at < now())
  from public.deals d
  join public.pipeline_stages s on s.id = d.stage_id;
$$;
