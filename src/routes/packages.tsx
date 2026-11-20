import { createFileRoute } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { PageHero, Section, SectionHead, CtaBand, packages } from "@/components/site/Layout";
import { StandaloneOffer } from "@/components/site/StandaloneOffer";

export const Route = createFileRoute("/packages")({
  head: () => ({
    meta: [
      { title: "Build Your Own Bundle & Website Packages | VeloLinkAI" },
      { name: "description", content: "Standalone one-page website revamps starting at $500. Choose extra pages, an AI receptionist, SEO, video backgrounds, or image slideshows — or a complete bundle." },
      { property: "og:title", content: "VeloLinkAI — Build Your Own Bundle" },
      { property: "og:description", content: "Build an à la carte bundle from a $500 one-page website revamp and compare Launch, Momentum, and Scale packages for the right value." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Packages,
});

function Packages() {
  return (
    <>
      <PageHero eyebrow="Products & packages" title="Website revamps, add-ons & bundles.">
        Start with a one-page website revamp from $500. Add what you need, or choose a complete website + AI package.
      </PageHero>
      <Section>
        <StandaloneOffer />
      </Section>
      <Section className="bg-muted">
        <div id="bundles" className="scroll-mt-24"><SectionHead eyebrow="Website + AI bundles" title="Launch, Momentum & Scale." sub="For businesses ready for a complete system. Every bundle includes a website, an AI receptionist, and ongoing maintenance." /></div>
        <div className="grid gap-6 md:grid-cols-3">
          {packages.map((p) => {
            const dark = p.featured;
            return (
              <div key={p.name} className={`relative flex flex-col rounded-2xl border p-8 ${dark ? "border-primary bg-navy text-navy-foreground shadow-glow" : "bg-card shadow-card"}`}>
                <h2 className="text-2xl font-bold">{p.name}</h2>
                <p className={`mt-1 text-sm ${dark ? "text-navy-muted" : "text-muted-foreground"}`}>{p.tagline}</p>
                <div className="mt-6">
                  <p className={`text-xs uppercase tracking-wider ${dark ? "text-navy-muted" : "text-muted-foreground"}`}>Ongoing</p>
                  <p className="font-display text-3xl font-bold">{p.monthly}<span className="text-base font-medium">/month</span></p>
                  <p className={`mt-3 text-xs uppercase tracking-wider ${dark ? "text-navy-muted" : "text-muted-foreground"}`}>Activation</p>
                  <p className="font-display text-lg font-semibold">{p.activation}</p>
                </div>
                <ul className="mt-6 space-y-2 text-sm">
                  {[p.site, p.ai, "Ongoing maintenance and updates"].map((i) => (
                    <li key={i} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />{i}</li>
                  ))}
                </ul>
                <Button asChild variant={dark ? "hero" : "outline"} className="mt-6"><Link to="/contact" search={{ package: p.name }}>Discuss {p.name}</Link></Button>
              </div>
            );
          })}
        </div>
        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-muted-foreground">
          Final pricing depends on integrations, call volume, number of locations, and project scope. We'll confirm everything in writing before work begins.
        </p>
      </Section>
      <CtaBand title="Not sure which package fits?" label="Discuss the Right Fit" />
    </>
  );
}
