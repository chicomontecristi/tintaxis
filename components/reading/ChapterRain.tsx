"use client";

import { useEffect, useRef } from "react";

// ─── PER-CHAPTER NARRATIVE DATA ───────────────────────────────────────────────
// Each chapter defines the entities (characters/objects) that get quantized,
// and event fragments (key moments) that materialize then dissolve into digits.
// Keyed by "bookSlug/chapterSlug" so every book has its own rain.

interface EntityDef {
  name: string;         // Character or object name
  role: string;         // Short descriptor shown beneath the name
  color: string;        // RGB string for this entity's stream color
}

interface ChapterConfig {
  entities: EntityDef[];
  events: string[];     // Key moments from the chapter
  digitColor: string;   // Background rain color
  glowColor: string;    // Glow for active elements
  bgAlpha: number;      // Trail fade alpha (lower = longer trails)
}

// ─── THE HUNT ────────────────────────────────────────────────────────────────
const THE_HUNT_CONFIGS: Record<string, ChapterConfig> = {
  one: {
    entities: [
      { name: "ROBBIN",  role: "the gossip",       color: "201,168,76"  },
      { name: "ALMA",    role: "the listener",      color: "180,210,180" },
      { name: "GERTRUDE",role: "the dead",          color: "220,200,160" },
      { name: "JOHN",    role: "the accused",       color: "160,180,200" },
      { name: "MICHELLE",role: "the girl",          color: "200,140,140" },
      { name: "BRYANT",  role: "the sheriff",       color: "180,160,120" },
    ],
    events: [
      "SHE SAID SUICIDE", "THE BLOOD", "GERTRUDE IS DEAD",
      "JOHN HELD HER", "MICHELLE WATCHED", "THE GUN BY THE BED",
      "NOBODY SAW IT", "FLINT CAME FROM NEW YORK", "THE STORY ISN'T OVER",
    ],
    digitColor: "201,168,76", glowColor: "201,168,76", bgAlpha: 0.18,
  },
  two: {
    entities: [
      { name: "DR CHILD", role: "the composed",    color: "160,200,180" },
      { name: "DR HARRIS",role: "the alcoholic",   color: "180,160,140" },
      { name: "MRS DWIGHT",role: "the patient",    color: "200,170,170" },
      { name: "ROBBIN",   role: "the gossip",      color: "201,168,76"  },
      { name: "BRYANT",   role: "the sheriff",     color: "180,160,120" },
    ],
    events: ["CORRIDOR B", "THE CASE FILES", "HER DIAGNOSIS", "HARRIS DRINKS AGAIN", "THE CLINIC KNOWS"],
    digitColor: "140,180,160", glowColor: "140,180,160", bgAlpha: 0.16,
  },
  three: {
    entities: [
      { name: "ALMA",    role: "at her desk",      color: "180,210,180" },
      { name: "ROBBIN",  role: "still talking",    color: "201,168,76"  },
    ],
    events: ["REGULAR HOURS", "THE WATCH ON HER WRIST", "THE DINER EMPTIES", "ALMA LISTENS"],
    digitColor: "170,200,170", glowColor: "170,200,170", bgAlpha: 0.15,
  },
  four: {
    entities: [
      { name: "JOHN",      role: "the father",     color: "160,180,200" },
      { name: "GERTRUDE",  role: "the remembered", color: "220,200,160" },
      { name: "MICHAEL",   role: "her brother",    color: "180,170,150" },
      { name: "MICHELLE",  role: "the daughter",   color: "200,140,140" },
    ],
    events: ["THE FAMILY CABIN", "MICHAEL SANDERS 1942-1972", "THE SMELL OF SYRUP", "BURIED IN THE PINES", "WHAT THE FATHER KNEW"],
    digitColor: "180,155,110", glowColor: "180,155,110", bgAlpha: 0.17,
  },
  five: {
    entities: [
      { name: "MICHELLE", role: "the hunter",      color: "200,100,100" },
      { name: "GERTRUDE", role: "the hunted",      color: "220,200,160" },
      { name: "JOHN",     role: "the complicit",   color: "160,180,200" },
    ],
    events: ["TODAY I GET TO KILL", "WHAT BLOOD REQUIRES", "THE LETTERS", "SHE ALWAYS KNEW", "THE HUNT BEGINS"],
    digitColor: "180,80,80", glowColor: "200,100,100", bgAlpha: 0.2,
  },
  six: {
    entities: [
      { name: "MRS DWIGHT",role: "the worst",      color: "200,170,200" },
      { name: "BRYANT",    role: "the lawman",     color: "180,160,120" },
      { name: "THE TOWN",  role: "the audience",   color: "160,160,160" },
    ],
    events: ["THE STORIES PEOPLE TELL", "WHAT LITTLE PINES REMEMBERS", "EVERYONE HAD A THEORY", "THE PINES KEEP QUIET"],
    digitColor: "160,140,180", glowColor: "160,140,180", bgAlpha: 0.16,
  },
  seven: {
    entities: [
      { name: "MICHELLE", role: "once again",      color: "160,20,20"   },
      { name: "JOHN",     role: "the kneeling",    color: "120,140,160" },
      { name: "GERTRUDE", role: "in the ground",   color: "180,160,130" },
      { name: "THE LAKE", role: "the witness",     color: "100,120,140" },
      { name: "THE GUN",  role: "the instrument",  color: "140,120,100" },
    ],
    events: ["MOTHER I HAVE KILLED YOU", "HE ALREADY KNEW", "KNEEL AT THE LAKE", "ONCE AGAIN", "SHE PULLED THE TRIGGER"],
    digitColor: "120,20,20", glowColor: "160,20,20", bgAlpha: 0.22,
  },
};

