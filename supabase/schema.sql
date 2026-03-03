create extension if not exists pgcrypto;

create table if not exists public.players (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  main_team text not null default 'first' check (main_team in ('first', 'second')),
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

alter table public.players
add column if not exists main_team text not null default 'first' check (main_team in ('first', 'second'));

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
using (true);

drop policy if exists "players_insert_authenticated" on public.players;
create policy "players_insert_authenticated"
on public.players
for insert
to authenticated
with check (true);

drop policy if exists "players_update_authenticated" on public.players;
create policy "players_update_authenticated"
on public.players
for update
to authenticated
using (true)
with check (true);

drop policy if exists "players_delete_authenticated" on public.players;
create policy "players_delete_authenticated"
on public.players
for delete
to authenticated
using (true);

drop policy if exists "status_select_authenticated" on public.player_year_status;
create policy "status_select_authenticated"
on public.player_year_status
for select
to authenticated
using (true);

drop policy if exists "status_insert_authenticated" on public.player_year_status;
create policy "status_insert_authenticated"
on public.player_year_status
for insert
to authenticated
with check (true);

drop policy if exists "status_update_authenticated" on public.player_year_status;
create policy "status_update_authenticated"
on public.player_year_status
for update
to authenticated
using (true)
with check (true);

drop policy if exists "status_delete_authenticated" on public.player_year_status;
create policy "status_delete_authenticated"
on public.player_year_status
for delete
to authenticated
using (true);
