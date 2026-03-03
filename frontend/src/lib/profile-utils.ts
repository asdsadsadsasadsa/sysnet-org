export function normalizeHandle(input: string): string {
  const cleaned = input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_\-\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return cleaned;
}

export function parseCsvList(
  csv: string,
  opts: { maxItems?: number; maxLen?: number } = {}
): string[] {
  const maxItems = opts.maxItems ?? 12;
  const maxLen = opts.maxLen ?? 32;

  const unique = new Set<string>();
  for (const raw of csv.split(',')) {
    const value = raw.trim().toLowerCase();
    if (!value) continue;
    if (value.length > maxLen) continue;
    unique.add(value);
    if (unique.size >= maxItems) break;
  }
  return [...unique];
}