// ─── RECOLETA ────────────────────────────────────────────────────────────────
const RECOLETA_CONFIGS: Record<string, ChapterConfig> = {
  "capitulo-uno": {
    entities: [
      { name: "RITA",       role: "la asmática",      color: "180,140,100" },
      { name: "NARRADOR",   role: "la culpa",         color: "160,180,160" },
      { name: "PABLITO",    role: "el recuerdo",      color: "200,180,140" },
      { name: "FULTON AVE", role: "el bronx",         color: "140,140,180" },
    ],
    events: ["EL BRONX EN INVIERNO", "TÍO VÁSQUEZ HABLA", "EL ASMA DE RITA", "FULTON AVENUE"],
    digitColor: "180,140,100", glowColor: "180,140,100", bgAlpha: 0.17,
  },
  "capitulo-dos": {
    entities: [
      { name: "RITA",          role: "en la escuela",  color: "180,140,100" },
      { name: "LA NIEVE",      role: "el frío",        color: "200,210,220" },
      { name: "EL DESPERTAR",  role: "la verdad",      color: "201,168,76"  },
    ],
    events: ["LA ESCUELA CIERRA", "NIEVE SOBRE EL BRONX", "RITA DESPIERTA", "EL INVIERNO SIGUE"],
    digitColor: "200,210,220", glowColor: "200,210,220", bgAlpha: 0.16,
  },
  "capitulo-tres": {
    entities: [
      { name: "RITA",        role: "en los pasillos", color: "180,140,100" },
      { name: "LOS MONITORES", role: "vigilando",    color: "160,160,160" },
      { name: "EL RUIDO",   role: "la ciudad",       color: "140,130,120" },
    ],
    events: ["LOS PASILLOS VACÍOS", "MONITORES Y CÁMARAS", "RUIDO QUE NO PARA", "RITA CAMINA SOLA"],
    digitColor: "160,150,130", glowColor: "160,150,130", bgAlpha: 0.16,
  },
  "capitulo-cuatro": {
    entities: [
      { name: "RITA",           role: "la hija",       color: "180,140,100" },
      { name: "LAS PALABRAS",   role: "olvidadas",     color: "201,168,76"  },
      { name: "DOÑA ENCARNACIÓN", role: "la viuda",    color: "170,150,140" },
    ],
    events: ["PALABRAS QUE SE PIERDEN", "DEDICADO A LAS MADRES", "EL FIN DE RECOLETA", "SALCEDO RECUERDA"],
    digitColor: "180,140,100", glowColor: "201,168,76", bgAlpha: 0.18,
  },
};

