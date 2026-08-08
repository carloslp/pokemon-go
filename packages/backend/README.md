# Backend – Pokemon GO Trainer Directory

## Environment variables

Copy `.env.example` to `.env` and fill in the values.

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role secret key (never expose to the client) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile **secret** key |
| `ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origins (default: `http://localhost:5173`) |
| `PORT` | HTTP port (default: `3001`) |

## Supabase table

Run this SQL in your Supabase SQL editor to create the required table:

```sql
create table public.trainers (
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

-- Enable Row Level Security
alter table public.trainers enable row level security;

-- Allow anonymous reads
create policy "Public read" on public.trainers for select using (true);

-- Only the service-role key may insert/update/delete
```

## Development

```bash
npm install
npm run dev
```
