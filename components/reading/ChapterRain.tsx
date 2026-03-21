"use client";

import { useEffect, useRef } from "react";

// ─── PER-CHAPTER NARRATIVE DATA ───────────────────────────────────────────────
// Each chapter defines the entities (characters/objects) that get quantized,
// and event fragments (key moments) that materialize then dissolve into digits.

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

const CHAPTER_CONFIGS: Record<string, ChapterConfig> = {
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
      "SHE SAID SUICIDE",
      "THE BLOOD",
      "GERTRUDE IS DEAD",
      "JOHN HELD HER",
      "MICHELLE WATCHED",
      "THE GUN BY THE BED",
      "NOBODY SAW IT",
      "FLINT CAME FROM NEW YORK",
      "THE STORY ISN'T OVER",
    ],
    digitColor: "201,168,76",
    glowColor: "201,168,76",
    bgAlpha: 0.18,
  },
  two: {
    entities: [
      { name: "DR CHILD", role: "the composed",    color: "160,200,180" },
      { name: "DR HARRIS",role: "the alcoholic",   color: "180,160,140" },
      { name: "MRS DWIGHT",role: "the patient",    color: "200,170,170" },
      { name: "ROBBIN",   role: "the gossip",      color: "201,168,76"  },
      { name: "BRYANT",   role: "the sheriff",     color: "180,160,120" },
    ],
    events: [
      "CORRIDOR B",
      "THE CASE FILES",
      "HER DIAGNOSIS",
      "HARRIS DRINKS AGAIN",
      "THE CLINIC KNOWS",
    ],
    digitColor: "140,180,160",
    glowColor: "140,180,160",
    bgAlpha: 0.16,
  },
  three: {
    entities: [
      { name: "ALMA",    role: "at her desk",      color: "180,210,180" },
      { name: "ROBBIN",  role: "still talking",    color: "201,168,76"  },
    ],
    events: [
      "REGULAR HOURS",
      "THE WATCH ON HER WRIST",
      "THE DINER EMPTIES",
      "ALMA LISTENS",
    ],
    digitColor: "170,200,170",
    glowColor: "170,200,170",
    bgAlpha: 0.15,
  },
  four: {
    entities: [
      { name: "JOHN",      role: "the father",     color: "160,180,200" },
      { name: "GERTRUDE",  role: "the remembered", color: "220,200,160" },
      { name: "MICHAEL",   role: "her brother",    color: "180,170,150" },
      { name: "MICHELLE",  role: "the daughter",   color: "200,140,140" },
    ],
    events: [
      "THE FAMILY CABIN",
      "MICHAEL SANDERS 1942-1972",
      "THE SMELL OF SYRUP",
      "BURIED IN THE PINES",
      "WHAT THE FATHER KNEW",
    ],
    digitColor: "180,155,110",
    glowColor: "180,155,110",
    bgAlpha: 0.17,
  },
  five: {
    entities: [
      { name: "MICHELLE", role: "the hunter",      color: "200,100,100" },
      { name: "GERTRUDE", role: "the hunted",      color: "220,200,160" },
      { name: "JOHN",     role: "the complicit",   color: "160,180,200" },
    ],
    events: [
      "TODAY I GET TO KILL",
      "WHAT BLOOD REQUIRES",
      "THE LETTERS",
      "SHE ALWAYS KNEW",
      "THE HUNT BEGINS",
    ],
    digitColor: "180,80,80",
    glowColor: "200,100,100",
    bgAlpha: 0.2,
  },
  six: {
    entities: [
      { name: "MRS DWIGHT",role: "the worst",      color: "200,170,200" },
      { name: "BRYANT",    role: "the lawman",     color: "180,160,120" },
      { name: "THE TOWN",  role: "the audience",   color: "160,160,160" },
    ],
    events: [
      "THE STORIES PEOPLE TELL",
      "WHAT LITTLE PINES REMEMBERS",
      "EVERYONE HAD A THEORY",
      "THE PINES KEEP QUIET",
    ],
    digitColor: "160,140,180",
    glowColor: "160,140,180",
    bgAlpha: 0.16,
  },
  seven: {
    entities: [
      { name: "MICHELLE", role: "once again",      color: "160,20,20"   },
      { name: "JOHN",     role: "the kneeling",    color: "120,140,160" },
      { name: "GERTRUDE", role: "in the ground",   color: "180,160,130" },
      { name: "THE LAKE", role: "the witness",     color: "100,120,140" },
      { name: "THE GUN",  role: "the instrument",  color: "140,120,100" },
    ],
    events: [
      "MOTHER I HAVE KILLED YOU",
      "HE ALREADY KNEW",
      "KNEEL AT THE LAKE",
      "ONCE AGAIN",
      "SHE PULLED THE TRIGGER",
    ],
    digitColor: "120,20,20",
    glowColor: "160,20,20",
    bgAlpha: 0.22,
  },
};

