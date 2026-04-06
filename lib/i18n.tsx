"use client";

// ─── TINTAXIS UI TRANSLATIONS ────────────────────────────────────────────────
// Lightweight i18n for platform UI. Books stay in their original language —
// this only translates navigation, buttons, labels, and subscription copy.
//
// Supported locales: en (default), es, zh, pt, it

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Locale = "en" | "es" | "zh" | "pt" | "it";

const LOCALE_KEY = "tintaxis_locale";

// ── Translation dictionary ──────────────────────────────────────────────────

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Nav
    "nav.library": "Library",
    "nav.writers": "Writers",
    "nav.experience": "Experience",
    "nav.publish": "Publish",
    "nav.impact": "Impact",
    "nav.howItWorks": "How It Works",
    "nav.artPathways": "Art Pathways",
    "nav.signIn": "Sign In",
    "nav.authorLogin": "Author Login",
    "nav.studio": "Studio",
    "nav.account": "Account",
    "nav.logOut": "Log Out",

    // Reading
    "reading.loading": "Loading chapter...",
    "reading.sealed": "This chapter is reserved for subscribers.",
    "reading.sealedAction": "Unlock the full archive to continue reading.",
    "reading.endOfChapter": "END OF CHAPTER",
    "reading.previous": "Previous",
    "reading.next": "Next",
    "reading.sealed.label": "Sealed",
    "reading.shareChapter": "Share this chapter",
    "reading.copyLink": "Copy Link",
    "reading.copied": "Copied",
    "reading.beginReading": "Begin Reading",
    "reading.digitalCopy": "Digital Copy",
    "reading.oneTimePdf": "One-time PDF. Yours to keep.",
    "reading.complete": "Complete",
    "reading.minRead": "min read",
    "reading.comingSoon": "Coming soon",

    // Subscription
    "sub.buyNow": "BUY NOW",
    "sub.subscribe": "SUBSCRIBE",
    "sub.opening": "OPENING...",
    "sub.secured": "All payments secured by",
    "sub.trustCopy": "Every transaction processed through Stripe — the same infrastructure trusted by Amazon, Google, and Shopify.",

    // Email gate
    "email.stayInArchive": "Stay in the archive.",
    "email.placeholder": "your@email.com",

    // General
    "general.language": "Language",
  },

  es: {
    "nav.library": "Biblioteca",
    "nav.writers": "Escritores",
    "nav.experience": "Experiencia",
    "nav.publish": "Publicar",
    "nav.impact": "Impacto",
    "nav.howItWorks": "Cómo Funciona",
    "nav.artPathways": "Caminos del Arte",
    "nav.signIn": "Iniciar Sesión",
    "nav.authorLogin": "Acceso Autor",
    "nav.studio": "Estudio",
    "nav.account": "Cuenta",
    "nav.logOut": "Cerrar Sesión",

    "reading.loading": "Cargando capítulo...",
    "reading.sealed": "Este capítulo está reservado para suscriptores.",
    "reading.sealedAction": "Desbloquea el archivo completo para seguir leyendo.",
    "reading.endOfChapter": "FIN DEL CAPÍTULO",
    "reading.previous": "Anterior",
    "reading.next": "Siguiente",
    "reading.sealed.label": "Sellado",
    "reading.shareChapter": "Compartir este capítulo",
    "reading.copyLink": "Copiar Enlace",
    "reading.copied": "Copiado",
    "reading.beginReading": "Comenzar a Leer",
    "reading.digitalCopy": "Copia Digital",
    "reading.oneTimePdf": "PDF único. Tuyo para siempre.",
    "reading.complete": "Completo",
    "reading.minRead": "min de lectura",
    "reading.comingSoon": "Próximamente",

    "sub.buyNow": "COMPRAR",
    "sub.subscribe": "SUSCRIBIRSE",
    "sub.opening": "ABRIENDO...",
    "sub.secured": "Todos los pagos protegidos por",
    "sub.trustCopy": "Cada transacción procesada a través de Stripe — la misma infraestructura de confianza de Amazon, Google y Shopify.",

    "email.stayInArchive": "Quédate en el archivo.",
    "email.placeholder": "tu@correo.com",

    "general.language": "Idioma",
  },

  zh: {
    "nav.library": "书库",
    "nav.writers": "作家",
    "nav.experience": "体验",
    "nav.publish": "出版",
    "nav.impact": "影响力",
    "nav.howItWorks": "使用指南",
    "nav.artPathways": "艺术之路",
    "nav.signIn": "登录",
    "nav.authorLogin": "作者登录",
    "nav.studio": "工作室",
    "nav.account": "账户",
    "nav.logOut": "退出",

    "reading.loading": "加载章节中...",
    "reading.sealed": "此章节仅限订阅用户阅读。",
    "reading.sealedAction": "解锁完整档案，继续阅读。",
    "reading.endOfChapter": "章节结束",
    "reading.previous": "上一章",
    "reading.next": "下一章",
    "reading.sealed.label": "封存",
    "reading.shareChapter": "分享本章",
    "reading.copyLink": "复制链接",
    "reading.copied": "已复制",
    "reading.beginReading": "开始阅读",
    "reading.digitalCopy": "电子版",
    "reading.oneTimePdf": "一次性 PDF，永久拥有。",
    "reading.complete": "已读完",
    "reading.minRead": "分钟阅读",
    "reading.comingSoon": "即将上线",

    "sub.buyNow": "立即购买",
    "sub.subscribe": "订阅",
    "sub.opening": "打开中...",
    "sub.secured": "所有支付由以下平台保障",
    "sub.trustCopy": "每笔交易均通过 Stripe 处理——与 Amazon、Google 和 Shopify 使用的相同基础设施。",

    "email.stayInArchive": "留在档案中。",
    "email.placeholder": "你的邮箱@email.com",

    "general.language": "语言",
  },

  pt: {
    "nav.library": "Biblioteca",
    "nav.writers": "Escritores",
    "nav.experience": "Experiência",
    "nav.publish": "Publicar",
    "nav.impact": "Impacto",
    "nav.howItWorks": "Como Funciona",
    "nav.artPathways": "Caminhos da Arte",
    "nav.signIn": "Entrar",
    "nav.authorLogin": "Login Autor",
    "nav.studio": "Estúdio",
    "nav.account": "Conta",
    "nav.logOut": "Sair",

    "reading.loading": "Carregando capítulo...",
    "reading.sealed": "Este capítulo é reservado para assinantes.",
    "reading.sealedAction": "Desbloqueie o arquivo completo para continuar lendo.",
    "reading.endOfChapter": "FIM DO CAPÍTULO",
    "reading.previous": "Anterior",
    "reading.next": "Próximo",
    "reading.sealed.label": "Selado",
    "reading.shareChapter": "Compartilhar este capítulo",
    "reading.copyLink": "Copiar Link",
    "reading.copied": "Copiado",
    "reading.beginReading": "Começar a Ler",
    "reading.digitalCopy": "Cópia Digital",
    "reading.oneTimePdf": "PDF único. Seu para sempre.",
    "reading.complete": "Completo",
    "reading.minRead": "min de leitura",
    "reading.comingSoon": "Em breve",

    "sub.buyNow": "COMPRAR",
    "sub.subscribe": "ASSINAR",
    "sub.opening": "ABRINDO...",
    "sub.secured": "Todos os pagamentos protegidos por",
    "sub.trustCopy": "Cada transação processada pelo Stripe — a mesma infraestrutura confiável da Amazon, Google e Shopify.",

    "email.stayInArchive": "Fique no arquivo.",
    "email.placeholder": "seu@email.com",

    "general.language": "Idioma",
  },

  it: {
    "nav.library": "Biblioteca",
    "nav.writers": "Scrittori",
    "nav.experience": "Esperienza",
    "nav.publish": "Pubblica",
    "nav.impact": "Impatto",
    "nav.howItWorks": "Come Funziona",
    "nav.artPathways": "Percorsi d'Arte",
    "nav.signIn": "Accedi",
    "nav.authorLogin": "Login Autore",
    "nav.studio": "Studio",
    "nav.account": "Account",
    "nav.logOut": "Esci",

    "reading.loading": "Caricamento capitolo...",
    "reading.sealed": "Questo capitolo è riservato agli abbonati.",
    "reading.sealedAction": "Sblocca l'archivio completo per continuare a leggere.",
    "reading.endOfChapter": "FINE DEL CAPITOLO",
    "reading.previous": "Precedente",
    "reading.next": "Successivo",
    "reading.sealed.label": "Sigillato",
    "reading.shareChapter": "Condividi questo capitolo",
    "reading.copyLink": "Copia Link",
    "reading.copied": "Copiato",
    "reading.beginReading": "Inizia a Leggere",
    "reading.digitalCopy": "Copia Digitale",
    "reading.oneTimePdf": "PDF unico. Tuo per sempre.",
    "reading.complete": "Completato",
    "reading.minRead": "min di lettura",
    "reading.comingSoon": "Prossimamente",

    "sub.buyNow": "ACQUISTA",
    "sub.subscribe": "ABBONATI",
    "sub.opening": "APERTURA...",
    "sub.secured": "Tutti i pagamenti protetti da",
    "sub.trustCopy": "Ogni transazione elaborata tramite Stripe — la stessa infrastruttura di fiducia di Amazon, Google e Shopify.",

    "email.stayInArchive": "Resta nell'archivio.",
    "email.placeholder": "tua@email.com",

    "general.language": "Lingua",
  },
};

// ── Locale labels for the switcher button ───────────────────────────────────

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  es: "Español",
  zh: "中文",
  pt: "Português",
  it: "Italiano",
};

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: "EN",
  es: "ES",
  zh: "中",
  pt: "PT",
  it: "IT",
};

// ── Context ─────────────────────────────────────────────────────────────────

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextValue>({
  locale: "en",
  setLocale: () => {},
  t: (key) => key,
});

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    const stored = localStorage.getItem(LOCALE_KEY) as Locale | null;
    if (stored && translations[stored]) {
      setLocaleState(stored);
    }
  }, []);

  const setLocale = (l: Locale) => {
    setLocaleState(l);
    localStorage.setItem(LOCALE_KEY, l);
  };

  const t = (key: string): string => {
    return translations[locale]?.[key] ?? translations.en[key] ?? key;
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
