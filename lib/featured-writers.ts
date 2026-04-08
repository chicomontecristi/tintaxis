// â”€â”€â”€ FEATURED WRITERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Featured writers published on Tintaxis.
// Add new writers here. Each writer gets a profile page at /writers/[slug].

export interface FeaturedWork {
  title: string;
  subtitle?: string;
  description: string;
  href?: string;          // live on Tintaxis â€” if set, card links there
  language?: string;      // "EN" | "ES" | "ä¸‰" etc.
  wordCount?: string;
  comingSoon?: boolean;
}

export interface FeaturedWriter {
  slug: string;
  name: string;
  artistName?: string;    // if different from legal name
  photo?: string;         // path under /public, e.g. "/writers/chico.jpg"
  origin: string;         // e.g. "Santiago, Dominican Republic Â· South Bronx, NY"
  genre: string;          // short descriptor, e.g. "Dark Fiction Â· Oil Painter"
  shortBio: string;       // 1â€“2 sentences for the grid card
  fullBio: string;        // full paragraph for profile page
  works: FeaturedWork[];
  honorific?: string;     // e.g. "Scriptor Honoris Causa" â€” shown under name
  instagram?: string;     // handle without @
  instagramPrivate?: boolean; // if true, show "Request Instagram" mailto instead of direct link
  website?: string;
  email?: string;
}

