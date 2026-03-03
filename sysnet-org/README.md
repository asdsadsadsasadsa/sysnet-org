# ABRAKADABRA — Systems Engineers Network

Professional networking and collaboration hub for systems engineers.

## URL
- Production: pending first Vercel deploy (`synr.vercel.app` target)

## Features
- Magic link sign-in
- Onboarding + rich profiles
- People directory with search/filter
- Connection requests (send/accept/decline)
- Global feed, comments, likes
- Report flow for safety
- Admin moderation page (env-gated)

## Local setup
```bash
npm install
cp .env.example .env
# fill env values
npm run dev
```

## Required env vars
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_EMAILS`

## Deploy
- Connect repo to Vercel
- Set env vars in Vercel
- Deploy main branch

See `docs/runbook.md` and `docs/final-report.md`.
