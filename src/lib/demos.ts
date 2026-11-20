import {
  AirVent,
  Briefcase,
  Droplets,
  Gavel,
  Images,
  Music2,
  Palette,
  Scale,
  Wrench,
  type LucideIcon,
} from "lucide-react";

/*
 * Demo showcase data.
 *
 * `status: "sample"` means the build exists to show what is possible and is not
 * a client's live site. Set `status: "live"` and add `url` only for a demo that
 * is actually published and safe to show publicly.
 */

export type DemoStatus = "sample" | "live";

export type DemoCategory = {
  id: string;
  label: string;
  blurb: string;
  icon: LucideIcon;
};

export type Demo = {
  id: string;
  title: string;
  category: string;
  summary: string;
  shows: string[];
  status: DemoStatus;
  icon: LucideIcon;
  url?: string;
};

export const demoCategories: DemoCategory[] = [
  {
    id: "legal",
    label: "Legal Offices",
    blurb: "Intake pages that qualify prospects before the first call.",
    icon: Gavel,
  },
  {
    id: "trades",
    label: "Local Services & Trades",
    blurb: "Plumbing, HVAC, electrical, and other work that lives on the phone.",
    icon: Wrench,
  },
  {
    id: "creative",
    label: "Creative & Community",
    blurb: "Artists, venues, and independent spaces with something to show.",
    icon: Palette,
  },
];

export const demos: Demo[] = [
  {
    id: "small-firm-intake",
    title: "Small Firm Intake Page",
    category: "legal",
    summary: "A focused page for a small practice that needs qualified inquiries, not tire-kickers.",
    shows: [
      "Practice areas written in plain language",
      "Intake form that captures the case details",
      "Consultation booking without phone tag",
    ],
    status: "sample",
    icon: Scale,
  },
  {
    id: "solo-attorney-authority",
    title: "Solo Attorney Authority Site",
    category: "legal",
    summary: "Five pages that make an independent practice look established before the first call.",
    shows: [
      "Attorney bio, credentials, and service area",
      "Common questions answered up front",
      "Call and booking paths on every page",
    ],
    status: "sample",
    icon: Briefcase,
  },
  {
    id: "emergency-plumber",
    title: "Emergency Plumber One-Pager",
    category: "trades",
    summary: "Built for the calls that come at 2 a.m., when the first business to answer wins.",
    shows: [
      "Click-to-call above the fold",
      "Service area and response-time messaging",
      "After-hours call handling shown live",
    ],
    status: "sample",
    icon: Droplets,
  },
  {
    id: "hvac-seasonal-offer",
    title: "HVAC Seasonal Tune-Up Page",
    category: "trades",
    summary: "A single page for the tune-up offer in the weeks when it actually sells.",
    shows: [
      "Offer, what's included, and price framing",
      "Scheduling and financing prompts",
      "Follow-up reminders for the next season",
    ],
    status: "sample",
    icon: AirVent,
  },
  {
    id: "local-artist-portfolio",
    title: "Local Artist Portfolio Page",
    category: "creative",
    summary: "A page that shows the work first and lets people buy or commission it without a middleman.",
    shows: [
      "Gallery layout that stays fast on phones",
      "Commission and booking enquiry path",
      "Mailing-list capture for new releases",
    ],
    status: "sample",
    icon: Images,
  },
  {
    id: "warehouse-music-venue",
    title: "Warehouse Venue & Event Series",
    category: "creative",
    summary: "An independent space promoting nights that never make it onto the big listing sites.",
    shows: [
      "Event calendar with ticket links",
      "Photo and video atmosphere section",
      "Door list and enquiry form",
    ],
    status: "sample",
    icon: Music2,
  },
];

export function findDemo(id: string): Demo | undefined {
  return demos.find((demo) => demo.id === id);
}

export function normalizeDemo(value: unknown): string | undefined {
  return typeof value === "string" && findDemo(value) ? value : undefined;
}

export function categoryLabel(categoryId: string): string {
  return demoCategories.find((category) => category.id === categoryId)?.label ?? "";
}

export function demoRequest(demo: Demo): string {
  const label = categoryLabel(demo.category);
  return [
    `I'd like to see the "${demo.title}" demo${label ? ` (${label})` : ""}.`,
    "Please walk me through how it was built and what it would take to adapt it for my business.",
  ].join("\n");
}