// ─── NOCHES DE MAYA ──────────────────────────────────────────────────────────
const NOCHES_CONFIGS: Record<string, ChapterConfig> = {
  "triste-de-cuna": {
    entities: [
      { name: "NAIROBI",    role: "la vieja",        color: "180,160,120" },
      { name: "EL VIEJO",   role: "en la oscuridad", color: "140,130,120" },
      { name: "LASY",       role: "la perra tetona", color: "170,150,130" },
      { name: "MIZU",       role: "el gato insomnio", color: "130,140,160" },
    ],
    events: ["LA NOCHE EN MONTECRISTI", "EL VIEJO NO RESPONDE", "LA JAULA DE CRÍA", "NAIROBI PARTE AL MUELLE"],
    digitColor: "160,140,100", glowColor: "180,160,120", bgAlpha: 0.18,
  },
  "dos-pajaros": {
    entities: [
      { name: "DOS PÁJAROS", role: "el nido",        color: "140,180,140" },
      { name: "LAS DUNAS",   role: "la arena",       color: "210,190,150" },
      { name: "LA CORONA",   role: "verde",           color: "100,160,100" },
    ],
    events: ["EL NIDO ENTRE DUNAS", "PÁJAROS SOBRE EL MAR", "LA CORONA VERDE", "EL VIENTO CANTA"],
    digitColor: "140,180,140", glowColor: "140,180,140", bgAlpha: 0.16,
  },
  "viejo-amigo": {
    entities: [
      { name: "VIEJO AMIGO", role: "la distancia",  color: "180,140,100" },
      { name: "EL RON",      role: "la memoria",    color: "201,168,76"  },
    ],
    events: ["LA DISTANCIA CRECE", "RON EN LA MESA", "IMAGINACIÓN VUELA", "VIEJO AMIGO RECUERDA"],
    digitColor: "180,140,100", glowColor: "201,168,76", bgAlpha: 0.17,
  },
  "pinto-un-largo-cristal": {
    entities: [
      { name: "NUEVO MÉXICO", role: "el desierto",  color: "210,170,100" },
      { name: "LA BIBLIOTECA", role: "los libros",  color: "160,140,120" },
      { name: "LOS LAGARTOS", role: "el sol",       color: "140,160,100" },
    ],
    events: ["CRISTAL LARGO", "NUEVO MÉXICO ARDE", "LA BIBLIOTECA GUARDA", "LAGARTOS EN LA PIEDRA"],
    digitColor: "210,170,100", glowColor: "210,170,100", bgAlpha: 0.17,
  },
  "a-espaldas-de-mi-abuela": {
    entities: [
      { name: "MI ABUELA",  role: "la dulzura",     color: "200,170,140" },
      { name: "LA CAMA",    role: "el descanso",     color: "180,160,150" },
    ],
    events: ["A ESPALDAS DE ELLA", "LA DULZURA PERDURA", "EL HÁBITO DEL AMOR", "LA CAMA ESPERA"],
    digitColor: "200,170,140", glowColor: "200,170,140", bgAlpha: 0.16,
  },
  "cuento-amarillo": {
    entities: [
      { name: "LA HIJA",     role: "en la cuna",    color: "220,200,80"  },
      { name: "LA MECEDORA",  role: "el ritmo",     color: "180,170,100" },
    ],
    events: ["CUENTO AMARILLO", "LA CUNA SE MECE", "LA HIJA DUERME", "AMARILLO COMO EL SOL"],
    digitColor: "220,200,80", glowColor: "220,200,80", bgAlpha: 0.16,
  },
  "la-hermana-del-patron": {
    entities: [
      { name: "LA HERMANA", role: "el secreto",     color: "200,140,140" },
      { name: "EL PATRÓN",  role: "el poder",       color: "160,140,120" },
      { name: "EL CALOR",   role: "el cartón",      color: "210,170,100" },
    ],
    events: ["EL SECRETO SALE", "EL CALOR SOFOCA", "CARTÓN Y SUDOR", "LA HERMANA HUYE"],
    digitColor: "200,140,140", glowColor: "200,140,140", bgAlpha: 0.18,
  },
  "pies-secos-pies-mojados": {
    entities: [
      { name: "EMILIO",      role: "la travesía",   color: "100,140,200" },
      { name: "LA BOTELLA",  role: "la sed",         color: "140,180,180" },
      { name: "LA VENTANA",  role: "la esperanza",   color: "180,200,220" },
    ],
    events: ["PIES SECOS", "PIES MOJADOS", "EMILIO EN EL MAR", "LA VENTANA SE CIERRA"],
    digitColor: "100,140,200", glowColor: "140,180,200", bgAlpha: 0.18,
  },
  "mueren-dos": {
    entities: [
      { name: "LA SALA",    role: "el silencio",     color: "140,120,120" },
      { name: "EL TALADRO", role: "el ruido",        color: "180,140,100" },
      { name: "EL CAFÉ",    role: "la calma",        color: "160,140,110" },
    ],
    events: ["MUEREN DOS", "LA SALA VACÍA", "EL TALADRO SUENA", "CAFÉ FRÍO EN LA MESA"],
    digitColor: "140,120,120", glowColor: "160,130,120", bgAlpha: 0.19,
  },
};

