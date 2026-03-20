const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const res = await fetch(`${SUPABASE_URL}/rest/v1/profiles?select=id,handle,display_name,headline,location,tags,open_to,created_at&order=created_at.asc`, {
  headers: {
    apikey: SERVICE,
    Authorization: `Bearer ${SERVICE}`,
  },
});

if (!res.ok) {
  console.error('profiles query failed', res.status, await res.text());
  process.exit(2);
}

const rows = await res.json();

const suspicious = rows.filter((row) => {
  const handle = (row.handle || '').toLowerCase();
  const display = (row.display_name || '').trim();
  const headline = (row.headline || '').trim();
  const shortHandle = handle.length < 5;
  const noisyHandle = /(asd|gfg|test|temp)/.test(handle);
  const blankDisplay = !display;
  const genericHeadline = !headline || headline.toLowerCase() === 'systems engineer';
  return shortHandle || noisyHandle || blankDisplay || genericHeadline;
});

console.log(JSON.stringify({
  totalProfiles: rows.length,
  suspiciousProfiles: suspicious,
}, null, 2));
