// ─── PER-BOOK OG IMAGE ───────────────────────────────────────────────────────
// Dynamic OG image for each book landing page.
// Uses the book's accent color for the glow and borders.
// Shown when /book/the-hunt, /book/recoleta, etc. are shared on social.

import { ImageResponse } from "next/og";
import { getBook, getAllBookSlugs } from "@/lib/content/books";

export const runtime = "edge";
export const alt = "Tintaxis Book";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props {
  params: { bookSlug: string };
}

export function generateStaticParams() {
  return getAllBookSlugs().map((slug) => ({ bookSlug: slug }));
}

function hexToRgb(hex: string): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : "201, 168, 76";
}

export default function Image({ params }: Props) {
  const book = getBook(params.bookSlug);

  const title = book?.title ?? "Tintaxis";
  const subtitle = book?.subtitle ?? "";
  const author = book?.author ?? "Chico Montecristi";
  const tagline = book?.tagline ?? "";
  const accent = book?.accentColor ?? "#C9A84C";
  const coverLabel = book?.coverLabel ?? "";
  const genre = book?.genre ?? "";
  const year = book?.year ?? 2024;
  const rgb = hexToRgb(accent);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0D0B08",
          position: "relative",
          fontFamily: "serif",
        }}
      >
        {/* Borders */}
        <div style={{ position: "absolute", inset: "32px", border: `1px solid rgba(${rgb}, 0.3)`, display: "flex" }} />
        <div style={{ position: "absolute", inset: "42px", border: `1px solid rgba(${rgb}, 0.1)`, display: "flex" }} />

        {/* Corners */}
        <div style={{ position: "absolute", top: "50px", left: "50px", width: "20px", height: "20px", borderTop: `2px solid rgba(${rgb}, 0.55)`, borderLeft: `2px solid rgba(${rgb}, 0.55)`, display: "flex" }} />
        <div style={{ position: "absolute", top: "50px", right: "50px", width: "20px", height: "20px", borderTop: `2px solid rgba(${rgb}, 0.55)`, borderRight: `2px solid rgba(${rgb}, 0.55)`, display: "flex" }} />
        <div style={{ position: "absolute", bottom: "50px", left: "50px", width: "20px", height: "20px", borderBottom: `2px solid rgba(${rgb}, 0.55)`, borderLeft: `2px solid rgba(${rgb}, 0.55)`, display: "flex" }} />
        <div style={{ position: "absolute", bottom: "50px", right: "50px", width: "20px", height: "20px", borderBottom: `2px solid rgba(${rgb}, 0.55)`, borderRight: `2px solid rgba(${rgb}, 0.55)`, display: "flex" }} />

        {/* Accent glow */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: `radial-gradient(ellipse at 50% 40%, rgba(${rgb}, 0.12) 0%, transparent 60%)`,
            display: "flex",
          }}
        />

        {/* Content */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            position: "relative",
            zIndex: 1,
            padding: "0 100px",
          }}
        >
          {/* Top bar: TINTAXIS · language badge */}
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "12px",
              letterSpacing: "0.3em",
              color: "rgba(201,168,76,0.45)",
              textTransform: "uppercase",
              marginBottom: "40px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <span>TINTAXIS</span>
            <span style={{ color: "rgba(201,168,76,0.2)" }}>·</span>
            <span style={{ color: `rgba(${rgb}, 0.65)` }}>{coverLabel}</span>
            <span style={{ color: "rgba(201,168,76,0.2)" }}>·</span>
            <span>{year}</span>
          </div>

          {/* Book title */}
          <div
            style={{
              fontSize: title.length > 20 ? "48px" : "62px",
              fontWeight: 400,
              fontStyle: "italic",
              letterSpacing: "0.04em",
              color: "#F5E6C8",
              lineHeight: 1.15,
              marginBottom: "14px",
              display: "flex",
              maxWidth: "900px",
              textAlign: "center",
              textShadow: `0 0 60px rgba(${rgb}, 0.3)`,
            }}
          >
            {title}
          </div>

          {/* Subtitle */}
          {subtitle && (
            <div
              style={{
                fontSize: "24px",
                fontStyle: "italic",
                color: "rgba(245,230,200,0.45)",
                marginBottom: "18px",
                display: "flex",
              }}
            >
              {subtitle}
            </div>
          )}

          {/* Accent rule */}
          <div
            style={{
              width: "240px",
              height: "2px",
              background: `linear-gradient(90deg, transparent, rgba(${rgb}, 0.8) 50%, transparent)`,
              marginBottom: "22px",
              display: "flex",
            }}
          />

          {/* Author */}
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "14px",
              letterSpacing: "0.25em",
              color: `rgba(${rgb}, 0.6)`,
              textTransform: "uppercase",
              marginBottom: "16px",
              display: "flex",
            }}
          >
            {author}
          </div>

          {/* Tagline */}
          {tagline && tagline !== title && (
            <div
              style={{
                fontSize: "20px",
                fontStyle: "italic",
                color: "rgba(245,230,200,0.35)",
                maxWidth: "700px",
                textAlign: "center",
                lineHeight: 1.4,
                display: "flex",
              }}
            >
              "{tagline}"
            </div>
          )}
        </div>

        {/* Bottom: read free */}
        <div
          style={{
            position: "absolute",
            bottom: "60px",
            fontFamily: "monospace",
            fontSize: "11px",
            letterSpacing: "0.25em",
            color: `rgba(${rgb}, 0.4)`,
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span>READ FREE AT TINTAXIS.VERCEL.APP</span>
        </div>
      </div>
    ),
    { ...size }
  );
}
