export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  sourceUrl: string;
  authorName: string;
  topic: string;
  publishedAt: string;
}

// Static news items removed — all articles now come from the newsGenerator pipeline.
// See backend/scripts/newsGenerator.mjs
export const newsItems: NewsItem[] = [];
