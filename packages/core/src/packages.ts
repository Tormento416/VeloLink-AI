import { z } from "zod";
import type { SectionType } from "./sections/schemas";

/** The packages VeloLink sells. A package decides which pages a site gets. */
export const Package = z.enum(["single_page", "five_page", "seven_plus_page"]);
export type Package = z.infer<typeof Package>;

export type PagePlan = { slug: string; title: string; sections: SectionType[] };

/** Default pages per package. 7+ sites can add pages beyond this list. */
export const PACKAGE_PAGES: Record<Package, readonly PagePlan[]> = {
  single_page: [
    { slug: "", title: "Home", sections: ["hero", "services", "about", "reviews", "faq", "contact"] },
  ],
  five_page: [
    { slug: "", title: "Home", sections: ["hero", "services", "reviews", "cta"] },
    { slug: "services", title: "Services", sections: ["services", "cta"] },
    { slug: "about", title: "About", sections: ["about", "reviews"] },
    { slug: "faq", title: "FAQ", sections: ["faq", "cta"] },
    { slug: "contact", title: "Contact", sections: ["contact"] },
  ],
  seven_plus_page: [
    { slug: "", title: "Home", sections: ["hero", "services", "reviews", "cta"] },
    { slug: "services", title: "Services", sections: ["services", "cta"] },
    { slug: "about", title: "About", sections: ["about", "cta"] },
    { slug: "reviews", title: "Reviews", sections: ["reviews", "cta"] },
    { slug: "service-area", title: "Service Area", sections: ["about", "contact"] },
    { slug: "faq", title: "FAQ", sections: ["faq", "cta"] },
    { slug: "contact", title: "Contact", sections: ["contact"] },
  ],
};

export const PAGE_LIMITS: Record<Package, { min: number; max: number | null }> = {
  single_page: { min: 1, max: 1 },
  five_page: { min: 5, max: 5 },
  seven_plus_page: { min: 7, max: null },
};

/** Returns an error message when a page count doesn't fit the package, else null. */
export function pageCountError(pkg: Package, count: number): string | null {
  const { min, max } = PAGE_LIMITS[pkg];
  if (count >= min && (max === null || count <= max)) return null;
  const want = max === null ? `at least ${min}` : min === max ? `exactly ${min}` : `${min}-${max}`;
  return `${pkg} sites need ${want} pages, got ${count}`;
}
