export type ProfileVisibility = "public" | "private";

export type Profile = {
  id: string;
  handle: string;
  display_name: string;
  visibility: ProfileVisibility;
  headline: string | null;
  bio: string | null;
  location: string | null;
  timezone: string | null;
  domains: string[];
  tags: string[];
  open_to: string[];
};

export type Post = {
  id: string;
  author_id: string;
  group_slug: string | null;
  title: string;
  body: string;
  created_at: string;
  updated_at: string;
};
