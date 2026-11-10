import { z } from "zod";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Expected a #rrggbb color");

// Font stacks end up inside a <style> tag, so only plain characters are allowed.
const fontStack = z.string().regex(/^[A-Za-z0-9 ,'-]{1,120}$/, "Unsupported font stack");
/** A Google Fonts family with weights, e.g. "Inter:wght@400;600". Goes into a URL. */
const googleFont = z.string().regex(/^[A-Za-z0-9 ]{1,40}(:[a-z]+@[0-9;.]{1,40})?$/, "Unsupported Google Font");

export const Theme = z.object({
  id: z.string().min(1),
  colors: z.object({
    primary: hex,
    onPrimary: hex,
    /** Second brand color for highlights, badges and the hero accent. */
    accent: hex,
    onAccent: hex,
    background: hex,
    surface: hex,
    text: hex,
    muted: hex,
  }),
  fonts: z.object({
    heading: fontStack,
    body: fontStack,
    /** Families loaded from Google Fonts. Empty means system fonts only. */
    load: z.array(googleFont).max(3).default([]),
  }),
  radius: z.number().min(0).max(32),
  /** How the hero sits on the page. */
  hero: z.enum(["plain", "tint", "gradient", "dark"]).default("plain"),
  /** How cards (services, reviews, steps) are drawn. */
  cards: z.enum(["flat", "outline", "shadow"]).default("flat"),
  /** Subtle fade-in and hover lift; always off for visitors who ask for reduced motion. */
  motion: z.enum(["none", "subtle"]).default("none"),
});
export type Theme = z.infer<typeof Theme>;
export type ThemeInput = z.input<typeof Theme>;

const RAW_THEMES: ThemeInput[] = [
  {
    // Simple, modern, to the point.
    id: "essential",
    colors: { primary: "#c2492f", onPrimary: "#ffffff", accent: "#f6d7cc", onAccent: "#3a1a12", background: "#fcfbf8", surface: "#f3eee6", text: "#1f1b18", muted: "#5e5650" },
    fonts: { heading: "Fraunces, Georgia, serif", body: "Inter, system-ui, sans-serif", load: ["Fraunces:wght@500;700", "Inter:wght@400;600"] },
    radius: 0,
    hero: "plain",
    cards: "flat",
    motion: "none",
  },
  {
    // Modern and dynamic.
    id: "momentum",
    colors: { primary: "#0b1f3a", onPrimary: "#ffffff", accent: "#c6f432", onAccent: "#0b1f3a", background: "#ffffff", surface: "#eef2f7", text: "#0b1f3a", muted: "#475569" },
    fonts: { heading: "'Space Grotesk', system-ui, sans-serif", body: "Inter, system-ui, sans-serif", load: ["Space Grotesk:wght@500;700", "Inter:wght@400;600"] },
    radius: 12,
    hero: "dark",
    cards: "shadow",
    motion: "subtle",
  },
  {
    // Elegant, simple flow.
    id: "flow",
    colors: { primary: "#1e5fbf", onPrimary: "#ffffff", accent: "#f4a52a", onAccent: "#2b1a00", background: "#ffffff", surface: "#f2f6fc", text: "#14213d", muted: "#4a5670" },
    fonts: { heading: "Poppins, system-ui, sans-serif", body: "Inter, system-ui, sans-serif", load: ["Poppins:wght@500;600", "Inter:wght@400;600"] },
    radius: 18,
    hero: "gradient",
    cards: "shadow",
    motion: "subtle",
  },
  {
    // Simple, fancy in a subtle way.
    id: "signature",
    colors: { primary: "#2e2a6b", onPrimary: "#ffffff", accent: "#c9a54a", onAccent: "#1d1a40", background: "#fbfaf7", surface: "#f1eee6", text: "#1d1a40", muted: "#5b5872" },
    fonts: { heading: "'Playfair Display', Georgia, serif", body: "Inter, system-ui, sans-serif", load: ["Playfair Display:wght@500;700", "Inter:wght@400;600"] },
    radius: 8,
    hero: "dark",
    cards: "outline",
    motion: "subtle",
  },
  {
    // Community, local pride, updates.
    id: "hometown",
    colors: { primary: "#2459d6", onPrimary: "#ffffff", accent: "#ff8a3d", onAccent: "#2a1200", background: "#ffffff", surface: "#f4f6fa", text: "#111827", muted: "#4b5563" },
    fonts: { heading: "'Plus Jakarta Sans', system-ui, sans-serif", body: "'Plus Jakarta Sans', system-ui, sans-serif", load: ["Plus Jakarta Sans:wght@400;600;800"] },
    radius: 14,
    hero: "tint",
    cards: "outline",
    motion: "subtle",
  },
];

export const THEMES: Record<string, Theme> = Object.fromEntries(RAW_THEMES.map((t) => [t.id, Theme.parse(t)]));

/** Turns a theme into CSS custom properties for the generated site. */
export function themeToCss(theme: Theme): string {
  const c = theme.colors;
  return [
    `--vl-primary:${c.primary}`,
    `--vl-on-primary:${c.onPrimary}`,
    `--vl-accent:${c.accent}`,
    `--vl-on-accent:${c.onAccent}`,
    `--vl-bg:${c.background}`,
    `--vl-surface:${c.surface}`,
    `--vl-text:${c.text}`,
    `--vl-muted:${c.muted}`,
    `--vl-font-heading:${theme.fonts.heading}`,
    `--vl-font-body:${theme.fonts.body}`,
    `--vl-radius:${theme.radius}px`,
  ].join(";");
}

/** Stylesheet URL for the theme's web fonts, or null when it uses system fonts. */
export function themeFontsHref(theme: Theme): string | null {
  if (theme.fonts.load.length === 0) return null;
  const families = theme.fonts.load.map((f) => `family=${f.replace(/ /g, "+")}`).join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

/** Classes on the site wrapper that switch the theme's hero, card and motion styles. */
export function themeClasses(theme: Theme): string {
  return `vl-site vl-hero-bg--${theme.hero} vl-cards--${theme.cards} vl-motion--${theme.motion}`;
}
