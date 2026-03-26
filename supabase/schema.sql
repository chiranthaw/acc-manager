-- Activities table for dynamic club activities
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  image_url text,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.activities enable row level security;

-- Policies for activities table
drop policy if exists "activities_select_authenticated" on public.activities;
create policy "activities_select_authenticated"
on public.activities
for select
to authenticated
using (public.is_admin_approved());

drop policy if exists "activities_select_anon_active" on public.activities;
create policy "activities_select_anon_active"
on public.activities
for select
to anon
using (is_active = true);

drop policy if exists "activities_insert_authenticated" on public.activities;
create policy "activities_insert_authenticated"
on public.activities
for insert
to authenticated
with check (public.is_admin_approved());

drop policy if exists "activities_update_authenticated" on public.activities;
create policy "activities_update_authenticated"
on public.activities
for update
to authenticated
using (public.is_admin_approved())
with check (public.is_admin_approved());

drop policy if exists "activities_delete_authenticated" on public.activities;
create policy "activities_delete_authenticated"
on public.activities
for delete
to authenticated
using (public.is_admin_approved());
create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  is_approved boolean not null default false,
  approved_at timestamptz,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.admin_users enable row level security;

drop policy if exists "admin_users_select_own" on public.admin_users;
create policy "admin_users_select_own"
on public.admin_users
for select
to authenticated
using (auth.uid() = user_id);

create or replace function public.is_admin_approved()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
      and is_approved = true
  );
$$;

grant execute on function public.is_admin_approved() to authenticated;

create or replace function public.handle_new_admin_user_row()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.admin_users (user_id, is_approved)
  values (new.id, false)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists trg_handle_new_admin_user_row on auth.users;
create trigger trg_handle_new_admin_user_row
after insert on auth.users
for each row
execute function public.handle_new_admin_user_row();

