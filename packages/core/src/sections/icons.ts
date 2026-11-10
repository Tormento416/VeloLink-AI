/** Icons the AI and editor may pick for services and highlights. Keys map to lucide icons in the renderer. */
export const ICON_KEYS = [
  "wrench", "droplets", "flame", "zap", "home", "leaf", "scissors", "paw", "heart", "star",
  "shield", "clock", "phone", "mail", "map-pin", "check", "calendar", "sparkles", "users", "truck",
  "hammer", "paintbrush", "car", "stethoscope", "dumbbell", "utensils", "camera", "briefcase",
  "thermometer", "snowflake", "trees", "bug", "key", "baby", "dog", "award", "thumbs-up", "smile",
] as const;
export type IconKey = (typeof ICON_KEYS)[number];
