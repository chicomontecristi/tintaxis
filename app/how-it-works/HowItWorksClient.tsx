"use client";

import { useI18n } from "@/lib/i18n";

export default function HowItWorksClient() {
  const { t } = useI18n();
  return (
    <div
      style={{
        backgroundColor: "#0D0B08",
        color: "#F5E6C8",
        minHeight: "100vh",
        padding: "3rem 2rem",
        fontFamily: '"EB Garamond", Garamond, Georgia, serif',
      }}
    >
      <div
        style={{
          maxWidth: "800px",
          margin: "0 auto",
        }}
      >
        {/* Page Title */}
        <h1
          style={{
            fontFamily: '"JetBrains Mono", monospace',
            fontSize: "2.5rem",
            fontWeight: "700",
            color: "#C9A84C",
            marginBottom: "0.5rem",
            letterSpacing: "0.05em",
          }}
        >
          {t("hiw.title")}
        </h1>
        <p
          style={{
            fontSize: "1.125rem",
            marginBottom: "3rem",
            opacity: 0.9,
          }}
        >
          {t("hiw.subtitle")}
        </p>

        {/* FOR READERS SECTION */}
        <section style={{ marginBottom: "3rem" }}>
          <h2
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#C9A84C",
              borderBottom: "1px solid #C9A84C",
              paddingBottom: "0.75rem",
              marginBottom: "2rem",
              letterSpacing: "0.05em",
            }}
          >
            {t("hiw.forReaders")}
          </h2>

          {/* Browse the Library */}
          <article
            style={{
              marginBottom: "2rem",
              paddingBottom: "2rem",
              borderBottom: "1px solid rgba(201, 168, 76, 0.3)",
            }}
          >
            <h3
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "#C9A84C",
                marginBottom: "0.75rem",
                letterSpacing: "0.03em",
              }}
            >
              {t("hiw.r1.title")}
            </h3>
            <p style={{ fontSize: "1rem", lineHeight: "1.6" }}>
              {t("hiw.r1.desc")}
            </p>
          </article>

          {/* Start Reading */}
          <article
            style={{
              marginBottom: "2rem",
              paddingBottom: "2rem",
              borderBottom: "1px solid rgba(201, 168, 76, 0.3)",
            }}
          >
            <h3
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "#C9A84C",
                marginBottom: "0.75rem",
                letterSpacing: "0.03em",
              }}
            >
              {t("hiw.r2.title")}
            </h3>
            <p style={{ fontSize: "1rem", lineHeight: "1.6" }}>
              {t("hiw.r2.desc")}
            </p>
          </article>

          {/* Subscribe to Continue */}
          <article
            style={{
              marginBottom: "2rem",
              paddingBottom: "2rem",
              borderBottom: "1px solid rgba(201, 168, 76, 0.3)",
            }}
          >
            <h3
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "#C9A84C",
                marginBottom: "0.75rem",
                letterSpacing: "0.03em",
              }}
            >
              {t("hiw.r3.title")}
            </h3>
            <p style={{ fontSize: "1rem", lineHeight: "1.6" }}>
              {t("hiw.r3.desc")}
            </p>
          </article>

          {/* Digital Copy */}
          <article
            style={{
              marginBottom: "2rem",
              paddingBottom: "2rem",
              borderBottom: "1px solid rgba(201, 168, 76, 0.3)",
            }}
          >
            <h3
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "#C9A84C",
                marginBottom: "0.75rem",
                letterSpacing: "0.03em",
              }}
            >
              {t("hiw.r4.title")}
            </h3>
            <p style={{ fontSize: "1rem", lineHeight: "1.6" }}>
              {t("hiw.r4.desc")}
            </p>
          </article>

          {/* Reading Tools */}
          <article
            style={{
              marginBottom: "2rem",
              paddingBottom: "2rem",
              borderBottom: "1px solid rgba(201, 168, 76, 0.3)",
            }}
          >
            <h3
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "#C9A84C",
                marginBottom: "0.75rem",
                letterSpacing: "0.03em",
              }}
            >
              {t("hiw.r5.title")}
            </h3>
            <p style={{ fontSize: "1rem", lineHeight: "1.6" }}>
              {t("hiw.r5.desc")}
            </p>
          </article>

          {/* Resume Reading */}
          <article
            style={{
              marginBottom: "0",
              paddingBottom: "0",
            }}
          >
            <h3
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "#C9A84C",
                marginBottom: "0.75rem",
                letterSpacing: "0.03em",
              }}
            >
              {t("hiw.r6.title")}
            </h3>
            <p style={{ fontSize: "1rem", lineHeight: "1.6" }}>
              {t("hiw.r6.desc")}
            </p>
          </article>
        </section>

        {/* FOR WRITERS SECTION */}
        <section style={{ marginBottom: "3rem" }}>
          <h2
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#C9A84C",
              borderBottom: "1px solid #C9A84C",
              paddingBottom: "0.75rem",
              marginBottom: "2rem",
              letterSpacing: "0.05em",
            }}
          >
            {t("hiw.forWriters")}
          </h2>

          {/* Submit Your Manuscript */}
          <article
            style={{
              marginBottom: "2rem",
              paddingBottom: "2rem",
              borderBottom: "1px solid rgba(201, 168, 76, 0.3)",
            }}
          >
            <h3
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "#C9A84C",
                marginBottom: "0.75rem",
                letterSpacing: "0.03em",
              }}
            >
              {t("hiw.w1.title")}
            </h3>
            <p style={{ fontSize: "1rem", lineHeight: "1.6" }}>
              {t("hiw.w1.desc")}
            </p>
          </article>

          {/* Human Review */}
          <article
            style={{
              marginBottom: "2rem",
              paddingBottom: "2rem",
              borderBottom: "1px solid rgba(201, 168, 76, 0.3)",
            }}
          >
            <h3
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "#C9A84C",
                marginBottom: "0.75rem",
                letterSpacing: "0.03em",
              }}
            >
              {t("hiw.w2.title")}
            </h3>
            <p style={{ fontSize: "1rem", lineHeight: "1.6" }}>
              {t("hiw.w2.desc")}
            </p>
          </article>

          {/* Response Timeline */}
          <article
            style={{
              marginBottom: "2rem",
              paddingBottom: "2rem",
              borderBottom: "1px solid rgba(201, 168, 76, 0.3)",
            }}
          >
            <h3
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "#C9A84C",
                marginBottom: "0.75rem",
                letterSpacing: "0.03em",
              }}
            >
              {t("hiw.w3.title")}
            </h3>
            <p style={{ fontSize: "1rem", lineHeight: "1.6" }}>
              {t("hiw.w3.desc")}
            </p>
          </article>

          {/* Revenue */}
          <article
            style={{
              marginBottom: "2rem",
              paddingBottom: "2rem",
              borderBottom: "1px solid rgba(201, 168, 76, 0.3)",
            }}
          >
            <h3
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "#C9A84C",
                marginBottom: "0.75rem",
                letterSpacing: "0.03em",
              }}
            >
              {t("hiw.w4.title")}
            </h3>
            <p style={{ fontSize: "1rem", lineHeight: "1.6" }}>
              {t("hiw.w4.desc")}
            </p>
          </article>

          {/* Your Role */}
          <article
            style={{
              marginBottom: "0",
              paddingBottom: "0",
            }}
          >
            <h3
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "#C9A84C",
                marginBottom: "0.75rem",
                letterSpacing: "0.03em",
              }}
            >
              {t("hiw.w5.title")}
            </h3>
            <p style={{ fontSize: "1rem", lineHeight: "1.6" }}>
              {t("hiw.w5.desc")}
            </p>
          </article>
        </section>

        {/* FOR EVERYONE SECTION */}
        <section>
          <h2
            style={{
              fontFamily: '"JetBrains Mono", monospace',
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "#C9A84C",
              borderBottom: "1px solid #C9A84C",
              paddingBottom: "0.75rem",
              marginBottom: "2rem",
              letterSpacing: "0.05em",
            }}
          >
            {t("hiw.forEveryone")}
          </h2>

          {/* Languages */}
          <article
            style={{
              marginBottom: "2rem",
              paddingBottom: "2rem",
              borderBottom: "1px solid rgba(201, 168, 76, 0.3)",
            }}
          >
            <h3
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "#C9A84C",
                marginBottom: "0.75rem",
                letterSpacing: "0.03em",
              }}
            >
              {t("hiw.e1.title")}
            </h3>
            <p style={{ fontSize: "1rem", lineHeight: "1.6" }}>
              {t("hiw.e1.desc")}
            </p>
          </article>

          {/* No Ads */}
          <article
            style={{
              marginBottom: "2rem",
              paddingBottom: "2rem",
              borderBottom: "1px solid rgba(201, 168, 76, 0.3)",
            }}
          >
            <h3
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "#C9A84C",
                marginBottom: "0.75rem",
                letterSpacing: "0.03em",
              }}
            >
              {t("hiw.e2.title")}
            </h3>
            <p style={{ fontSize: "1rem", lineHeight: "1.6" }}>
              {t("hiw.e2.desc")}
            </p>
          </article>

          {/* Day & Night */}
          <article
            style={{
              marginBottom: "0",
              paddingBottom: "0",
            }}
          >
            <h3
              style={{
                fontFamily: '"JetBrains Mono", monospace',
                fontSize: "1.1rem",
                fontWeight: "600",
                color: "#C9A84C",
                marginBottom: "0.75rem",
                letterSpacing: "0.03em",
              }}
            >
              {t("hiw.e3.title")}
            </h3>
            <p style={{ fontSize: "1rem", lineHeight: "1.6" }}>
              {t("hiw.e3.desc")}
            </p>
          </article>
        </section>
      </div>
    </div>
  );
}
