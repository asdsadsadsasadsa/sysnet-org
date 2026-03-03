# RLS Policies

## Principles
- Read public community content by default.
- Write only as authenticated owner/author.
- Sensitive tables (reports, private edges) are restricted.

## Suggested policy mapping

### profiles
- `select`: true
- `insert/update/delete`: `auth.uid() = id`

### posts/comments/likes
- `select`: true
- `insert`: `auth.uid() = author_id` (or user_id)
- `update/delete`: `auth.uid() = author_id`

### reports
- `insert`: authenticated users only
- `select`: admin-only (service role or explicit admin policy)

### connection_requests
- `select`: `auth.uid() in (from_user, to_user)`
- `insert`: `auth.uid() = from_user`
- `update`: `auth.uid() = to_user` for accepting/declining

### connections
- `select`: `auth.uid() in (user_a, user_b)` (or create public count view)
- `insert/delete`: service-role or trigger-driven from accepted requests

## Admin access
Use env var `ADMIN_EMAILS` and server-side checks for admin routes.
