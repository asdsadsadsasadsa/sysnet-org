const ALLOWED = ['mentoring', 'consulting', 'hiring'] as const;

export function sanitizeOpenTo(values: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();

  for (const raw of values) {
    const value = raw.trim().toLowerCase();
    if (!(ALLOWED as readonly string[]).includes(value)) continue;
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(value);
    if (out.length >= 3) break;
  }

  return out;
}
