-- ── TINTAXIS — WHISPERS TABLE ───────────────────────────────────────────────
-- Author-placed whispers: short notes anchored to specific text in a chapter.
-- These appear in the Margin World for authenticated readers.
--
-- Run in Supabase Dashboard → SQL Editor

create table if not exists public.whispers (
  id            uuid        default gen_random_uuid() primary key,
  chapter_slug  text        not null,
  chapter_title text,
  anchor_text   text        not null,    -- exact phrase from manuscript
  content       text        not null,    -- the author's whisper
  author_name   text        not null default 'Chico Montecristi',
  whisper_type  text        not null default 'whisper',  -- 'whisper' | 'anchor'
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index if not exists whispers_chapter_idx    on public.whispers(chapter_slug);
create index if not exists whispers_created_at_idx on public.whispers(created_at desc);

drop trigger if exists whispers_updated_at on public.whispers;
create trigger whispers_updated_at
  before update on public.whispers
  for each row execute function public.set_updated_at();

alter table public.whispers disable row level security;
