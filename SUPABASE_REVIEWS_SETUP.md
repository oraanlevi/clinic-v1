# Supabase Review System Setup

## 1) Create table + policies
Run SQL in Supabase SQL editor:
- `supabase/reviews.sql`

## 2) Configure client values
Edit `reviews-config.js`:
- `supabaseUrl`: your Supabase project URL
- `supabaseAnonKey`: your Supabase anon key
- `table`: keep `reviews` unless renamed

## 3) Moderation flow
- New submissions are inserted with `approved = false`
- They are never shown publicly until approved
- Approve inside Supabase Table Editor by toggling `approved` to `true`
- Homepages only fetch rows where `approved = true` and matching `language`

## 4) Optional admin workflow
For moderation at scale, create an internal admin page or use Supabase dashboard filters:
- `approved = false`
- sort by `created_at desc`

## 5) Static fallback data
If Supabase is not configured or unavailable:
- Homepage review sections stay empty and show the localized empty state
- No review cards are rendered until real approved reviews exist