// ─── MI PÁJARO DEL RÍO ──────────────────────────────────────────────────────
const PAJARO_CONFIGS: Record<string, ChapterConfig> = {
  "el-pajaro-viejo": {
    entities: [
      { name: "河口的老鸟",  role: "el pájaro viejo", color: "140,180,140" },
      { name: "EL RÍO",     role: "la memoria",      color: "100,140,200" },
      { name: "DICIEMBRE",   role: "el invierno",     color: "180,200,220" },
    ],
    events: ["多年没有做梦", "EL PÁJARO DEL RÍO", "DICIEMBRE 19", "LA CARTA COMIENZA"],
    digitColor: "140,180,140", glowColor: "140,180,140", bgAlpha: 0.16,
  },
  "dificultades": {
    entities: [
      { name: "困难重重",    role: "dificultades",    color: "200,160,100" },
      { name: "LA DISTANCIA", role: "entre dos",      color: "180,160,140" },
    ],
    events: ["困难重重", "DIFICULTADES", "DICIEMBRE 22", "LA DISTANCIA CRECE"],
    digitColor: "200,160,100", glowColor: "200,160,100", bgAlpha: 0.17,
  },
  "lonely-christmas": {
    entities: [
      { name: "孤独的圣诞",  role: "lonely christmas", color: "180,100,100" },
      { name: "LA SOLEDAD",  role: "el vacío",         color: "160,140,160" },
    ],
    events: ["LONELY CHRISTMAS", "孤独的圣诞", "DICIEMBRE 26", "SOLO EN LA NOCHE"],
    digitColor: "180,100,100", glowColor: "180,100,100", bgAlpha: 0.18,
  },
  "la-carta-de-los-regalos": {
    entities: [
      { name: "礼物的封信",  role: "carta de regalos", color: "201,168,76"  },
      { name: "LOS REGALOS", role: "la generosidad",   color: "180,170,100" },
    ],
    events: ["礼物的封信", "LOS REGALOS", "DICIEMBRE 28", "LO QUE DAMOS"],
    digitColor: "201,168,76", glowColor: "201,168,76", bgAlpha: 0.17,
  },
  "por-que-escribo": {
    entities: [
      { name: "为什么写",    role: "por qué escribo", color: "160,180,200" },
      { name: "LA PLUMA",    role: "la razón",        color: "140,160,180" },
    ],
    events: ["为什么写", "POR QUÉ ESCRIBO", "LA TINTA FLUYE", "LAS PALABRAS VIVEN"],
    digitColor: "160,180,200", glowColor: "160,180,200", bgAlpha: 0.16,
  },
  "el-sabor": {
    entities: [
      { name: "味道",        role: "el sabor",        color: "200,170,100" },
      { name: "LA MEMORIA",  role: "el paladar",      color: "180,150,120" },
    ],
    events: ["味道", "EL SABOR", "DICIEMBRE 30", "LO QUE SE RECUERDA"],
    digitColor: "200,170,100", glowColor: "200,170,100", bgAlpha: 0.17,
  },
  "montauk": {
    entities: [
      { name: "MONTAUK",    role: "el faro",          color: "100,140,180" },
      { name: "EL MAR",     role: "el horizonte",     color: "120,160,200" },
      { name: "EL FARO",    role: "la luz",           color: "201,168,76"  },
    ],
    events: ["MONTAUK", "EL FARO EN LA NIEBLA", "EL MAR DE DICIEMBRE", "LA LUZ SE APAGA"],
    digitColor: "100,140,180", glowColor: "120,160,200", bgAlpha: 0.18,
  },
  "te-he-perdido": {
    entities: [
      { name: "失去妳了",    role: "te he perdido",   color: "160,80,80"   },
      { name: "EL ADIÓS",   role: "la pérdida",      color: "140,100,100" },
      { name: "河口的鸟",    role: "mi pájaro",       color: "140,180,140" },
    ],
    events: ["失去妳了", "TE HE PERDIDO", "EL ÚLTIMO DÍA", "河口的鸟 VUELA"],
    digitColor: "160,80,80", glowColor: "160,80,80", bgAlpha: 0.2,
  },
};

