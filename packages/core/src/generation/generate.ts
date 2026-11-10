import type { z } from "zod";
import { Section } from "../sections/schemas";
import { Site } from "../site";
import { THEMES } from "../theme";
import { planSite, type PlannedSection, type Template } from "../templates";
import type { Package } from "../packages";
import { COPY_SCHEMAS, isCopySection, type CopySectionType } from "./copy";
import type { Intake } from "./intake";
import { buildSectionPrompt, retryNote, SYSTEM_PROMPT } from "./prompts";
import { WriterRefusal, type SectionWriter } from "./writer";

export type GenerateOptions = {
  template: Template;
  pkg: Package;
  intake: Intake;
  writer: SectionWriter;
  /** Tries per section, counting the first. */
  maxAttempts?: number;
  /** Sections written at the same time. */
  concurrency?: number;
};

export type SectionLog = {
  page: string;
  type: Section["type"];
  source: "ai" | "intake";
  attempts: number;
};

export type GenerateResult = {
  site: Site;
  log: SectionLog[];
  /** Sections left out because intake had nothing for them, e.g. reviews with no reviews supplied. */
  skipped: { page: string; type: Section["type"]; reason: string }[];
};

export type SectionFailure = { page: string; type: Section["type"]; reason: string };

/** Some sections could not be written. The job should go to a person. */
export class GenerationError extends Error {
  constructor(readonly failures: SectionFailure[]) {
    super(`Could not write ${failures.length} section(s): ${failures.map((f) => `${f.page || "home"}/${f.type}: ${f.reason}`).join("; ")}`);
    this.name = "GenerationError";
  }
}

/** Builds a full site draft from intake facts, a template and a package. */
export async function generateSite(opts: GenerateOptions): Promise<GenerateResult> {
  const { template, pkg, intake, writer, maxAttempts = 3, concurrency = 4 } = opts;
  const theme = THEMES[template.themeId];
  if (!theme) throw new Error(`Template ${template.id} uses unknown theme ${template.themeId}`);

  const plan = planSite(template, pkg);
  const ctaHref = primaryHref(intake, pkg);
  const log: SectionLog[] = [];
  const skipped: GenerateResult["skipped"] = [];
  const failures: SectionFailure[] = [];

  // Hero and services read the same everywhere; other sections are written per page.
  const shared = new Map<string, Promise<Record<string, unknown>>>();
  const limit = limiter(concurrency);

  const writeCopy = (type: CopySectionType, slug: string, pageTitle: string) => {
    const key = type === "hero" || type === "services" ? type : `${type}:${slug}`;
    let job = shared.get(key);
    if (!job) {
      const prompt = buildSectionPrompt({ template, intake, pageTitle, sectionType: type });
      job = limit(() => writeWithRetry(writer, type, prompt, maxAttempts, ctaHref)).then(({ props, attempts }) => {
        log.push({ page: slug, type, source: "ai", attempts });
        return props;
      });
      shared.set(key, job);
    }
    return job;
  };

  const pages = await Promise.all(
    plan.map(async (page) => {
      const sections = await Promise.all(
        page.sections.map(async (planned): Promise<Section | null> => {
          try {
            if (isCopySection(planned.type)) {
              const props = await writeCopy(planned.type, page.slug, page.title);
              return withVariant(planned, enrich(planned.type, props, intake, pkg));
            }
            const props = intakeProps(planned.type, intake);
            if (!props) {
              skipped.push({ page: page.slug, type: planned.type, reason: `Nothing in intake for ${planned.type}` });
              return null;
            }
            log.push({ page: page.slug, type: planned.type, source: "intake", attempts: 0 });
            return Section.parse({ ...withVariant(planned, props) });
          } catch (err) {
            failures.push({ page: page.slug, type: planned.type, reason: err instanceof Error ? err.message : String(err) });
            return null;
          }
        }),
      );
      return { slug: page.slug, title: page.title, sections: sections.filter((s): s is Section => s !== null) };
    }),
  );

  if (failures.length) throw new GenerationError(failures);

  const site = Site.parse({
    business: intake.business,
    theme,
    templateId: template.id,
    templateVersion: template.version,
    package: pkg,
    pages,
  });
  return { site, log, skipped };
}

