# Pokemon GO – Trainer Directory

A monorepo with a **React frontend** and a **Node/Express backend** for registering and discovering Pokemon GO trainers.

## Project structure

```
pokemon-go/
├── packages/
│   ├── backend/   – Express API (Supabase + Cloudflare Turnstile)
│   └── frontend/  – Vite + React SPA
└── package.json   – npm workspaces root
```

## Quick start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

**Backend** – copy and fill `packages/backend/.env.example` → `packages/backend/.env`

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-only) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile **secret** key |
| `ALLOWED_ORIGINS` | Allowed frontend origins (comma-separated) |
| `PORT` | Backend port (default `3001`) |

**Frontend** – copy and fill `packages/frontend/.env.example` → `packages/frontend/.env`

| Variable | Description |
|---|---|
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile **site** key |
| `VITE_API_BASE_URL` | API base URL (default `/api`, proxied by Vite dev server) |

### 3. Create Supabase table

Run the SQL from [`packages/backend/README.md`](packages/backend/README.md) in your Supabase SQL editor.

### 4. Run development servers

```bash
npm run dev
```

Opens:
- Frontend → http://localhost:5173
- Backend  → http://localhost:3001

## Design system

Colors, typography and spacing are implemented as CSS custom properties (design tokens) in  
`packages/frontend/src/styles/tokens.css`. No hardcoded values in component styles.

- **Primary**: Teal Niantic `#2A9D8F`
- **Teams**: Mystic `#0055FF` · Valor `#FF0000` · Instinct `#FFCC00`
- **Font**: Lato (Google Fonts) — Bold/Black headings, Regular/Medium body, `line-height: 1.5`
- **Mobile-first**, 8px grid, min touch targets 44×44 px, pill buttons, card shadows