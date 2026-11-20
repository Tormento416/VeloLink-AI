import { Link } from "@tanstack/react-router";
import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const nav = [
  { to: "/solutions", label: "Solutions" },
  { to: "/industries", label: "Industries" },
  { to: "/demos", label: "Demos" },
  { to: "/packages", label: "Packages" },
  { to: "/contact", label: "Contact" },
] as const;


function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2 font-display text-lg font-bold text-navy-foreground">
      <img src="/favicon.svg" alt="" width={40} height={26} className="h-7 w-auto" />
      <span>VeloLink<span className="text-primary">AI</span></span>
    </Link>
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-0 z-50 border-b border-navy-border bg-navy-deep/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Logo />
        <nav className="hidden items-center gap-4 lg:flex">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              className="text-sm font-medium text-navy-muted transition-colors hover:text-navy-foreground"
              activeProps={{ className: "text-navy-foreground" }}
            >
              {n.label}
            </Link>
          ))}
          <Button asChild variant="hero" size="sm">
            <Link to="/contact">Book an Audit</Link>
          </Button>
        </nav>
        <button
          className="text-navy-foreground lg:hidden"
          aria-label="Toggle menu"
          onClick={() => setOpen(!open)}
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <nav className="flex flex-col gap-1 border-t border-navy-border px-5 py-4 lg:hidden">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 text-navy-foreground hover:bg-navy-foreground/10"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}

export function Footer() {
  return (
    <footer className="bg-navy-deep text-navy-muted">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 md:grid-cols-3">
        <div className="space-y-3">
          <Logo />
          <p className="text-sm">Website revamps from $500, optional add-ons, and website + AI receptionist bundles for local service businesses.</p>
        </div>
        <div className="flex flex-col gap-2 text-sm">
          {nav.map((n) => (
            <Link key={n.to} to={n.to} className="hover:text-navy-foreground">
              {n.label}
            </Link>
          ))}
        </div>
        <div className="space-y-1 text-sm">
          <p className="font-semibold text-navy-foreground">velolinkai.com</p>
          <p>
            Email:{" "}
            <a href="mailto:sales@velolinkai.com" className="hover:text-navy-foreground">
              sales@velolinkai.com
            </a>
          </p>
          <p>
            Phone:{" "}
            <a href="tel:+13524844782" className="hover:text-navy-foreground">
              352-484-4782
            </a>
          </p>
        </div>
      </div>
      <div className="border-t border-navy-border py-5 text-center text-xs">
        © {new Date().getFullYear()} VeloLinkAI. Serving non-medical local businesses.
      </div>
    </footer>
  );
}

export function PageHero({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden bg-hero text-navy-foreground">
      <div className="grid-lines pointer-events-none absolute inset-0" />
      <div className="relative mx-auto max-w-4xl px-5 py-20 text-center md:py-28">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-4 text-4xl font-bold md:text-5xl">{title}</h1>
        {children && <div className="mx-auto mt-5 max-w-2xl text-lg text-navy-muted">{children}</div>}
      </div>
    </section>
  );
}

export function Section({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`px-5 py-20 md:py-24 ${className}`}>
      <div className="mx-auto max-w-6xl">{children}</div>
    </section>
  );
}

export function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mb-12 max-w-2xl">
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-bold md:text-4xl">{title}</h2>
      {sub && <p className="mt-4 text-muted-foreground">{sub}</p>}
    </div>
  );
}

export function CtaBand({ title, label = "Book a Modernization Audit" }: { title: string; label?: string }) {
  return (
    <section className="px-5 pb-20">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl bg-hero px-8 py-14 text-center text-navy-foreground">
        <div className="grid-lines pointer-events-none absolute inset-0" />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold md:text-4xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-xl text-navy-muted">
            We'll review your website and call handling, then show you where leads are slipping through.
          </p>
          <Button asChild variant="hero" size="xl" className="mt-8">
            <Link to="/contact">{label}</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

export const packages = [
  {
    name: "Launch",
    tagline: "Get found and answer every call.",
    site: "One-page lead-capture website",
    ai: "Standard AI receptionist",
    activation: "$1,500–$2,500",
    monthly: "$199–$299",
  },
  {
    name: "Momentum",
    tagline: "Build trust and win better jobs.",
    site: "Five-page authority website",
    ai: "Customized AI receptionist",
    activation: "$3,500–$5,000",
    monthly: "$399–$499",
    featured: true,
  },
  {
    name: "Scale",
    tagline: "Scale across services and locations.",
    site: "Ten-page growth website",
    ai: "Multi-location AI routing",
    activation: "Custom pricing",
    monthly: "$599–$799",
  },
];
