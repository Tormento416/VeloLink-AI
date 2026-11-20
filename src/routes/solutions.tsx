import { createFileRoute } from "@tanstack/react-router";
import { UserPlus, MessageCircleQuestion, ClipboardList, CalendarCheck, Siren, UserRound, BarChart3, FileText, Calendar, Lock, Route as RouteIcon, Check } from "lucide-react";
import { PageHero, Section, SectionHead, CtaBand } from "@/components/site/Layout";

export const Route = createFileRoute("/solutions")({
  head: () => ({
    meta: [
      { title: "Solutions — Website Engines & AI Receptionist | VeloLinkAI" },
      { name: "description", content: "Standalone website revamps from $500, optional extra pages, AI receptionists, SEO engines, video backgrounds, and image slideshows." },
      { property: "og:title", content: "VeloLinkAI Solutions" },
      { property: "og:description", content: "Conversion websites and a 24/7 AI receptionist, connected to your calendar and lead routing." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Solutions,
});

const engines = [
  { name: "One-page lead capture", text: "A focused page that gets visitors to call or request a quote.", items: ["Clear offer and service area", "Click-to-call and quote form", "Mobile-first and fast"] },
  { name: "Five-page authority website", text: "Room to explain services and build trust before the first call.", items: ["Home, services, about, reviews area, contact", "Local search foundations", "Booking built in"] },
  { name: "Ten-page growth framework", text: "Dedicated pages for each service or location you want to grow.", items: ["Service and location pages", "Multi-location structure", "Built to expand over time"] },
];
const ai = [
  { icon: UserPlus, title: "Lead capture", text: "Collects name, contact details, and what the caller needs." },
  { icon: MessageCircleQuestion, title: "FAQ responses", text: "Answers hours, service areas, and common questions you approve." },
  { icon: ClipboardList, title: "Quote intake", text: "Gathers the job details you need to price the work." },
  { icon: CalendarCheck, title: "Appointment booking", text: "Books into open slots on your calendar." },
  { icon: Siren, title: "Urgent-call routing", text: "Sends emergencies to the right person right away." },
  { icon: UserRound, title: "Safe human handoff", text: "When it doesn't know the answer, it says so and passes the call to your team." },
];
const integrations = [
  { icon: BarChart3, title: "Analytics" },
  { icon: FileText, title: "Contact forms" },
  { icon: Calendar, title: "Calendars" },
  { icon: Lock, title: "SSL security" },
  { icon: RouteIcon, title: "Lead routing" },
];

function Solutions() {
  return (
    <>
      <PageHero eyebrow="Solutions" title="A website that converts. A phone line that never sleeps.">
        Start with a standalone website revamp from $500. Add extra pages, an AI receptionist, an SEO engine, video backgrounds, or image slideshows as your business needs them.
      </PageHero>
      <Section>
        <SectionHead eyebrow="Website engines" title="Choose the size that fits your business." />
        <div className="grid gap-5 md:grid-cols-3">
          {engines.map((e) => (
            <div key={e.name} className="rounded-xl border bg-card p-6 shadow-card">
              <h3 className="text-lg font-semibold">{e.name}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{e.text}</p>
              <ul className="mt-5 space-y-2 text-sm">
                {e.items.map((i) => <li key={i} className="flex gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-accent" />{i}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </Section>
      <Section className="bg-navy text-navy-foreground">
        <div className="mb-12 max-w-2xl">
          <p className="eyebrow">AI receptionist</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">Answers every call, day or night.</h2>
          <p className="mt-4 text-navy-muted">A natural, conversational receptionist trained on your business — and honest about what it doesn't know.</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {ai.map((a) => (
            <div key={a.title} className="rounded-xl border border-navy-border bg-navy-deep p-6">
              <a.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-semibold">{a.title}</h3>
              <p className="mt-2 text-sm text-navy-muted">{a.text}</p>
            </div>
          ))}
        </div>
      </Section>
      <Section>
        <SectionHead eyebrow="Integrations" title="Connected to how you already work." />
        <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
          {integrations.map((i) => (
            <div key={i.title} className="flex flex-col items-center gap-3 rounded-xl border bg-card p-6 text-center shadow-card">
              <i.icon className="h-6 w-6 text-accent" />
              <span className="text-sm font-semibold">{i.title}</span>
            </div>
          ))}
        </div>
      </Section>
      <CtaBand title="See what this would look like for your business." />
    </>
  );
}