async function writeWithRetry(
  writer: SectionWriter,
  type: CopySectionType,
  basePrompt: string,
  maxAttempts: number,
  ctaHref: string,
): Promise<{ props: Record<string, unknown>; attempts: number }> {
  const schema: z.ZodObject = COPY_SCHEMAS[type];
  let prompt = basePrompt;
  let lastIssues: string[] = [];
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    let raw: unknown;
    try {
      raw = await writer.write({ sectionType: type, system: SYSTEM_PROMPT, prompt, schema });
    } catch (err) {
      if (err instanceof WriterRefusal) throw err;
      lastIssues = [err instanceof Error ? err.message : String(err)];
      prompt = basePrompt + retryNote(lastIssues);
      continue;
    }
    // Validate against the full section schema, with the fields the AI doesn't write filled in.
    const copy = schema.safeParse(raw);
    const props = copy.success ? { ...copy.data, ...(type === "hero" || type === "cta" ? { ctaHref } : {}) } : null;
    const full = props ? Section.safeParse({ type, props }) : null;
    if (props && full?.success) return { props, attempts: attempt };
    const issues = (copy.success ? full!.error! : copy.error).issues;
    lastIssues = issues.map((i) => `${i.path.join(".") || "(root)"}: ${i.message}`);
    prompt = basePrompt + retryNote(lastIssues);
  }
  throw new Error(`Invalid after ${maxAttempts} tries: ${lastIssues.join("; ")}`);
}

function withVariant(planned: PlannedSection, props: Record<string, unknown>): Section {
  return Section.parse({ type: planned.type, ...(planned.variant ? { variant: planned.variant } : {}), props });
}

/** Adds facts the AI doesn't write: photos and the secondary hero link. */
function enrich(type: CopySectionType, props: Record<string, unknown>, intake: Intake, pkg: Package): Record<string, unknown> {
  const { photos } = intake;
  switch (type) {
    case "hero":
      return {
        ...props,
        secondaryCtaLabel: "Our services",
        secondaryCtaHref: pkg === "single_page" ? "#services" : "/services",
        ...(photos.hero ? { image: photos.hero } : {}),
      };
    case "about":
      return photos.about ? { ...props, image: photos.about } : props;
    case "cta":
      return photos.cta ? { ...props, image: photos.cta } : props;
    default:
      return props;
  }
}

/** Sections built straight from intake facts. Returns null when there is nothing to show. */
function intakeProps(type: Section["type"], intake: Intake): Record<string, unknown> | null {
  switch (type) {
    case "reviews":
      return intake.reviews.length ? { heading: "What customers say", items: intake.reviews } : null;
    case "highlights":
      return intake.highlights.length ? { items: intake.highlights } : null;
    case "gallery":
      return intake.photos.gallery.length ? { heading: "Our work", images: intake.photos.gallery } : null;
    case "areas": {
      const areas = intake.business.serviceAreas;
      return areas.length ? { heading: "Areas we serve", areas } : null;
    }
    case "community":
      return intake.community.length ? { heading: "In the community", items: intake.community } : null;
    case "contact": {
      const b = intake.business;
      return {
        heading: "Get in touch",
        phone: b.phone,
        ...(b.email ? { email: b.email } : {}),
        ...(b.address ? { address: b.address } : {}),
        hours: b.hours,
        ...(b.serviceArea ? { serviceArea: b.serviceArea } : {}),
      };
    }
    default:
      throw new Error(`No intake mapping for section type ${type}`);
  }
}

/** Where the main button goes. */
export function primaryHref(intake: Intake, pkg: Package): string {
  const tel = `tel:${intake.business.phone.replace(/[^\d+]/g, "")}`;
  switch (intake.primaryAction) {
    case "book":
      return intake.bookingUrl ?? tel;
    case "quote":
      return pkg === "single_page" ? "#contact" : "/contact";
    default:
      return tel;
  }
}

function limiter(max: number) {
  let active = 0;
  const queue: (() => void)[] = [];
  return <T>(fn: () => Promise<T>): Promise<T> =>
    new Promise<T>((resolve, reject) => {
      const run = () => {
        active++;
        fn().then(resolve, reject).finally(() => {
          active--;
          queue.shift()?.();
        });
      };
      if (active < max) run();
      else queue.push(run);
    });
}
