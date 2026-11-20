import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck } from "lucide-react";
import { CalendlyEmbed } from "@/components/site/CalendlyEmbed";
import { PageHero, Section } from "@/components/site/Layout";
import { BookingRequestForm, ContactInquiryForm, ContactRoutingCard } from "@/components/site/PublicIntakeForms";
import { BOOKING_URL } from "@/lib/booking";
import { demoRequest, findDemo, normalizeDemo } from "@/lib/demos";
import { bundleRequest, normalizeBundle } from "@/lib/offers";

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): { bundle?: string; package?: string; demo?: string } => {
    const bundle = search["bundle"];
    const packageName = search["package"];
    const demo = normalizeDemo(search["demo"]);
    return {
      ...(typeof bundle === "string" ? { bundle: normalizeBundle(bundle).join(",") } : {}),
      ...(typeof packageName === "string" && ["Launch", "Momentum", "Scale"].includes(packageName) ? { package: packageName } : {}),
      ...(demo ? { demo } : {}),
    };
  },
  head: () => ({
    meta: [
      { title: "Contact — Book a Modernization Audit | VeloLinkAI" },
      { name: "description", content: "Email sales@velolinkai.com, send an inquiry, or request a modernization audit meeting for your local business." },
      { property: "og:title", content: "Contact VeloLinkAI" },
      { property: "og:description", content: "Send a private inquiry or request a modernization audit meeting." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Contact,
});

function Contact() {
  const search = Route.useSearch();
  const demo = search.demo ? findDemo(search.demo) : undefined;
  const bundleSelected = search.bundle !== undefined || search.package !== undefined;
  const requestText = demo
    ? demoRequest(demo)
    : bundleSelected
      ? bundleRequest(normalizeBundle(search.bundle), search.package)
      : "";
  const defaultTopic = demo ? "Demo request" : bundleSelected ? "Website + AI bundle" : "";
  return (
    <>
      <PageHero eyebrow="Contact" title="Let's find the leaks in your lead flow.">
        Email sales@velolinkai.com, send a private inquiry, or request a meeting. We'll review your website and call handling and share what we find.
      </PageHero>
      <Section>
        <div className="grid gap-8 lg:grid-cols-[1.45fr_1fr]">
          <div className="rounded-2xl border bg-card p-6 shadow-card sm:p-7">
            <div className="flex items-start gap-3">
              <CalendarCheck className="mt-1 h-6 w-6 shrink-0 text-primary" />
              <div>
                <h2 className="text-xl font-bold">Book a Modernization Audit</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Pick a time that works for you — the calendar opens our availability.
                </p>
              </div>
            </div>
            <div className="mt-6">
              <CalendlyEmbed url={BOOKING_URL} />
            </div>
          </div>
          <div className="space-y-5">
            <div className="space-y-3 rounded-2xl bg-navy p-7 text-navy-foreground">
              <h3 className="text-lg font-bold">What the audit covers</h3>
              <ul className="space-y-2 text-sm text-navy-muted">
                <li>Your current website</li>
                <li>How calls and messages are handled today</li>
                <li>Where leads are slipping through</li>
              </ul>
            </div>
            <ContactRoutingCard />
            <div className="space-y-2 rounded-2xl border bg-card p-7 text-sm shadow-card">
              <p className="font-semibold">Now booking in</p>
              <p className="text-muted-foreground">Charlotte · Greensboro · High Point · Raleigh · Fayetteville, NC</p>
            </div>
          </div>
        </div>
      </Section>
      <Section className="pt-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <h2 className="text-2xl font-bold">Prefer to send it in writing?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Your inquiry is stored privately and routed to the VeloLinkAI sales team.
            </p>
          </div>
          <ContactInquiryForm defaultTopic={defaultTopic} defaultMessage={requestText} />
        </div>
      </Section>
      <Section className="bg-muted pt-16">
        <div className="mx-auto max-w-3xl">
          <div className="mb-6">
            <p className="eyebrow">Meeting request</p>
            <h2 className="mt-3 text-2xl font-bold">Need a specific time reviewed first?</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Send your preferred window. Requests are reviewed and assigned before confirmation; no calendar event is placed automatically.
            </p>
          </div>
          <BookingRequestForm />
        </div>
      </Section>
    </>
  );
}
