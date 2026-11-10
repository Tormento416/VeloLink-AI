import { z } from "zod";

const hex = z.string().regex(/^#[0-9a-fA-F]{6}$/, "Expected a #rrggbb color");

// Font stacks end up inside a <style> tag, so only plain characters are allowed.
const fontStack = z.string().regex(/^[A-Za-z0-9 ,'-]{1,120}$/, "Unsupported font stack");

export const Theme = z.object({
  id: z.string().min(1),
  colors: z.object({
    primary: hex,
    onPrimary: hex,
    background: hex,
    surface: hex,
    text: hex,
    muted: hex,
  }),
  fonts: z.object({ heading: fontStack, body: fontStack }),
  radius: z.number().min(0).max(32),
});
export type Theme = z.infer<typeof Theme>;

export const THEMES: Record<string, Theme> = {
  "clean-blue": {
    id: "clean-blue",
    colors: {
      primary: "#1d4ed8",
      onPrimary: "#ffffff",
      background: "#ffffff",
      surface: "#f1f5f9",
      text: "#0f172a",
      muted: "#475569",
    },
    fonts: { heading: "system-ui, sans-serif", body: "system-ui, sans-serif" },
    radius: 8,
  },
  "warm-neutral": {
    id: "warm-neutral",
    colors: {
      primary: "#9a3412",
      onPrimary: "#ffffff",
      background: "#fffbf5",
      surface: "#f5ede3",
      text: "#292524",
      muted: "#57534e",
    },
    fonts: { heading: "Georgia, serif", body: "system-ui, sans-serif" },
    radius: 14,
  },
};

/** Turns a theme into CSS custom properties for the generated site. */
export function themeToCss(theme: Theme): string {
  const c = theme.colors;
  return [
    `--vl-primary:${c.primary}`,
    `--vl-on-primary:${c.onPrimary}`,
    `--vl-bg:${c.background}`,
    `--vl-surface:${c.surface}`,
    `--vl-text:${c.text}`,
    `--vl-muted:${c.muted}`,
    `--vl-font-heading:${theme.fonts.heading}`,
    `--vl-font-body:${theme.fonts.body}`,
    `--vl-radius:${theme.radius}px`,
  ].join(";");
}
