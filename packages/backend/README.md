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

## Supabase scripts

Run [`supabase/schema.sql`](supabase/schema.sql) in your Supabase SQL editor.

The script is safe to re-run and sets up the backend requirements:

- enables `pgcrypto` for `gen_random_uuid()`
- creates the `public.trainers` table
- enables Row Level Security
- creates the `Public read` policy for anonymous selects

Because the backend uses the Supabase service-role key, no additional insert,
update or delete policy is required for the API server.

## Development

```bash
npm install
npm run dev
```
