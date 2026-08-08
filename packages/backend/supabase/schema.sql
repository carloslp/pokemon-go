create extension if not exists pgcrypto;

create table if not exists public.trainers (
  id            uuid primary key default gen_random_uuid(),
  username      text not null unique,
  trainer_code  text not null unique,
  team          text not null check (team in ('mystic', 'valor', 'instinct')),
  ip_address    text,
  country       text,
  city          text,
  lat           numeric,
  lon           numeric,
  created_at    timestamptz not null default now()
);

alter table public.trainers enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'trainers'
      and policyname = 'Public read'
  ) then
    create policy "Public read" on public.trainers for select using (true);
  end if;
end
$$;
