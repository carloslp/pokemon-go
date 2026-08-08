# Pokemon GO – Trainer Directory

A monorepo with a **React frontend** and a **Node/Express backend** for registering and discovering Pokemon GO trainers.

## Project structure

```
pokemon-go/
├── api/
│   └── index.js   – Vercel Serverless Function (Express app)
├── packages/
│   ├── backend/   – Express API source (Supabase + Cloudflare Turnstile)
│   └── frontend/  – Vite + React SPA
├── vercel.json    – Vercel build & routing configuration
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

## Deploy to Vercel

This project is fully compatible with [Vercel](https://vercel.com). The frontend (Vite + React SPA) is served as a static site and the Express API runs as a Vercel Serverless Function under the `/api` path.

### 1. Push your code to GitHub

Make sure your repository is on GitHub (or GitLab / Bitbucket).

### 2. Import the project in Vercel

1. Go to [vercel.com/new](https://vercel.com/new) and click **Add New → Project**.
2. Select your GitHub repository and click **Import**.
3. Vercel will auto-detect the settings from `vercel.json`:
   - **Build Command**: `npm run build`
   - **Output Directory**: `packages/frontend/dist`
4. Click **Deploy** — leave framework preset as **Other**.

### 3. Set environment variables in Vercel

In your project's **Settings → Environment Variables**, add:

| Variable | Description |
|---|---|
| `SUPABASE_URL` | Your Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service-role key (server-only, never exposed to the browser) |
| `TURNSTILE_SECRET_KEY` | Cloudflare Turnstile **secret** key |
| `ALLOWED_ORIGINS` | Your Vercel deployment URL (e.g. `https://your-app.vercel.app`) |
| `VITE_TURNSTILE_SITE_KEY` | Cloudflare Turnstile **site** key |
| `VITE_API_BASE_URL` | `/api` (the default; no change needed) |

> **Tip**: `VITE_*` variables are embedded into the frontend bundle at build time. All other variables are only available server-side in the Serverless Function.

### 4. Redeploy

After saving the environment variables, trigger a new deployment (**Deployments → Redeploy**) so the frontend is rebuilt with the correct `VITE_*` values.

### 5. Verify

- `https://your-app.vercel.app` → React SPA
- `https://your-app.vercel.app/api/health` → `{"status":"ok"}`
- `https://your-app.vercel.app/api/trainers` → JSON list of trainers

---

## Design system

Colors, typography and spacing are implemented as CSS custom properties (design tokens) in  
`packages/frontend/src/styles/tokens.css`. No hardcoded values in component styles.

- **Primary**: Teal Niantic `#2A9D8F`
- **Teams**: Mystic `#0055FF` · Valor `#FF0000` · Instinct `#FFCC00`
- **Font**: Lato (Google Fonts) — Bold/Black headings, Regular/Medium body, `line-height: 1.5`
- **Mobile-first**, 8px grid, min touch targets 44×44 px, pill buttons, card shadows