// Fallback config for chapters without specific data
const DEFAULT_CONFIG: ChapterConfig = {
  entities: [{ name: "THE HUNT", role: "a novella", color: "201,168,76" }],
  events: ["THE STORY CONTINUES"],
  digitColor: "201,168,76",
  glowColor: "201,168,76",
  bgAlpha: 0.16,
};

// ─── ASCII ENCODE HELPER ──────────────────────────────────────────────────────
function toAsciiCodes(str: string): string {
  return str.split("").map(c => c === " " ? "032" : String(c.charCodeAt(0)).padStart(3,"0")).join(" ");
}

// ─── ANIMATION TYPES ──────────────────────────────────────────────────────────
interface DigitColumn {
  x: number;
  y: number;
  speed: number;
  digits: number[];    // current digit values
  brightness: number[];
  length: number;
}

type Phase = "name" | "encoding" | "ascii" | "dissolve";

interface EntityNode {
  entity: EntityDef;
  x: number;
  y: number;
  phase: Phase;
  phaseProgress: number; // 0-1
  phaseDuration: number; // frames for this phase
  encodedLetters: (string | null)[]; // null = still a letter, string = became number
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

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
interface ChapterRainProps {
  chapterSlug: string;
  height?: number;
}

export default function ChapterRain({ chapterSlug, height = 340 }: ChapterRainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    // After this point, canvas and ctx are guaranteed to be non-null

    const config = CHAPTER_CONFIGS[chapterSlug] ?? DEFAULT_CONFIG;
    const { digitColor, glowColor, bgAlpha } = config;

    // Resize canvas
    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = height;
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
        y: Math.random() * canvas!.height,
        speed: 0.6 + Math.random() * 1.2,
        length: len,
        digits: Array.from({ length: len }, () => Math.floor(Math.random() * 10)),
        brightness: Array.from({ length: len }, (_, i) => (len - i) / len),
      };
    }

    const numCols = Math.floor((canvas.width || 800) / COL_W);
    const columns: DigitColumn[] = Array.from({ length: numCols }, (_, i) => makeColumn(i * COL_W + COL_W / 2));

    // ── ENTITY NODE QUEUE ────────────────────────────────────────────────────
    const activeNodes: EntityNode[] = [];
    let entityIndex = 0;
    let nextEntityAt = 60; // frame counter

    function spawnEntity(frame: number) {
      const entity = config.entities[entityIndex % config.entities.length];
      entityIndex++;
      const margin = 80;
      const node: EntityNode = {
        entity,
        x: margin + Math.random() * (Math.max(canvas!.width - margin * 2, 200)),
        y: 40 + Math.random() * (canvas!.height - 80),
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
        x: (canvas!.width || 400) / 2,
        y: canvas!.height - 40 - Math.random() * (canvas!.height / 2),
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
    const endCodes = END_TEXT.split("").map(c =>
      c === " " || c === "—" ? c : String(c.charCodeAt(0)).padStart(3, "0")
    );
    setTimeout(() => { endOpacity = 0.01; }, 800);

    // ── DRAW ─────────────────────────────────────────────────────────────────
    let frame = 0;
    let raf: number;

    function draw() {
      const W = canvas!.width;
      const H = canvas!.height;

      // Background fade (creates trail effect)
      ctx!.fillStyle = `rgba(13,11,8,${bgAlpha})`;
      ctx!.fillRect(0, 0, W, H);

      // ── Draw digit columns ─────────────────────────────────────────────
      ctx!.font = `${FONT_SIZE}px "JetBrains Mono", monospace`;
      for (const col of columns) {
        col.y += col.speed;
        if (col.y > H + col.length * FONT_SIZE) {
          col.y = -col.length * FONT_SIZE;
          col.digits = col.digits.map(() => Math.floor(Math.random() * 10));
        }
        // Randomly flip a digit
        if (Math.random() < 0.05) {
          const idx = Math.floor(Math.random() * col.length);
          col.digits[idx] = Math.floor(Math.random() * 10);
        }

        for (let i = 0; i < col.length; i++) {
          const brightness = col.brightness[i];
          const alpha = brightness * 0.35;
          ctx!.fillStyle = `rgba(${digitColor},${alpha})`;
          ctx!.fillText(String(col.digits[i]), col.x, col.y - i * FONT_SIZE);
        }
        // Bright head digit
        ctx!.fillStyle = `rgba(${digitColor},0.7)`;
        ctx!.fillText(String(col.digits[0]), col.x, col.y);
      }

      // ── Spawn entities and events ──────────────────────────────────────
      if (frame === nextEntityAt) spawnEntity(frame);
      if (frame === nextEventAt) spawnEvent(frame);

      // ── Draw entity nodes ──────────────────────────────────────────────
      const NODE_FONT = 15;
      const ROLE_FONT = 9;
      ctx!.textAlign = "center";

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
          // Replace letters one by one with their ASCII codes
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

        // Draw node
        ctx!.save();
        ctx!.globalAlpha = node.opacity;

        const [r, g, b] = node.entity.color.split(",").map(Number);

        // Glow backdrop
        ctx!.shadowBlur = 12;
        ctx!.shadowColor = `rgba(${r},${g},${b},0.5)`;

        if (node.phase === "name") {
          // Plain character name
          ctx!.font = `${NODE_FONT}px "JetBrains Mono", monospace`;
          ctx!.fillStyle = `rgba(${r},${g},${b},0.9)`;
          ctx!.fillText(node.entity.name, node.x, node.y);

          ctx!.shadowBlur = 0;
          ctx!.font = `${ROLE_FONT}px "JetBrains Mono", monospace`;
          ctx!.fillStyle = `rgba(${r},${g},${b},0.4)`;
          ctx!.fillText(node.entity.role.toUpperCase(), node.x, node.y + 14);
        } else {
          // Show letters being replaced with numbers
          const chars: string[] = node.encodedLetters.map((enc, i) =>
            enc !== null ? enc : node.entity.name[i]
          );
          const full = chars.join(" ");
          ctx!.font = `${NODE_FONT}px "JetBrains Mono", monospace`;

          // Draw each character segment individually with color shift
          const totalWidth = ctx!.measureText(full).width;
          let xCursor = node.x - totalWidth / 2;

          for (let ci = 0; ci < node.encodedLetters.length; ci++) {
            const isEncoded = node.encodedLetters[ci] !== null;
            const seg = (node.encodedLetters[ci] ?? node.entity.name[ci]) + " ";
            ctx!.fillStyle = isEncoded
              ? `rgba(${digitColor},0.75)`       // encoded = amber digits
              : `rgba(${r},${g},${b},0.9)`;      // original = character color
            ctx!.textAlign = "left";
            ctx!.fillText(seg, xCursor, node.y);
            xCursor += ctx!.measureText(seg).width;
          }
          ctx!.textAlign = "center";

          if (node.phase !== "dissolve") {
            ctx!.shadowBlur = 0;
            ctx!.font = `${ROLE_FONT}px "JetBrains Mono", monospace`;
            ctx!.fillStyle = `rgba(${r},${g},${b},0.3)`;
            ctx!.fillText("→ " + toAsciiCodes(node.entity.name), node.x, node.y + 14);
          }
        }

        ctx!.restore();
      }

      // ── Draw event labels ──────────────────────────────────────────────
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
          if (pct >= 1) {
            evt.phase = "quantize";
            evt.progress = 0;
            evt.duration = evt.text.length * 6;
          }
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

        ctx!.save();
        ctx!.globalAlpha = evt.opacity * 0.65;
        ctx!.textAlign = "left";
        ctx!.font = `${EVT_FONT}px "JetBrains Mono", monospace`;

        const rendered = evt.quantizedChars.map(c =>
          typeof c === "number"
            ? String(c).padStart(3, "0")
            : c
        ).join(" ");

        const tw = ctx!.measureText(rendered).width;
        let xC = evt.x - tw / 2;

        for (const ch of evt.quantizedChars) {
          const seg = typeof ch === "number"
            ? String(ch).padStart(3, "0") + " "
            : ch + " ";
          ctx!.fillStyle = typeof ch === "number"
            ? `rgba(${digitColor},0.6)`
            : `rgba(245,230,200,0.5)`;
          ctx!.fillText(seg, xC, evt.y);
          xC += ctx!.measureText(seg).width;
        }

        ctx!.restore();
      }

      // ── End of chapter text ────────────────────────────────────────────
      if (endOpacity > 0) {
        endOpacity = Math.min(1, endOpacity + 0.008);
        if (endOpacity > 0.4 && !endAscii) {
          endAscii = true;
        }
        if (endAscii && endAsciiProgress < END_TEXT.length) {
          endAsciiProgress += 0.3;
        }

        ctx!.save();
        ctx!.textAlign = "center";
        ctx!.globalAlpha = endOpacity;

        if (!endAscii) {
          ctx!.font = `13px "JetBrains Mono", monospace`;
          ctx!.fillStyle = `rgba(${glowColor},0.9)`;
          ctx!.shadowBlur = 16;
          ctx!.shadowColor = `rgba(${glowColor},0.6)`;
          ctx!.fillText(END_TEXT, W / 2, H / 2);
        } else {
          // Transition: characters → ASCII codes
          const progress = Math.floor(endAsciiProgress);
          const segments = END_TEXT.split("").map((ch, i) => ({
            ch,
            encoded: i < progress,
          }));

          ctx!.font = `12px "JetBrains Mono", monospace`;
          ctx!.shadowBlur = 12;
          ctx!.shadowColor = `rgba(${glowColor},0.5)`;

          const fullEncoded = segments.map(s =>
            s.encoded
              ? (s.ch === " " || s.ch === "—" ? s.ch : String(s.ch.charCodeAt(0)).padStart(3,"0"))
              : s.ch
          ).join(" ");
          const tw = ctx!.measureText(fullEncoded).width;
          let xC = W / 2 - tw / 2;

          ctx!.textAlign = "left";
          for (const seg of segments) {
            const txt = seg.encoded && seg.ch !== " " && seg.ch !== "—"
              ? String(seg.ch.charCodeAt(0)).padStart(3, "0") + " "
              : seg.ch + " ";
            ctx!.fillStyle = seg.encoded
              ? `rgba(${digitColor},0.8)`
              : `rgba(245,230,200,0.9)`;
            ctx!.fillText(txt, xC, H / 2);
            xC += ctx!.measureText(txt).width;
          }
        }
        ctx!.restore();
      }

      frame++;
      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [chapterSlug, height]);

  return (
    <div ref={containerRef} style={{ width: "100%", position: "relative", margin: "4rem 0 2rem" }}>
      {/* Top fade */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "60px",
          background: "linear-gradient(to bottom, #0D0B08, transparent)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
      <canvas
        ref={canvasRef}
        height={height}
        style={{ display: "block", width: "100%" }}
      />
      {/* Bottom fade */}
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "60px",
          background: "linear-gradient(to top, #0D0B08, transparent)",
          pointerEvents: "none",
          zIndex: 2,
        }}
      />
    </div>
  );
}
