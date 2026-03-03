# Runbook

## 1) Local setup
```bash
npm install
cp .env.example .env.local
npm run dev
```

## 2) Supabase setup
1. Create project
2. Enable Email magic links
3. Run SQL in `docs/schema.sql`
4. Enable RLS on all tables and apply policies from `docs/rls.md`

## 3) Vercel deployment
1. Import GitHub repo
2. Add env vars:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
   - `ADMIN_EMAILS`
3. Deploy

## 4) Domain
1. Purchase final `.org` domain
2. Add in Vercel project Domains
3. Set Namecheap DNS records to Vercel target

## 5) Verification checklist
- Landing page loads on custom domain
- Auth login succeeds
- Onboarding saves profile
- Directory returns users
- Connections request/accept works
- Post/comment/like/report works

## 6) Security reminders
- Never commit secrets
- Use Vercel env vars only
- Rotate exposed credentials immediately