create or replace function public.get_admin_users()
returns table (
  user_id uuid,
  email text,
  is_approved boolean,
  approved_at timestamptz,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = public, auth
as $$
  select
    au.user_id,
    u.email,
    au.is_approved,
    au.approved_at,
    au.created_at
  from public.admin_users au
  join auth.users u on u.id = au.user_id
  where public.is_admin_approved()
  order by au.is_approved desc, u.email asc;
$$;

grant execute on function public.get_admin_users() to authenticated;

create or replace function public.set_admin_approval(
  target_email text,
  approve boolean default true
)
returns void
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  target_user_id uuid;
begin
  if not public.is_admin_approved() then
    raise exception 'You are not allowed to manage admin approvals.';
  end if;

  select id into target_user_id
  from auth.users
  where lower(email) = lower(trim(target_email))
  limit 1;

  if target_user_id is null then
    raise exception 'No account exists for email: %', target_email;
  end if;

  insert into public.admin_users (user_id, is_approved, approved_at, approved_by)
  values (
    target_user_id,
    approve,
    case when approve then now() else null end,
    case when approve then auth.uid() else null end
  )
  on conflict (user_id)
  do update set
    is_approved = excluded.is_approved,
    approved_at = excluded.approved_at,
    approved_by = excluded.approved_by;
end;
$$;

grant execute on function public.set_admin_approval(text, boolean) to authenticated;

-- News table for club news items
create table if not exists public.news (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  content text,
  image_url text,
  date date not null default now(),
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.news enable row level security;

-- Policies for news table
drop policy if exists "news_select_authenticated" on public.news;
create policy "news_select_authenticated"
on public.news
for select
to authenticated
using (public.is_admin_approved());

drop policy if exists "news_select_anon_active" on public.news;
create policy "news_select_anon_active"
on public.news
for select
to anon
using (is_active = true);

drop policy if exists "news_insert_authenticated" on public.news;
create policy "news_insert_authenticated"
on public.news
for insert
to authenticated
with check (public.is_admin_approved());

drop policy if exists "news_update_authenticated" on public.news;
create policy "news_update_authenticated"
on public.news
for update
to authenticated
using (public.is_admin_approved())
with check (public.is_admin_approved());

drop policy if exists "news_delete_authenticated" on public.news;
create policy "news_delete_authenticated"
on public.news
for delete
to authenticated
using (public.is_admin_approved());
-- Events table for matches, training, school, and other events
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  event_type text not null check (event_type in ('match', 'training', 'school', 'social', 'other')),
  date date not null,
  time time,
  location text,
  image_url text,
  is_active boolean not null default true,
  extra jsonb,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.teams (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  address text,
  logo_url text,
  is_active boolean not null default true,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.teams enable row level security;

drop policy if exists "teams_select_authenticated" on public.teams;
create policy "teams_select_authenticated"
on public.teams
for select
to authenticated
using (public.is_admin_approved());

drop policy if exists "teams_select_anon_active" on public.teams;
create policy "teams_select_anon_active"
on public.teams
for select
to anon
using (is_active = true);

drop policy if exists "teams_insert_authenticated" on public.teams;
create policy "teams_insert_authenticated"
on public.teams
for insert
to authenticated
with check (public.is_admin_approved());

drop policy if exists "teams_update_authenticated" on public.teams;
create policy "teams_update_authenticated"
on public.teams
for update
to authenticated
using (public.is_admin_approved())
with check (public.is_admin_approved());

drop policy if exists "teams_delete_authenticated" on public.teams;
create policy "teams_delete_authenticated"
on public.teams
for delete
to authenticated
using (public.is_admin_approved());

alter table public.events
  add column if not exists home_team_id uuid references public.teams(id) on delete set null;

alter table public.events
  add column if not exists away_team_id uuid references public.teams(id) on delete set null;

drop index if exists idx_events_home_team_id;
create index if not exists idx_events_home_team_id on public.events(home_team_id);

drop index if exists idx_events_away_team_id;
create index if not exists idx_events_away_team_id on public.events(away_team_id);

alter table public.events enable row level security;

-- Policies for events table
drop policy if exists "events_select_authenticated" on public.events;
create policy "events_select_authenticated"
on public.events
for select
to authenticated
using (public.is_admin_approved());

drop policy if exists "events_select_anon_active" on public.events;
create policy "events_select_anon_active"
on public.events
for select
to anon
using (is_active = true);

drop policy if exists "events_insert_authenticated" on public.events;
create policy "events_insert_authenticated"
on public.events
for insert
to authenticated
with check (public.is_admin_approved());

drop policy if exists "events_update_authenticated" on public.events;
create policy "events_update_authenticated"
on public.events
for update
to authenticated
using (public.is_admin_approved())
with check (public.is_admin_approved());

drop policy if exists "events_delete_authenticated" on public.events;
create policy "events_delete_authenticated"
on public.events
for delete
to authenticated
using (public.is_admin_approved());

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  email text,
  phone text,
  address text,
  main_team text not null default 'first' check (main_team in ('first', 'second')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.players
add column if not exists phone text;

alter table public.players
add column if not exists address text;

alter table public.players
add column if not exists email text;

alter table public.players
add column if not exists main_team text not null default 'first' check (main_team in ('first', 'second'));

alter table public.players
add column if not exists cpr_number char(10);

alter table public.players
add column if not exists category text not null default 'senior' check (category in ('senior', 'junior'));

alter table public.players
add column if not exists parent_name text;

alter table public.players
add column if not exists parent_email text;

alter table public.players
add column if not exists parent_phone text;

create table if not exists public.player_year_status (
  player_id uuid not null references public.players(id) on delete cascade,
  year int not null,
  membership_type text not null default 'none' check (membership_type in ('full', 'inactive', 'none')),
  payment_status text not null default 'unpaid' check (payment_status in ('paid', 'unpaid')),
  amount_due int not null default 2000 check (amount_due >= 0),
  amount_paid int not null default 0 check (amount_paid >= 0),
  updated_at timestamptz not null default now(),
  primary key (player_id, year)
);

alter table public.player_year_status
add column if not exists amount_due int not null default 2000 check (amount_due >= 0);

alter table public.player_year_status
add column if not exists amount_paid int not null default 0 check (amount_paid >= 0);

alter table public.player_year_status
alter column amount_due type int using round(amount_due);

alter table public.player_year_status
alter column amount_paid type int using round(amount_paid);

alter table public.player_year_status
alter column amount_due set default 2000;

alter table public.player_year_status
alter column amount_paid set default 0;

create index if not exists idx_player_year_status_year on public.player_year_status(year);

alter table public.players enable row level security;
alter table public.player_year_status enable row level security;

drop policy if exists "players_select_authenticated" on public.players;
create policy "players_select_authenticated"
on public.players
for select
to authenticated
using (public.is_admin_approved());

drop policy if exists "players_insert_authenticated" on public.players;
create policy "players_insert_authenticated"
on public.players
for insert
to authenticated
with check (public.is_admin_approved());

drop policy if exists "players_update_authenticated" on public.players;
create policy "players_update_authenticated"
on public.players
for update
to authenticated
using (public.is_admin_approved())
with check (public.is_admin_approved());

drop policy if exists "players_delete_authenticated" on public.players;
create policy "players_delete_authenticated"
on public.players
for delete
to authenticated
using (public.is_admin_approved());

drop policy if exists "status_select_authenticated" on public.player_year_status;
create policy "status_select_authenticated"
on public.player_year_status
for select
to authenticated
using (public.is_admin_approved());

drop policy if exists "status_insert_authenticated" on public.player_year_status;
create policy "status_insert_authenticated"
on public.player_year_status
for insert
to authenticated
with check (public.is_admin_approved());

drop policy if exists "status_update_authenticated" on public.player_year_status;
create policy "status_update_authenticated"
on public.player_year_status
for update
to authenticated
using (public.is_admin_approved())
with check (public.is_admin_approved());

drop policy if exists "status_delete_authenticated" on public.player_year_status;
create policy "status_delete_authenticated"
on public.player_year_status
for delete
to authenticated
using (public.is_admin_approved());
