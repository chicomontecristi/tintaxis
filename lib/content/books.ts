// ─── TINTAXIS BOOK REGISTRY ──────────────────────────────────────────────────
// All books available on the platform.
// Each book has metadata here + a separate content file for chapters.

import type { Book, Chapter } from "@/lib/types";
import { CHAPTERS, getChapter, getAllChapterSlugs } from "./chapters";
import { RECOLETA_CHAPTERS, getRecoletaChapter, getAllRecoletaChapterSlugs } from "./recoleta";
import { NOCHES_CHAPTERS, getNochesChapter, getAllNochesSlugs } from "./noches-de-maya";
import { PAJARO_CHAPTERS, getPajaroChapter, getAllPajaroSlugs } from "./mi-pajaro-del-rio";

// ─── BOOK METADATA ───────────────────────────────────────────────────────────

export const BOOKS: Record<string, Book> = {
  "the-hunt": {
    slug: "the-hunt",
    title: "The Hunt",
    subtitle: "A Novella",
    author: "Chico Montecristi",
    writerSlug: "chico-montecristi",
    language: "en",
    genre: "Dark psychological thriller / Southern Gothic",
    description: "In the small town of Little Pines, Colorado, a woman is found dead. Her husband is accused. Her daughter, Michelle, knows the truth — and has known it since she was eight years old.",
    tagline: "She was not the kind of person you could protect someone from.",
    accentColor: "#C0392B",
    coverLabel: "EN",
    firstChapterSlug: "one",
    chapterLabel: "Chapter",
    totalChapters: 7,
    wordCount: 25238,
    year: 2024,
  },
  "recoleta": {
    slug: "recoleta",
    title: "Recoleta",
    subtitle: "Una novela",
    author: "Chico Montecristi",
    writerSlug: "chico-montecristi",
    language: "es",
    genre: "Ficción literaria / Narrativa familiar",
    description: "Un narrador llega al Bronx con su madre y un tío desconocido. Entre los edificios de Fulton Avenue, el frío de febrero y los secretos de una pensión, descubre lo que significa sobrevivir.",
    tagline: "Duermo por no querer estar despierto.",
    accentColor: "#B87333",
    coverLabel: "ES",
    firstChapterSlug: "capitulo-uno",
    chapterLabel: "Capítulo",
    totalChapters: 4,
    wordCount: 12382,
    year: 2022,
  },
  "noches-de-maya": {
    slug: "noches-de-maya",
    title: "Noches de maya",
    subtitle: "Cuentos",
    author: "Chico Montecristi",
    writerSlug: "chico-montecristi",
    language: "es",
    genre: "Cuentos / Prosa literaria",
    description: "Nueve relatos del Caribe, el Bronx y el desierto del suroeste. Animales, amores perdidos, viejos amigos y el silencio de los edificios viejos.",
    tagline: "La vida no avisa. Solo pasa.",
    accentColor: "#6B3FA0",
    coverLabel: "ES",
    firstChapterSlug: "triste-de-cuna",
    chapterLabel: "Historia",
    totalChapters: 9,
    wordCount: 27862,
    year: 2022,
  },
  "mi-pajaro-del-rio": {
    slug: "mi-pajaro-del-rio",
    title: "Mi Pájaro del Río",
    subtitle: "una colección / a collection",
    author: "Chico Montecristi",
    writerSlug: "chico-montecristi",
    language: "es-zh",
    genre: "Letters / Cartas íntimas (Chinese & Spanish)",
    description: "Eight letters written in December 2017 from Rochester and Montauk, New York — in Mandarin Chinese and Spanish — to someone called 'my river mouth bird.' A record of love, distance, and the longest winter.",
    tagline: "我河口的鸟 — My river mouth bird.",
    accentColor: "#00E5CC",
    coverLabel: "ZH/ES",
    firstChapterSlug: "el-pajaro-viejo",
    chapterLabel: "Carta",
    totalChapters: 8,
    wordCount: 2815,
    year: 2017,
  },
};

// ─── CHAPTER LOOKUP ──────────────────────────────────────────────────────────

const CHAPTER_MAP: Record<string, Record<string, Chapter>> = {
  "the-hunt": CHAPTERS,
  "recoleta": RECOLETA_CHAPTERS,
  "noches-de-maya": NOCHES_CHAPTERS,
  "mi-pajaro-del-rio": PAJARO_CHAPTERS,
};

export function getBook(bookSlug: string): Book | null {
  return BOOKS[bookSlug] ?? null;
}

export function getAllBookSlugs(): string[] {
  return Object.keys(BOOKS);
}

export function getBookChapter(bookSlug: string, chapterSlug: string): Chapter | null {
  const chapters = CHAPTER_MAP[bookSlug];
  if (!chapters) return null;
  return chapters[chapterSlug] ?? null;
}

export function getBookChapterSlugs(bookSlug: string): string[] {
  const chapters = CHAPTER_MAP[bookSlug];
  if (!chapters) return [];
  return Object.keys(chapters);
}

export function getBookChaptersOrdered(bookSlug: string): Chapter[] {
  const chapters = CHAPTER_MAP[bookSlug];
  if (!chapters) return [];
  return Object.values(chapters).sort((a, b) => a.number - b.number);
}

export function getAdjacentChapters(bookSlug: string, chapterSlug: string): {
  prev: Chapter | null;
  next: Chapter | null;
} {
  const all = getBookChaptersOrdered(bookSlug);
  const idx = all.findIndex((c) => c.slug === chapterSlug);
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null,
  };
}