// ─── COMBINED REGISTRY ──────────────────────────────────────────────────────
// Access pattern: BOOK_CONFIGS[bookSlug][chapterSlug]
const BOOK_CONFIGS: Record<string, Record<string, ChapterConfig>> = {
  "the-hunt": THE_HUNT_CONFIGS,
  "recoleta": RECOLETA_CONFIGS,
  "noches-de-maya": NOCHES_CONFIGS,
  "mi-pajaro-del-rio": PAJARO_CONFIGS,
};

// Book-level fallback configs — used when a chapter slug isn't found
const BOOK_DEFAULTS: Record<string, ChapterConfig> = {
  "the-hunt": {
    entities: [{ name: "THE HUNT", role: "a novella", color: "201,168,76" }],
    events: ["THE STORY CONTINUES"],
    digitColor: "201,168,76", glowColor: "201,168,76", bgAlpha: 0.16,
  },
  "recoleta": {
    entities: [{ name: "RECOLETA", role: "una novela", color: "180,140,100" }],
    events: ["LA HISTORIA CONTINÚA"],
    digitColor: "180,140,100", glowColor: "180,140,100", bgAlpha: 0.16,
  },
  "noches-de-maya": {
    entities: [{ name: "NOCHES DE MAYA", role: "cuentos", color: "160,140,100" }],
    events: ["LA NOCHE SIGUE"],
    digitColor: "160,140,100", glowColor: "160,140,100", bgAlpha: 0.16,
  },
  "mi-pajaro-del-rio": {
    entities: [{ name: "河口的鸟", role: "mi pájaro del río", color: "140,180,140" }],
    events: ["河口的鸟"],
    digitColor: "140,180,140", glowColor: "140,180,140", bgAlpha: 0.16,
  },
};

const GENERIC_DEFAULT: ChapterConfig = {
  entities: [{ name: "TINTAXIS", role: "the archive", color: "201,168,76" }],
  events: ["THE ARCHIVE REMEMBERS"],
  digitColor: "201,168,76", glowColor: "201,168,76", bgAlpha: 0.16,
};

function getConfig(bookSlug: string, chapterSlug: string): ChapterConfig {
  return BOOK_CONFIGS[bookSlug]?.[chapterSlug]
    ?? BOOK_DEFAULTS[bookSlug]
    ?? GENERIC_DEFAULT;
}

// ─── ASCII ENCODE HELPER ──────────────────────────────────────────────────────
function toAsciiCodes(str: string): string {
  return str.split("").map(c => c === " " ? "032" : String(c.charCodeAt(0)).padStart(3,"0")).join(" ");
}

// ─── ANIMATION TYPES ──────────────────────────────────────────────────────────
interface DigitColumn {
  x: number;
  y: number;
  speed: number;
  digits: number[];
  brightness: number[];
  length: number;
}

type Phase = "name" | "encoding" | "ascii" | "dissolve";

interface EntityNode {
  entity: EntityDef;
  x: number;
  y: number;
  phase: Phase;
  phaseProgress: number;
  phaseDuration: number;
  encodedLetters: (string | null)[];
  opacity: number;
  scale: number;
}

