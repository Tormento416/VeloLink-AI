import { createFileRoute, Link } from "@tanstack/react-router";
import {
  PhoneMissed, Smartphone, Clock, Globe, Bot, CalendarCheck, Wrench,
  Zap, Briefcase, Hammer, ArrowRight, Check, PhoneIncoming,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section, SectionHead, CtaBand, packages } from "@/components/site/Layout";
import { StandaloneOffer } from "@/components/site/StandaloneOffer";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VeloLinkAI — Websites and AI Receptionists for Local Businesses" },
      { name: "description", content: "One-page website revamps starting at $500, with optional AI receptionists, SEO, extra pages, and visual upgrades for local businesses." },
      { property: "og:title", content: "VeloLinkAI — Your website and phone line, working after hours" },
      { property: "og:description", content: "Start with a standalone website revamp from $500, add what you need, or choose a website + AI bundle." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

const problems = [
  { icon: PhoneMissed, title: "Missed calls", text: "After-hours and busy-day calls go to voicemail — and callers move to the next business." },
  { icon: Smartphone, title: "Weak mobile experience", text: "Most customers find you on a phone. A slow, dated site makes them leave." },
  { icon: Clock, title: "Slow follow-up", text: "Leads sit in an inbox for hours. By the time you reply, the job is gone." },
];
const solutions = [
  { icon: Globe, title: "Conversion website", text: "Fast, mobile-first pages built to turn visitors into calls and requests." },
  { icon: Bot, title: "AI receptionist", text: "Answers 24/7, captures details, and responds to common questions." },
  { icon: CalendarCheck, title: "Automated booking", text: "Callers and visitors book directly into your calendar." },
  { icon: Wrench, title: "Ongoing maintenance", text: "Updates, monitoring, and tuning so everything keeps working." },
];
const industries = [
  { icon: Zap, title: "Emergency Trades", text: "Plumbing, electrical, HVAC, locksmiths" },
  { icon: Briefcase, title: "Professional Services", text: "Legal, accounting, consulting" },
  { icon: Hammer, title: "Community Contractors", text: "Landscaping, remodeling, roofing" },
];
const steps = [
  { n: "01", title: "Diagnose", text: "Review your site, calls, and lead flow." },
  { n: "02", title: "Build", text: "Design and build your new website." },
  { n: "03", title: "Automate", text: "Train your AI receptionist and connect booking." },
  { n: "04", title: "Launch", text: "Go live, monitor, and refine." },
];

function Home() {
  return (
    <>
      <section className="relative overflow-hidden bg-hero text-navy-foreground">
        <div className="grid-lines pointer-events-none absolute inset-0" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 md:grid-cols-[1.2fr_1fr] md:py-28">
          <div>
            <p className="eyebrow">Websites + 24/7 AI receptionist</p>
            <h1 className="mt-5 text-4xl font-bold leading-tight md:text-6xl">
              Your website and phone line should keep working after you stop.
            </h1>
            <p className="mt-6 max-w-xl text-lg text-navy-muted">
              VeloLinkAI gives local businesses conversion-focused websites starting at $500, with optional 24/7 AI receptionists, SEO, and other upgrades. Buy separately or choose a complete bundle.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild variant="hero" size="xl"><Link to="/contact">Book a Modernization Audit</Link></Button>
              <Button asChild variant="ghostDark" size="xl"><Link to="/demos">AI Web Builder <ArrowRight /></Link></Button>
            </div>
          </div>
          <CallCard />
        </div>
      </section>

      <Section>
        <SectionHead eyebrow="The problem" title="Stop losing opportunities because your website is outdated or nobody answered the phone." />
        <div className="grid gap-5 md:grid-cols-3">
          {problems.map((p) => (
            <div key={p.title} className="rounded-xl border bg-card p-6 shadow-card">
              <p.icon className="h-6 w-6 text-destructive" />
              <h3 className="mt-4 text-lg font-semibold">{p.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{p.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section className="bg-navy text-navy-foreground">
        <div className="mb-12 max-w-2xl">
          <p className="eyebrow">The solution</p>
          <h2 className="mt-3 text-3xl font-bold md:text-4xl">One system that catches every lead.</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {solutions.map((s) => (
            <div key={s.title} className="rounded-xl border border-navy-border bg-navy-deep p-6">
              <s.icon className="h-6 w-6 text-primary" />
              <h3 className="mt-4 font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-navy-muted">{s.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <SectionHead eyebrow="Who we serve" title="Built for local service businesses." />
        <div className="grid gap-5 md:grid-cols-3">
          {industries.map((i) => (
            <Link key={i.title} to="/industries" className="group rounded-xl border bg-card p-6 shadow-card transition hover:-translate-y-1">
              <i.icon className="h-6 w-6 text-accent" />
              <h3 className="mt-4 text-lg font-semibold">{i.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{i.text}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold">Learn more <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" /></span>
            </Link>
          ))}
        </div>
      </Section>

      <Section className="bg-muted">
        <SectionHead eyebrow="Process" title="Four steps to a modern front door." />
        <div className="grid gap-6 md:grid-cols-4">
          {steps.map((s) => (
            <div key={s.n} className="border-t-2 border-primary pt-5">
              <span className="font-display text-sm font-semibold text-muted-foreground">{s.n}</span>
              <h3 className="mt-2 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section>
        <StandaloneOffer />
      </Section>

      <Section className="bg-muted">
        <SectionHead eyebrow="Website + AI bundles" title="Prefer a complete package?" sub="Launch, Momentum, and Scale combine a website, AI receptionist, and ongoing maintenance. Final pricing depends on integrations, call volume, locations, and scope." />
        <div className="grid gap-5 md:grid-cols-3">
          {packages.map((p) => (
            <div key={p.name} className={`rounded-xl border p-6 ${p.featured ? "border-primary bg-navy text-navy-foreground shadow-glow" : "bg-card shadow-card"}`}>
              <h3 className="text-xl font-semibold">{p.name}</h3>
              <p className={`mt-1 text-sm ${p.featured ? "text-navy-muted" : "text-muted-foreground"}`}>{p.site} + {p.ai.toLowerCase()}</p>
              <p className="mt-5 font-display text-2xl font-bold">{p.monthly}<span className="text-sm font-medium">/mo</span></p>
            </div>
          ))}
        </div>
        <Button asChild variant="outline" className="mt-8"><Link to="/packages">Compare packages <ArrowRight /></Link></Button>
      </Section>

      <CtaBand title="Find out where your leads are slipping away." />
    </>
  );
}

function CallCard() {
  return (
    <div className="rounded-2xl border border-navy-border bg-navy/80 p-6 shadow-glow backdrop-blur">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-accent text-accent-foreground"><PhoneIncoming className="h-5 w-5" /></span>
        <div>
          <p className="text-sm font-semibold">Incoming call · 9:42 PM</p>
          <p className="text-xs text-navy-muted">AI receptionist answering</p>
        </div>
      </div>
      <div className="mt-5 space-y-3 text-sm">
        <p className="rounded-lg bg-navy-deep p-3 text-navy-muted">"My water heater is leaking. Can someone come tomorrow?"</p>
        <p className="ml-6 rounded-lg bg-primary/15 p-3">"I can help. Let me get your address and book the first opening."</p>
      </div>
      <ul className="mt-5 space-y-2 border-t border-navy-border pt-4 text-sm">
        {["Lead captured", "Quote details gathered", "Appointment booked"].map((t) => (
          <li key={t} className="flex items-center gap-2"><Check className="h-4 w-4 text-primary" />{t}</li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-navy-muted">Example conversation</p>
    </div>
  );
}
