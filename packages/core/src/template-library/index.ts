import { Template } from "../templates";
import { cleanPro } from "./clean-pro";
import { warmClassic } from "./warm-classic";

/** Launch templates (visual styles), validated at load so a bad one fails fast. */
export const TEMPLATES: readonly Template[] = [cleanPro, warmClassic].map((t) => Template.parse(t));

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