interface EventLabel {
  text: string;
  x: number;
  y: number;
  phase: "appear" | "hold" | "quantize" | "dissolve";
  progress: number;
  duration: number;
  quantizedChars: (string | number)[];
  opacity: number;
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────
interface ChapterRainProps {
  chapterSlug: string;
  bookSlug: string;
  height?: number;
}

export default function ChapterRain({ chapterSlug, bookSlug, height = 340 }: ChapterRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const maybeCtx = canvas.getContext("2d");
    if (!maybeCtx) return;
    // Non-null aliases for closures — both verified non-null above
    const cv = canvas;
    const ctx = maybeCtx;

    const config = getConfig(bookSlug, chapterSlug);
    const { digitColor, glowColor, bgAlpha } = config;

    // Resize canvas
    const resize = () => {
      cv.width = container.clientWidth;
      cv.height = height;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(container);

    // ── DIGIT RAIN COLUMNS ───────────────────────────────────────────────────
    const FONT_SIZE = 11;
    const COL_W = 14;

    function makeColumn(x: number): DigitColumn {
      const len = 8 + Math.floor(Math.random() * 16);
      return {
        x,
        y: Math.random() * cv.height,
        speed: 0.6 + Math.random() * 1.2,
        length: len,
        digits: Array.from({ length: len }, () => Math.floor(Math.random() * 10)),
        brightness: Array.from({ length: len }, (_, i) => (len - i) / len),
      };
    }

    const numCols = Math.floor((cv.width || 800) / COL_W);
    const columns: DigitColumn[] = Array.from({ length: numCols }, (_, i) => makeColumn(i * COL_W + COL_W / 2));

    // ── ENTITY NODE QUEUE ────────────────────────────────────────────────────
    const activeNodes: EntityNode[] = [];
    let entityIndex = 0;
    let nextEntityAt = 60;

    function spawnEntity(frame: number) {
      const entity = config.entities[entityIndex % config.entities.length];
      entityIndex++;
      const margin = 80;
      const node: EntityNode = {
        entity,
        x: margin + Math.random() * (Math.max(cv.width - margin * 2, 200)),
        y: 40 + Math.random() * (cv.height - 80),
        phase: "name",
        phaseProgress: 0,
        phaseDuration: 90,
        encodedLetters: entity.name.split("").map(() => null),
        opacity: 0,
        scale: 1,
      };
      activeNodes.push(node);
      nextEntityAt = frame + 120 + Math.floor(Math.random() * 80);
    }

    // ── EVENT LABELS ─────────────────────────────────────────────────────────
    const activeEvents: EventLabel[] = [];
    let eventIndex = 0;
    let nextEventAt = 180;

    function spawnEvent(frame: number) {
      const text = config.events[eventIndex % config.events.length];
      eventIndex++;
      const label: EventLabel = {
        text,
        x: (cv.width || 400) / 2,
        y: cv.height - 40 - Math.random() * (cv.height / 2),
        phase: "appear",
        progress: 0,
        duration: 50,
        quantizedChars: text.split(""),
        opacity: 0,
      };
      activeEvents.push(label);
      nextEventAt = frame + 200 + Math.floor(Math.random() * 100);
    }

    // ── END OF CHAPTER MESSAGE ───────────────────────────────────────────────
    let endOpacity = 0;
    let endAscii = false;
    let endAsciiProgress = 0;
    const END_TEXT = "— END OF CHAPTER —";
    setTimeout(() => { endOpacity = 0.01; }, 800);

    // ── DRAW ─────────────────────────────────────────────────────────────────
    let frame = 0;
    let raf: number;

    function draw() {
      const W = cv.width;
      const H = cv.height;

      ctx.fillStyle = `rgba(13,11,8,${bgAlpha})`;
      ctx.fillRect(0, 0, W, H);

      // ── Draw digit columns
      ctx.font = `${FONT_SIZE}px "JetBrains Mono", monospace`;
      for (const col of columns) {
        col.y += col.speed;
        if (col.y > H + col.length * FONT_SIZE) {
          col.y = -col.length * FONT_SIZE;
          col.digits = col.digits.map(() => Math.floor(Math.random() * 10));
        }
        if (Math.random() < 0.05) {
          const idx = Math.floor(Math.random() * col.length);
          col.digits[idx] = Math.floor(Math.random() * 10);
        }
        for (let i = 0; i < col.length; i++) {
          const brightness = col.brightness[i];
          const alpha = brightness * 0.35;
          ctx.fillStyle = `rgba(${digitColor},${alpha})`;
          ctx.fillText(String(col.digits[i]), col.x, col.y - i * FONT_SIZE);
        }
        ctx.fillStyle = `rgba(${digitColor},0.7)`;
        ctx.fillText(String(col.digits[0]), col.x, col.y);
      }

      // ── Spawn entities and events
      if (frame === nextEntityAt) spawnEntity(frame);
      if (frame === nextEventAt) spawnEvent(frame);

      // ── Draw entity nodes
      const NODE_FONT = 15;
      const ROLE_FONT = 9;
      ctx.textAlign = "center";

      for (let ni = activeNodes.length - 1; ni >= 0; ni--) {
        const node = activeNodes[ni];
        node.phaseProgress++;
        const pct = node.phaseProgress / node.phaseDuration;

        if (node.phase === "name") {
          node.opacity = Math.min(1, pct * 3);
          if (pct >= 1) {
            node.phase = "encoding";
            node.phaseProgress = 0;
            node.phaseDuration = node.entity.name.replace(/ /g, "").length * 18;
          }
        } else if (node.phase === "encoding") {
          node.opacity = 1;
          const lettersToEncode = Math.floor(pct * node.entity.name.length);
          for (let li = 0; li < lettersToEncode; li++) {
            if (node.encodedLetters[li] === null) {
              const ch = node.entity.name[li];
              node.encodedLetters[li] = ch === " " ? "   " : String(ch.charCodeAt(0)).padStart(3, "0");
            }
          }
          if (pct >= 1) {
            node.phase = "ascii";
            node.phaseProgress = 0;
            node.phaseDuration = 60;
          }
        } else if (node.phase === "ascii") {
          node.opacity = 1;
          if (pct >= 1) {
            node.phase = "dissolve";
            node.phaseProgress = 0;
            node.phaseDuration = 40;
          }
        } else if (node.phase === "dissolve") {
          node.opacity = 1 - pct;
          if (pct >= 1) {
            activeNodes.splice(ni, 1);
            continue;
          }
        }

        ctx.save();
        ctx.globalAlpha = node.opacity;
        const [r, g, b] = node.entity.color.split(",").map(Number);
        ctx.shadowBlur = 12;
        ctx.shadowColor = `rgba(${r},${g},${b},0.5)`;

        if (node.phase === "name") {
          ctx.font = `${NODE_FONT}px "JetBrains Mono", monospace`;
          ctx.fillStyle = `rgba(${r},${g},${b},0.9)`;
          ctx.fillText(node.entity.name, node.x, node.y);
          ctx.shadowBlur = 0;
          ctx.font = `${ROLE_FONT}px "JetBrains Mono", monospace`;
          ctx.fillStyle = `rgba(${r},${g},${b},0.4)`;
          ctx.fillText(node.entity.role.toUpperCase(), node.x, node.y + 14);
        } else {
          const chars: string[] = node.encodedLetters.map((enc, i) =>
            enc !== null ? enc : node.entity.name[i]
          );
          const full = chars.join(" ");
          ctx.font = `${NODE_FONT}px "JetBrains Mono", monospace`;
          const totalWidth = ctx.measureText(full).width;
          let xCursor = node.x - totalWidth / 2;

          for (let ci = 0; ci < node.encodedLetters.length; ci++) {
            const isEncoded = node.encodedLetters[ci] !== null;
            const seg = (node.encodedLetters[ci] ?? node.entity.name[ci]) + " ";
            ctx.fillStyle = isEncoded
              ? `rgba(${digitColor},0.75)`
              : `rgba(${r},${g},${b},0.9)`;
            ctx.textAlign = "left";
            ctx.fillText(seg, xCursor, node.y);
            xCursor += ctx.measureText(seg).width;
          }
          ctx.textAlign = "center";

          if (node.phase !== "dissolve") {
            ctx.shadowBlur = 0;
            ctx.font = `${ROLE_FONT}px "JetBrains Mono", monospace`;
            ctx.fillStyle = `rgba(${r},${g},${b},0.3)`;
            ctx.fillText("→ " + toAsciiCodes(node.entity.name), node.x, node.y + 14);
          }
        }
        ctx.restore();
      }

      // ── Draw event labels
      const EVT_FONT = 10;
      for (let ei = activeEvents.length - 1; ei >= 0; ei--) {
        const evt = activeEvents[ei];
        evt.progress++;
        const pct = evt.progress / evt.duration;

        if (evt.phase === "appear") {
          evt.opacity = Math.min(1, pct * 4);
          if (pct >= 1) { evt.phase = "hold"; evt.progress = 0; evt.duration = 80; }
        } else if (evt.phase === "hold") {
          evt.opacity = 1;
          if (pct >= 1) { evt.phase = "quantize"; evt.progress = 0; evt.duration = evt.text.length * 6; }
        } else if (evt.phase === "quantize") {
          evt.opacity = 1;
          const charsToQuantize = Math.floor(pct * evt.text.length);
          for (let ci = 0; ci < charsToQuantize; ci++) {
            if (typeof evt.quantizedChars[ci] === "string") {
              const ch = evt.text[ci];
              evt.quantizedChars[ci] = ch === " " ? 32 : ch.charCodeAt(0);
            }
          }
          if (pct >= 1) { evt.phase = "dissolve"; evt.progress = 0; evt.duration = 40; }
        } else if (evt.phase === "dissolve") {
          evt.opacity = 1 - pct;
          if (pct >= 1) { activeEvents.splice(ei, 1); continue; }
        }

        ctx.save();
        ctx.globalAlpha = evt.opacity * 0.65;
        ctx.textAlign = "left";
        ctx.font = `${EVT_FONT}px "JetBrains Mono", monospace`;

        const rendered = evt.quantizedChars.map(c =>
          typeof c === "number" ? String(c).padStart(3, "0") : c
        ).join(" ");

        const tw = ctx.measureText(rendered).width;
        let xC = evt.x - tw / 2;

        for (const ch of evt.quantizedChars) {
          const seg = typeof ch === "number"
            ? String(ch).padStart(3, "0") + " "
            : ch + " ";
          ctx.fillStyle = typeof ch === "number"
            ? `rgba(${digitColor},0.6)`
            : `rgba(245,230,200,0.5)`;
          ctx.fillText(seg, xC, evt.y);
          xC += ctx.measureText(seg).width;
        }
        ctx.restore();
      }

      // ── End of chapter text
      if (endOpacity > 0) {
        endOpacity = Math.min(1, endOpacity + 0.008);
        if (endOpacity > 0.4 && !endAscii) endAscii = true;
        if (endAscii && endAsciiProgress < END_TEXT.length) endAsciiProgress += 0.3;

        ctx.save();
        ctx.textAlign = "center";
        ctx.globalAlpha = endOpacity;

        if (!endAscii) {
          ctx.font = `13px "JetBrains Mono", monospace`;
          ctx.fillStyle = `rgba(${glowColor},0.9)`;
          ctx.shadowBlur = 16;
          ctx.shadowColor = `rgba(${glowColor},0.6)`;
          ctx.fillText(END_TEXT, W / 2, H / 2);
        } else {
          const progress = Math.floor(endAsciiProgress);
          const segments = END_TEXT.split("").map((ch, i) => ({
            ch,
            encoded: i < progress,
          }));

          ctx.font = `12px "JetBrains Mono", monospace`;
          ctx.shadowBlur = 12;
          ctx.shadowColor = `rgba(${glowColor},0.5)`;

          const fullEncoded = segments.map(s =>
            s.encoded
              ? (s.ch === " " || s.ch === "—" ? s.ch : String(s.ch.charCodeAt(0)).padStart(3,"0"))
              : s.ch
          ).join(" ");
          const tw = ctx.measureText(fullEncoded).width;
          let xC = W / 2 - tw / 2;

          ctx.textAlign = "left";
          for (const seg of segments) {
            const txt = seg.encoded && seg.ch !== " " && seg.ch !== "—"
              ? String(seg.ch.charCodeAt(0)).padStart(3, "0") + " "
              : seg.ch + " ";
            ctx.fillStyle = seg.encoded
              ? `rgba(${digitColor},0.8)`
              : `rgba(245,230,200,0.9)`;
            ctx.fillText(txt, xC, H / 2);
            xC += ctx.measureText(txt).width;
          }
        }
        ctx.restore();
      }

      frame++;
      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [chapterSlug, bookSlug, height]);

  return (
    <div ref={containerRef} style={{ width: "100%", position: "relative", margin: "4rem 0 2rem" }}>
      <div
        style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "60px",
          background: "linear-gradient(to bottom, #0D0B08, transparent)",
          pointerEvents: "none", zIndex: 2,
        }}
      />
      <canvas ref={canvasRef} height={height} style={{ display: "block", width: "100%" }} />
      <div
        style={{
          position: "absolute", bottom: 0, left: 0, right: 0, height: "60px",
          background: "linear-gradient(to top, #0D0B08, transparent)",
          pointerEvents: "none", zIndex: 2,
        }}
      />
    </div>
  );
}
