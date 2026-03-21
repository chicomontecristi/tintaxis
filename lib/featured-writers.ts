// ─── FEATURED WRITERS ────────────────────────────────────────────────────────
// Writers published directly by Tintaxis — no application required.
// Add new writers here. Each writer gets a profile page at /writers/[slug].

export interface FeaturedWork {
  title: string;
  subtitle?: string;
  description: string;
  href?: string;          // live on Tintaxis — if set, card links there
  language?: string;      // "EN" | "ES" | "三" etc.
  wordCount?: string;
  comingSoon?: boolean;
}

export interface FeaturedWriter {
  slug: string;
  name: string;
  artistName?: string;    // if different from legal name
  photo?: string;         // path under /public, e.g. "/writers/chico.jpg"
  origin: string;         // e.g. "Santiago, Dominican Republic · South Bronx, NY"
  genre: string;          // short descriptor, e.g. "Dark Fiction · Oil Painter"
  shortBio: string;       // 1–2 sentences for the grid card
  fullBio: string;        // full paragraph for profile page
  works: FeaturedWork[];
  instagram?: string;     // handle without @
  website?: string;
}

// ─── ROSTER ──────────────────────────────────────────────────────────────────

export const FEATURED_WRITERS: FeaturedWriter[] = [
  {
    slug: "chico-montecristi",
    name: "José Elisaúl Chávez Martínez",
    artistName: "Chico Montecristi",
    photo: "/writers/chico-montecristi.jpg",
    origin: "Santiago, Dominican Republic · South Bronx, NY",
    genre: "Dark Fiction · Oil Painter",
    shortBio:
      "A writer and painter from the South Bronx by way of Santiago. His prose moves between English and Spanish, between the clinical and the violent, between grief and black humor.",
    fullBio:
      "Chico Montecristi was born in Santiago, Dominican Republic, and raised on Fulton Avenue in the South Bronx. He holds a B.S. in Public Health and an M.S.Ed. in Spanish Education from the University of Rochester, where he lived for thirteen years before moving west. He writes in English, Spanish, and Mandarin Chinese. His debut novella, The Hunt, is a dark psychological thriller set in a small Colorado town — a story of a child who killed her mother and the father who covered it up. His second manuscript, Recoleta, is a Spanish-language novella dedicated to all mothers. He is also an oil painter, working in expressionist figurative portraiture with unconventional surfaces — found wood, wire mesh, dried flowers, fabric. His visual work has been exhibited in Tucson and Phoenix. He currently lives in Yuma, Arizona.",
    works: [
      {
        title: "The Hunt",
        subtitle: "A Novella",
        description:
          "A child killed her mother. The father covered it up. Twenty years later, she comes back to finish what she started. Dark psychological thriller set in small-town Colorado.",
        href: "/chapter/one",
        language: "EN",
        wordCount: "~25,000 words",
      },
      {
        title: "Recoleta",
        subtitle: "Novela corta",
        description:
          "Dedicado a todas las madres. Rita, her asthma, and the silence left by the dead. A story of guilt, mothers, and a family secret buried in the Dominican Republic.",
        language: "ES",
        wordCount: "~11,600 palabras",
        comingSoon: true,
      },
      {
        title: "Mi Pájaro del Río",
        subtitle: "Colección · ES · 中文 · EN",
        description:
          "Letters written in three languages to the one called the river mouth bird. Rochester and Montauk. December 2017.",
        language: "三",
        comingSoon: true,
      },
    ],
    instagram: "chicomontecristi",
    website: "chicomontecristi.com",
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────────────

export function getWriterBySlug(slug: string): FeaturedWriter | undefined {
  return FEATURED_WRITERS.find((w) => w.slug === slug);
}

export function getAllWriterSlugs(): string[] {
  return FEATURED_WRITERS.map((w) => w.slug);
}
