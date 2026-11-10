import { Template } from "../templates";
import { localProSingle } from "./local-pro-single";

/** All launch templates, validated at load so a bad template fails fast. */
export const TEMPLATES: readonly Template[] = [localProSingle].map((t) => Template.parse(t));

export function getTemplate(id: string): Template | undefined {
  return TEMPLATES.find((t) => t.id === id);
}
