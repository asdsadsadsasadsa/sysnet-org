#!/usr/bin/env bash
set -euo pipefail

# Optional: load local .env for deploy vars
if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  . ./.env
  set +a
fi

required=(VERCEL_TOKEN VERCEL_ORG_ID VERCEL_PROJECT_ID)
for v in "${required[@]}"; do
  if [ -z "${!v:-}" ]; then
    echo "Missing required env var: $v" >&2
    exit 1
  fi
done

# Ensure we're linked to the expected project/org
if [ ! -f .vercel/project.json ]; then
  vercel link --yes --project sysnet-org --token "$VERCEL_TOKEN"
fi

echo "Deploying to Vercel project with pinned org/project IDs..."
vercel --prod --yes --token "$VERCEL_TOKEN" --scope "$VERCEL_ORG_ID"
