-- ─── TINTAXIS — SUPABASE SCHEMA ──────────────────────────────────────────────
-- Run this in: Supabase Dashboard → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- Readers table
-- One row per unique email. Updated on every checkout and subscription event.
create table if not exists public.readers (
  id                     uuid        default gen_random_uuid() primary key,
  email                  text        not null unique,
  name                   text,
  stripe_customer_id     text        unique,
  stripe_subscription_id text,
  tier                   text,       -- 'codex' | 'scribe' | 'archive' | 'chronicler'
  plan                   text,       -- 'manuscript' | 'press' (authors only)
  role                   text        not null default 'reader',  -- 'reader' | 'author'
  active                 boolean     not null default false,
  created_at             timestamptz not null default now(),
  updated_at             timestamptz not null default now()
);

-- Purchases table
-- One row per one-time chapter purchase (plan = 'read' or 'keep').
create table if not exists public.purchases (
  id                uuid        default gen_random_uuid() primary key,
  reader_id         uuid        not null references public.readers(id) on delete cascade,
  chapter_slug      text        not null,
  plan              text        not null,  -- 'read' | 'keep'
  stripe_session_id text        not null unique,
  amount            integer,              -- cents
  writer_slug       text,
  created_at        timestamptz not null default now()
);

-- Indexes for common lookups
create index if not exists readers_stripe_customer_id_idx  on public.readers(stripe_customer_id);
create index if not exists readers_stripe_sub_id_idx       on public.readers(stripe_subscription_id);
create index if not exists purchases_reader_chapter_idx    on public.purchases(reader_id, chapter_slug);

-- Auto-update updated_at on readers
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists readers_updated_at on public.readers;
create trigger readers_updated_at
  before update on public.readers
  for each row execute function public.set_updated_at();

-- Row Level Security
-- We use the service role key server-side, so RLS can be disabled for these tables.
-- If you ever expose data client-side, enable RLS and add policies.
alter table public.readers   disable row level security;
alter table public.purchases disable row level security;
