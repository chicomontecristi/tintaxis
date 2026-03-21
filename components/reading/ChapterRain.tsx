"use client";

// ─── CHAPTER RAIN ─────────────────────────────────────────────────────────────
// Matrix-style digital rain rendered on canvas.
// Each chapter has its own color palette and vocabulary —
// the rain literally uses the chapter's own characters and keywords.
// Key words from the chapter surface briefly in the streams.
// Activates when the reader reaches the end of the chapter.

import { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

// ── Per-chapter rain configuration ───────────────────────────────────────────

export interface RainConfig {
  primaryColor: string;   // Bright leading char (hex)
  trailColor:   string;   // Mid-stream char color
  glowColor:    string;   // Canvas shadow glow
  bgColor:      string;   // Semi-transparent fill for trail fade
  speed:        number;   // Base fall speed (px per frame)
  density:      number;   // Number of streams per 100px width
  keywords:     string[]; // Words that materialize in the rain
  vocab:        string;   // Characters used in individual streams
}

export const RAIN_CONFIGS: Record<string, RainConfig> = {
  one: {
    primaryColor: "#E8C97A",
    trailColor:   "#C9A84C",
    glowColor:    "rgba(201,168,76,0.8)",
    bgColor:      "rgba(13,11,8,0.22)",
    speed:        1.4,
    density:      0.45,
    keywords:     ["ROBBIN","ALMA","GERTRUDE","SUICIDE","COFFEE","SHERIFF","LITTLE PINES","SHE SAID"],
    vocab:        "JOHNALMABRYANTMICHELLESHERIFFROBBINGERTRUDEabcdefghijklmnopqrstuvwxyz01",
  },
  two: {
    primaryColor: "#00E5CC",
    trailColor:   "#007A6E",
    glowColor:    "rgba(0,229,204,0.6)",
    bgColor:      "rgba(8,18,17,0.2)",
    speed:        1.6,
    density:      0.5,
    keywords:     ["DR. CHILD","CORRIDOR B","HARRIS","ROBBIN","GERTRUDE","MOTHS","PATIENTS"],
    vocab:        "CHILDROBBINGERTRUDEHARRISLINDAabcdefghijklmnopqrstuvwxyz019",
  },
  three: {
    primaryColor: "#B0C0C0",
    trailColor:   "#607070",
    glowColor:    "rgba(160,192,192,0.5)",
    bgColor:      "rgba(8,12,12,0.22)",
    speed:        1.0,
    density:      0.35,
    keywords:     ["ALMA MAE","HARRIS","GERTRUDE","TRUDY","REGULAR","SILENCE","CALLING"],
    vocab:        "HARRISGERTRUDETRUDYDWIGHTCHILDabcdefghijklmnopqrstuvwxyz",
  },
  four: {
    primaryColor: "#D4956A",
    trailColor:   "#8B5E3A",
    glowColor:    "rgba(212,149,106,0.7)",
    bgColor:      "rgba(13,8,5,0.22)",
    speed:        1.3,
    density:      0.45,
    keywords:     ["MICHELLE","JOHN","GERTRUDE","RIFLE","DEER","TRIGGER","FAMILY","THE CABIN"],
    vocab:        "MICHELLEJOHNRICHARDPAULAGERTRUDEabcdefghijklmnopqrstuvwxyz0",
  },
  five: {
    primaryColor: "#C0392B",
    trailColor:   "#7A1F16",
    glowColor:    "rgba(192,57,43,0.75)",
    bgColor:      "rgba(13,5,5,0.22)",
    speed:        1.7,
    density:      0.55,
    keywords:     ["MICHELLE","BLOOD","HUNTING","DESIRE","KILL","TODAY I GET TO KILL","JOHN"],
    vocab:        "MICHELLEJOHNBLOODHUNTINGKILLabcdefghijklmnopqrstuvwxyz1",
  },
  six: {
    primaryColor: "#B87333",
    trailColor:   "#6B3E18",
    glowColor:    "rgba(184,115,51,0.6)",
    bgColor:      "rgba(10,7,4,0.22)",
    speed:        1.2,
    density:      0.45,
    keywords:     ["SHERIFF","LITTLE PINES","STORIES","THE TOWN","DOROTHY","DEPRESSION","TIMMY"],
    vocab:        "SHERIFFDWIGHTTIMMYDOROTHYBARBBRYANTabcdefghijklmnopqrstuvwxyz",
  },
  seven: {
    primaryColor: "#8B0000",
    trailColor:   "#3D0000",
    glowColor:    "rgba(139,0,0,0.9)",
    bgColor:      "rgba(8,4,4,0.25)",
    speed:        0.85,
    density:      0.3,
    keywords:     ["ONCE AGAIN","MICHELLE","FATHER","MOTHER","LAKE","THE TRIGGER","JOHN","TOGETHER AT LAST"],
    vocab:        "JOHNMICKEYMICHELLEFATHERLAKEMOTHERGERTRUDEHEADabcdefghijklmnopqr",
  },
};

const DEFAULT_CONFIG: RainConfig = RAIN_CONFIGS.one;

// ── Stream state ──────────────────────────────────────────────────────────────

interface Stream {
  x:        number;
  y:        number;
  speed:    number;
  length:   number;
  chars:    string[];
  opacity:  number;
  keyword:  string | null;  // If set, display this word character by character
  kwIdx:    number;         // Current character position in keyword
}

// ── Component ─────────────────────────────────────────────────────────────────

interface ChapterRainProps {
  chapterSlug: string;
  height?: number;
}

export default function ChapterRain({ chapterSlug, height = 320 }: ChapterRainProps) {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rafRef     = useRef<number>(0);
  const streamsRef = useRef<Stream[]>([]);
  const [visible, setVisible]   = useState(false);
  const [revealed, setRevealed] = useState(false);

  const cfg = RAIN_CONFIGS[chapterSlug] ?? DEFAULT_CONFIG;

  // ── Intersection Observer — only animate when in viewport ────────────────
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          setRevealed(true);
        } else {
          setVisible(false);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // ── Initialize streams ───────────────────────────────────────────────────
  const initStreams = useCallback((width: number) => {
    const count = Math.floor((width / 100) * cfg.density * 14);
    const FONT_SIZE = 14;
    const streams: Stream[] = [];

    for (let i = 0; i < count; i++) {
      const len = 8 + Math.floor(Math.random() * 20);
      streams.push({
        x:       Math.floor(Math.random() * (width / FONT_SIZE)) * FONT_SIZE,
        y:       -Math.random() * 400,
        speed:   cfg.speed * (0.5 + Math.random() * 1.0),
        length:  len,
        chars:   Array.from({ length: len }, () =>
                   cfg.vocab[Math.floor(Math.random() * cfg.vocab.length)]),
        opacity: 0.4 + Math.random() * 0.6,
        keyword: Math.random() < 0.08
                   ? cfg.keywords[Math.floor(Math.random() * cfg.keywords.length)]
                   : null,
        kwIdx: 0,
      });
    }

    streamsRef.current = streams;
  }, [cfg]);

  // ── Resize handler ───────────────────────────────────────────────────────
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const dpr    = window.devicePixelRatio || 1;
      const w      = canvas.offsetWidth;
      const h      = height;
      canvas.width  = w * dpr;
      canvas.height = h * dpr;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
      initStreams(w);
    };

    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [height, initStreams]);

  // ── Animation loop ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!visible) {
      cancelAnimationFrame(rafRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const FONT_SIZE = 14;
    const dpr       = window.devicePixelRatio || 1;
    const W         = canvas.width  / dpr;
    const H         = canvas.height / dpr;

    const draw = () => {
      // Trail fade
      ctx.fillStyle = cfg.bgColor;
      ctx.fillRect(0, 0, W, H);

      ctx.font = `${FONT_SIZE}px "JetBrains Mono", monospace`;

      for (const stream of streamsRef.current) {
        const chars = stream.chars;
        const len   = chars.length;

        for (let j = 0; j < len; j++) {
          const charY = stream.y - j * FONT_SIZE;
          if (charY < -FONT_SIZE || charY > H + FONT_SIZE) continue;

          const progress = j / len;
          const alpha    = stream.opacity * (1 - progress * 0.9);

          if (j === 0) {
            // Leading char — bright + glow
            ctx.shadowColor = cfg.glowColor;
            ctx.shadowBlur  = 10;
            ctx.fillStyle   = cfg.primaryColor;
          } else {
            ctx.shadowBlur = 0;
            const fade   = Math.max(0, alpha);
            ctx.fillStyle = hexWithAlpha(cfg.trailColor, fade);
          }

          // If this stream has a keyword, overlay it at top
          let char = chars[j];
          if (stream.keyword && j < stream.keyword.length) {
            char = stream.keyword[j];
            if (j < 3) {
              ctx.shadowColor = cfg.glowColor;
              ctx.shadowBlur  = 16;
              ctx.fillStyle   = cfg.primaryColor;
            }
          }

          ctx.fillText(char, stream.x, charY);
        }

        // Advance stream
        stream.y += stream.speed;

        // Rotate chars randomly
        if (Math.random() < 0.05) {
          const randIdx        = Math.floor(Math.random() * stream.chars.length);
          stream.chars[randIdx] = cfg.vocab[Math.floor(Math.random() * cfg.vocab.length)];
        }

        // Reset when stream exits bottom
        if (stream.y - len * FONT_SIZE > H) {
          stream.y      = -FONT_SIZE * (2 + Math.random() * 8);
          stream.x      = Math.floor(Math.random() * (W / FONT_SIZE)) * FONT_SIZE;
          stream.speed  = cfg.speed * (0.5 + Math.random() * 1.0);
          stream.length = 8 + Math.floor(Math.random() * 20);
          stream.chars  = Array.from({ length: stream.length }, () =>
                            cfg.vocab[Math.floor(Math.random() * cfg.vocab.length)]);
          // Occasionally assign a new keyword
          stream.keyword = Math.random() < 0.1
                             ? cfg.keywords[Math.floor(Math.random() * cfg.keywords.length)]
                             : null;
        }
      }

      ctx.shadowBlur = 0;
      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(rafRef.current);
  }, [visible, cfg]);

  return (
    <motion.div
      style={{
        width: "100%",
        position: "relative",
        overflow: "hidden",
        marginTop: "4rem",
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: revealed ? 1 : 0 }}
      transition={{ duration: 1.2, ease: "easeIn" }}
    >
      {/* Top gradient fade */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "60px",
          background: "linear-gradient(to bottom, #0D0B08, transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        style={{
          display: "block",
          width: "100%",
          height: `${height}px`,
          backgroundColor: "#0D0B08",
        }}
      />

      {/* Bottom gradient fade */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "80px",
          background: "linear-gradient(to top, #0D0B08, transparent)",
          zIndex: 2,
          pointerEvents: "none",
        }}
      />

      {/* Chapter seal label — centered overlay */}
      <motion.div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 3,
          textAlign: "center",
          pointerEvents: "none",
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: revealed ? 1 : 0 }}
        transition={{ duration: 1.5, delay: 0.8 }}
      >
        <p
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "0.5rem",
            letterSpacing: "0.4em",
            color: hexWithAlpha(cfg.primaryColor, 0.35),
            textTransform: "uppercase",
            userSelect: "none",
          }}
        >
          — END OF CHAPTER —
        </p>
      </motion.div>
    </motion.div>
  );
}

// ── Utility ───────────────────────────────────────────────────────────────────

function hexWithAlpha(hex: string, alpha: number): string {
  // Convert #RRGGBB to rgba(r,g,b,alpha)
  if (hex.startsWith("rgba")) return hex.replace(/[\d.]+\)$/, `${alpha.toFixed(2)})`);
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha.toFixed(2)})`;
}
