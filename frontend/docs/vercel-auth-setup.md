# Permanent Vercel Auth Setup (One-Time)

1. Create a Vercel token (Dashboard → Settings → Tokens).
2. Add these to your shell profile (`~/.bashrc` or `~/.zshrc`):

```bash
export VERCEL_TOKEN=your_token_here
export VERCEL_ORG_ID=your_org_id
export VERCEL_PROJECT_ID=your_project_id
```

3. Reload shell:

```bash
source ~/.bashrc   # or source ~/.zshrc
```

4. Verify:

```bash
cd frontend
npm run deploy:prod
```

This avoids repeated `vercel login` prompts.
