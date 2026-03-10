create extension if not exists pgcrypto;

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  first_name text not null check (char_length(first_name) between 2 and 40),
  last_initial text not null check (char_length(last_initial) = 1),
  city text not null check (char_length(city) between 2 and 60),
  language text not null check (language in ('en','it','fr','es')),
  rating int not null check (rating between 1 and 5),
  message text not null check (char_length(message) between 30 and 700),
  service_type text,
  consent boolean not null default false,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists reviews_language_approved_created_idx
  on public.reviews (language, approved, created_at desc);

alter table public.reviews enable row level security;

-- Public can submit reviews only.
drop policy if exists "public_insert_reviews" on public.reviews;
create policy "public_insert_reviews"
  on public.reviews
  for insert
  to anon
  with check (
    consent = true
    and approved = false
    and language in ('en','it','fr','es')
    and rating between 1 and 5
  );

-- Public can read approved reviews only.
drop policy if exists "public_select_approved_reviews" on public.reviews;
create policy "public_select_approved_reviews"
  on public.reviews
  for select
  to anon
  using (approved = true);
