-- ─── TINTAXIS — PHASE 7 MIGRATION ────────────────────────────────────────────
-- Reader identity + annotation persistence
-- Run in: Supabase Dashboard → SQL Editor → New query → Run
-- ─────────────────────────────────────────────────────────────────────────────

-- ── 1. Extend readers table ───────────────────────────────────────────────────
-- Add native auth columns (password_hash, reading_name).
-- Existing Stripe-only readers are unaffected — both columns nullable.

alter table public.readers
  add column if not exists password_hash text,
  add column if not exists reading_name  text;

-- ── 2. Annotations table ─────────────────────────────────────────────────────
-- One row per annotation. reader_id required — no anonymous annotations.
-- ink_type matches lib/types.ts InkType: ghost | ember | copper | archive | memory
-- signal ink questions go to the signals table, not here.

create table if not exists public.annotations (
  id               uuid        default gen_random_uuid() primary key,
  reader_id        uuid        not null references public.readers(id) on delete cascade,
  chapter_slug     text        not null,
  paragraph_index  integer     not null,
  start_offset     integer     not null,
  end_offset       integer     not null,
  selected_text    text        not null,
  note             text,
  ink_type         text        not null default 'ghost',
  is_public        boolean     not null default false,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Indexes
create index if not exists annotations_reader_chapter_idx
  on public.annotations(reader_id, chapter_slug);

create index if not exists annotations_chapter_public_idx
  on public.annotations(chapter_slug, is_public);

-- Auto-update updated_at (reuses the trigger function from supabase-schema.sql)
drop trigger if exists annotations_updated_at on public.annotations;
create trigger annotations_updated_at
  before update on public.annotations
  for each row execute function public.set_updated_at();

-- RLS off — we use service role key server-side only
alter table public.annotations disable row level security;
