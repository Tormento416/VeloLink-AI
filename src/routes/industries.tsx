import { createFileRoute } from "@tanstack/react-router";
import { Zap, Briefcase, Hammer, Info } from "lucide-react";
import { PageHero, Section, CtaBand } from "@/components/site/Layout";

export const Route = createFileRoute("/industries")({
  head: () => ({
    meta: [
      { title: "Industries — Trades, Professional Services, Contractors | VeloLinkAI" },
      { name: "description", content: "How VeloLinkAI helps emergency trades, professional services, and community contractors stop missing opportunities." },
      { property: "og:title", content: "Industries VeloLinkAI Serves" },
      { property: "og:description", content: "Emergency trades, professional services, and community contractors." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Industries,
});

const groups = [
  {
    icon: Zap, name: "Emergency Trades", who: "Plumbers, electricians, HVAC, locksmiths",
    problem: "Urgent calls come at night, on weekends, and while you're on a job. An unanswered call usually means the customer calls someone else.",
    fix: "The AI receptionist answers immediately, identifies emergencies, routes them to your on-call tech, and books routine work for later.",
  },
  {
    icon: Briefcase, name: "Professional Services", who: "Legal, accounting, consulting",
    problem: "Prospects judge you by your website and first call. Dated pages and slow replies cost you consultations.",
    fix: "A professional authority website plus an intake receptionist that collects the right details and schedules consultations.",
  },
  {
    icon: Hammer, name: "Community Contractors", who: "Landscaping, remodeling, roofing",
    problem: "Quote requests pile up during busy season, and follow-up slips while you're on site.",
    fix: "Quote intake gathers project details up front, and leads are routed to you organized and ready to price.",
  },
];

function Industries() {
  return (
    <>
      <PageHero eyebrow="Industries" title="Made for businesses that live on the phone.">
        Different trades lose leads in different ways. Here's how we help each one.
      </PageHero>
      <Section>
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.name} className="grid gap-6 rounded-2xl border bg-card p-8 shadow-card md:grid-cols-[1fr_1.4fr_1.4fr]">
              <div>
                <g.icon className="h-7 w-7 text-accent" />
                <h2 className="mt-4 text-2xl font-bold">{g.name}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{g.who}</p>
              </div>
              <div>
                <p className="eyebrow !text-destructive">The missed opportunity</p>
                <p className="mt-2 text-sm">{g.problem}</p>
              </div>
              <div>
                <p className="eyebrow">How we help</p>
                <p className="mt-2 text-sm">{g.fix}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-10 flex items-start gap-3 rounded-xl border border-accent/40 bg-accent/10 p-5 text-sm">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
          <p>VeloLinkAI currently focuses on <strong>non-medical and non-dental businesses</strong>.</p>
        </div>
      </Section>
      <CtaBand title="Not sure if your business is a fit? Let's talk." />
    </>
  );
}
