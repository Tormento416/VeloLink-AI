import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CtaBand, PageHero, Section, SectionHead } from "@/components/site/Layout";
import { demoCategories, demos, type Demo } from "@/lib/demos";

export const Route = createFileRoute("/demos")({
  validateSearch: (search: Record<string, unknown>): { category?: string } => {
    const category = search["category"];
    return typeof category === "string" && demoCategories.some((c) => c.id === category)
      ? { category }
      : {};
  },
  head: () => ({
    meta: [
      { title: "Demos — Sample Website Builds by Industry | VeloLinkAI" },
      { name: "description", content: "Browse sample website builds for legal offices, local trades like plumbing and HVAC, and creative or community spaces such as artist pages and music venues." },
      { property: "og:title", content: "VeloLinkAI Demos" },
      { property: "og:description", content: "See sample builds for legal offices, local trades, and creative or community spaces." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Demos,
});

function Demos() {
  const { category } = Route.useSearch();
  const activeCategory = demoCategories.find((c) => c.id === category);
  const visible = activeCategory ? demos.filter((d) => d.category === activeCategory.id) : demos;

  return (
    <>
      <PageHero eyebrow="Demos" title="See it built for a business like yours.">
        Sample builds across the kinds of businesses we work with — legal offices, local trades, and
        creative or community spaces. Pick a category to browse them.
      </PageHero>

      <Section>
        <SectionHead
          eyebrow="Browse by category"
          title="What kind of business are you?"
          sub="Pick a category to see the sample builds for it, or browse everything."
        />
        <div className="flex flex-wrap gap-2">
          <CategoryLink label="All demos" active={activeCategory === undefined} />
          {demoCategories.map((c) => (
            <CategoryLink key={c.id} category={c.id} label={c.label} active={activeCategory?.id === c.id} />
          ))}
        </div>
        <p className="mt-6 max-w-2xl text-sm text-muted-foreground">
          {activeCategory
            ? activeCategory.blurb
            : "Every demo below is a sample build we put together to show what is possible — not a client's live site."}
        </p>
        <div className={`mt-8 grid gap-6 ${visible.length > 2 ? "md:grid-cols-2 lg:grid-cols-3" : "md:grid-cols-2"}`}>
          {visible.map((demo) => (
            <DemoCard key={demo.id} demo={demo} />
          ))}
        </div>
      </Section>

      <Section className="bg-navy text-navy-foreground">
        <div className="mb-12 max-w-2xl">
          <p className="eyebrow">How a demo works</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">Pick one, then we make it yours.</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { n: "01", title: "Choose a sample", text: "Tell us which demo is closest to your business — or name the kind of work you do." },
            { n: "02", title: "Walk through it", text: "We show how the page is built, how calls and enquiries are handled, and what happens after hours." },
            { n: "03", title: "Map it to you", text: "We swap in your services, hours, and phone line and show what changes for your quote." },
          ].map((step) => (
            <div key={step.n} className="rounded-xl border border-navy-border bg-navy-deep p-6">
              <span className="font-display text-sm font-semibold text-navy-muted">{step.n}</span>
              <h3 className="mt-2 text-xl font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm text-navy-muted">{step.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <CtaBand title="Want to see one built for your business?" label="Request a Demo" />
    </>
  );
}

function CategoryLink({ category, label, active }: { category?: string; label: string; active: boolean }) {
  return (
    <Link
      to="/demos"
      search={category ? { category } : {}}
      aria-current={active ? "true" : undefined}
      className={`rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-input bg-card text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </Link>
  );
}

function DemoCard({ demo }: { demo: Demo }) {
  const Icon = demo.icon;
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border bg-card shadow-card">
      <div className="relative overflow-hidden bg-navy px-5 pb-6 pt-4">
        <div className="grid-lines pointer-events-none absolute inset-0" />
        <div className="relative flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-navy-border" />
          <span className="h-2 w-2 rounded-full bg-navy-border" />
          <span className="h-2 w-2 rounded-full bg-navy-border" />
        </div>
        <div className="relative mt-4 flex items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-primary">
            <Icon className="h-5 w-5" />
          </span>
          <span className="truncate text-sm font-medium text-navy-muted">{demo.title}</span>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-lg font-semibold">{demo.title}</h3>
        <p className="mt-2 text-sm text-muted-foreground">{demo.summary}</p>
        <ul className="mt-4 space-y-2 text-sm">
          {demo.shows.map((item) => (
            <li key={item} className="flex gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              {item}
            </li>
          ))}
        </ul>
        <div className="mt-auto flex flex-wrap items-center justify-between gap-3 border-t pt-5">
          <span className="mt-2 rounded-full border border-accent/40 bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
            {demo.status === "live" ? "Live demo" : "Sample build"}
          </span>
          <div className="mt-2 flex gap-2">
            {demo.status === "live" && demo.url ? (
              <Button asChild size="sm" variant="outline">
                <a href={demo.url} target="_blank" rel="noopener noreferrer">
                  View live demo
                </a>
              </Button>
            ) : null}
            <Button asChild size="sm" variant="hero">
              <Link to="/contact" search={{ demo: demo.id }}>
                Request this demo <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}
