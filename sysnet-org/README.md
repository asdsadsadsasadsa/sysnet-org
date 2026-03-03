# SYNR (Systems Engineers Network)

Professional networking site for systems engineers.

## Stack
- Next.js (App Router) + TypeScript
- Tailwind CSS
- Supabase (Auth + Postgres + RLS)
- Deploy on Vercel

## Local
```bash
npm install
cp .env.example .env
npm run dev
```

## Required env vars
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_EMAILS` (comma-separated)

## Setup order
1. Create Supabase project
2. Run `docs/schema.sql`
3. Configure Email magic link auth in Supabase
4. Add env vars locally and in Vercel
5. Deploy to Vercel

## MVP routes
- `/` landing
- `/onboarding` auth + profile setup
- `/people` directory
- `/u/[handle]` profile
- `/connect/requests` connection approvals
- `/feed` posts/comments/likes entrypoint
- `/post/[id]` thread + report
- `/g/[slug]` group feed
- `/admin` moderation (admin email gated)

## Notes
- Secrets remain in `.env` and Vercel env vars only.
- Rotate any credential ever shared in chat.