// â”€â”€â”€ ROSTER â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const FEATURED_WRITERS: FeaturedWriter[] = [
  {
    slug: "rosalva-flores-aleman",
    name: "Rosalva Flores-AlemÃ¡n, Ph.D.",
    photo: "/writers/rosalva-flores-aleman.jpg",
    origin: "Sonora, MÃ©xico Â· Tucson, AZ Â· Tennessee",
    genre: "Literary Scholarship Â· Latin American Fiction",
    shortBio:
      "A scholar and writer whose work moves between 19th-century Latin American literature and the living questions of cultural identity, performance, and what it means to belong. She writes and teaches in Spanish and English â€” often at the same time.",
    fullBio:
      "Rosalva Flores-AlemÃ¡n holds a Ph.D. in Literature from the University of Arizona (2022), where her research centered on 19th- and 20th-century Latin American literature, cultural studies, and the intersections of performance and subalternity. She is a native speaker of Spanish who has spent her academic career at the boundary between languages â€” teaching Spanish as a foreign language, working with Heritage Speakers recovering their own tongue, and building fully online courses that make rigorous literary study available to students who cannot reach a classroom. She has served as an academic advisor for Spanish Majors and Minors and as a Study Abroad advisor, personally recruiting and leading 33 students to Spain in 2021 and helping rescue a Costa Rica program from cancellation. Her pedagogy is built around first-generation students: active learning, critical thinking, and the conviction that literature is not a luxury but a tool. She writes with the same precision she demands in the classroom.",
    works: [
      {
        title: "Subalternity, 21st Century Diaspora",
        subtitle: "Essays Â· Poetry Â· PHaiLOSOPHY",
        description:
          "A collection moving across essay, poetry, and philosophical reflection â€” on silence, inheritance, and what it means to carry a culture across borders, languages, and generations.",
        language: "EN",
              },
    ],
    instagram: "rosalva.bp",
    instagramPrivate: true,
    website: undefined,
    email: "rosalva@tintaxis.com",
  },
  {
    slug: "jose-la-luz",
    name: "JosÃ© La Luz",
    honorific: "Scriptor Honoris Causa",
    photo: "/writers/jose-la-luz.jpg",
    origin: "Dominican Republic",
    genre: "Political Essay Â· Dominican Letters",
    shortBio:
      "A Dominican public intellectual and political figure whose writing addresses power, identity, and the condition of the Caribbean. His essays arrive with the weight of someone who has lived the history he describes.",
    fullBio:
      "JosÃ© La Luz is a Dominican political figure, intellectual, and writer whose work spans more than three decades of engagement with Caribbean politics, social development, and the lives of ordinary people. His writing draws from direct experience inside the institutions and movements that have shaped the Dominican Republic. He writes in Spanish â€” plainly, precisely, and without detachment. His essays are not commentary from the outside. They are testimony.",
    works: [
      {
        title: "Escritos de un Hombre PolÃ­tico",
        subtitle: "Ensayos Â· EspaÃ±ol",
        description:
          "A collection of political essays drawn from thirty years of public life in the Dominican Republic. On power, community, and the cost of conviction. Awaiting the author's word.",
        language: "ES",
              },
    ],
    instagram: undefined,
    website: undefined,
  },
  {
    slug: "chico-montecristi",
    name: "JosÃ© ElisaÃºl ChÃ¡vez MartÃ­nez",
    artistName: "Chico Montecristi",
    photo: "/writers/chico-montecristi.jpg",
    origin: "Santiago, Dominican Republic Â· South Bronx, NY",
    genre: "Dark Fiction Â· Oil Painter",
    shortBio:
      "A writer and painter from the South Bronx by way of Santiago. His prose moves between English and Spanish, between the clinical and the violent, between grief and black humor.",
    fullBio:
      "Chico Montecristi was born in Santiago, Dominican Republic, and raised on Fulton Avenue in the South Bronx. He holds a B.S. in Public Health and an M.S.Ed. in Spanish Education from the University of Rochester, where he lived for thirteen years before moving west. He writes in English, Spanish, Mandarin Chinese, Portuguese, Tamil, and Italian. His debut novella, The Hunt, is a dark psychological thriller set in a small Colorado town â€” a story of a child who killed her mother and the father who covered it up. His second manuscript, Recoleta, is a Spanish-language novella dedicated to all mothers. He is also an oil painter, working in expressionist figurative portraiture with unconventional surfaces â€” found wood, wire mesh, dried flowers, fabric. His visual work has been exhibited in Tucson and Phoenix. He currently lives in Yuma, Arizona.",
    works: [
      {
        title: "The Hunt",
        subtitle: "A Novella",
        description:
          "A child killed her mother. The father covered it up. Twenty years later, she comes back to finish what she started. Dark psychological thriller set in small-town Colorado.",
        href: "/chapter/one",
        language: "EN",
        wordCount: "~25,238 words",
      },
      {
        title: "Recoleta",
        subtitle: "Novela corta",
        description:
          "Dedicado a todas las madres. Rita, her asthma, and the silence left by the dead. A story of guilt, mothers, and a family secret buried in the Dominican Republic.",
        href: "/book/recoleta",
        language: "ES",
        wordCount: "~12,382 palabras",
              },
      {
        title: "Noches de maya",
        subtitle: "Cuentos",
        description:
          "Nueve relatos del Caribe, el Bronx y el desierto del suroeste. Animales, amores perdidos, viejos amigos y el silencio de los edificios viejos.",
        href: "/book/noches-de-maya",
        language: "ES",
        wordCount: "~27,862 palabras",
      },
      {
        title: "æˆ‘æ²³å£çš„é¸Ÿ",
        subtitle: "ä¹¦ä¿¡é›† Â· ä¸­æ–‡",
        description:
          "2017å¹´12æœˆï¼Œä»ŽRochesterå’ŒMontaukå¯„å‡ºçš„å…«å°ä¿¡ã€‚å†™ç»™é‚£åªæ²³å£çš„é¸Ÿã€‚",
        language: "ä¸­",
        href: "/book/mi-pajaro-del-rio",
              },
    ],
    instagram: "chicomontecristi",
    website: "montecristi.netlify.app",
  },
];

// â”€â”€â”€ HELPERS â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export function getWriterBySlug(slug: string): FeaturedWriter | undefined {
  return FEATURED_WRITERS.find((w) => w.slug === slug);
}

export function getAllWriterSlugs(): string[] {
  return FEATURED_WRITERS.map((w) => w.slug);
}

/**
 * Returns the Stripe Connect account ID for a writer, if they've connected.
 * Looks up env var STRIPE_CONNECT_{SLUG_UPPER_NODASHES}
 * e.g. jose-la-luz â†’ STRIPE_CONNECT_JOSE_LA_LUZ
 * Only callable server-side (reads process.env).
 */
export function getWriterConnectId(slug: string): string | undefined {
  const key = `STRIPE_CONNECT_${slug.toUpperCase().replace(/-/g, "_")}`;
  return process.env[key] || undefined;
}

/**
 * Revenue split: Tintaxis keeps 15%, writer keeps 85%.
 * Applied to every reader subscription payment.
 */
export const PLATFORM_SHARE = 0.15;
export const WRITER_SHARE   = 0.85;
