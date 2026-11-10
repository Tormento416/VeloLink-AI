import type { Site, Page } from "../site";
import type { Section } from "../sections/schemas";
import { themeClasses } from "../theme";
import { Icon } from "./icon";
import { SectionView, type AssetResolver } from "./sections";

const SOCIAL_LABELS: Record<Site["business"]["social"][number]["network"], string> = {
  facebook: "Facebook",
  instagram: "Instagram",
  tiktok: "TikTok",
  x: "X",
  youtube: "YouTube",
  linkedin: "LinkedIn",
  nextdoor: "Nextdoor",
  google: "Google",
};

/** Anchor labels used for the nav of a one-page site. */
const ANCHORS: Partial<Record<Section["type"], string>> = {
  services: "Services",
  about: "About",
  reviews: "Reviews",
  gallery: "Our work",
  faq: "FAQ",
  contact: "Contact",
};

export function pageHref(slug: string): string {
  return slug === "" ? "/" : `/${slug}`;
}

type Link = { label: string; href: string; current?: boolean };

function navLinks(site: Site, page: Page, href: (slug: string) => string): Link[] {
  if (site.pages.length > 1) {
    return site.pages.map((p) => ({ label: p.title, href: href(p.slug), current: p.slug === page.slug }));
  }
  const seen = new Set<string>();
  return page.sections.flatMap((s) => {
    const label = ANCHORS[s.type];
    if (!label || seen.has(s.type)) return [];
    seen.add(s.type);
    return [{ label, href: `#${s.type}` }];
  });
}

export function SitePage({
  site,
  page,
  asset,
  href = pageHref,
}: {
  site: Site;
  page: Page;
  asset: AssetResolver;
  /** Builds nav links; previews pass their own base path. */
  href?: (slug: string) => string;
}) {
  const b = site.business;
  const tel = `tel:${b.phone.replace(/[^\d+]/g, "")}`;
  const links = navLinks(site, page, href);
  const brand = b.logo ? <img src={asset(b.logo.assetId)} alt={b.name} className="vl-logo" /> : <span className="vl-brand__name">{b.name}</span>;
  const year = new Date().getFullYear();

  return (
    <div className={`${themeClasses(site.theme)} vl-skin--${site.templateId}`}>
      <a className="vl-skip" href="#main">Skip to content</a>
      <div className="vl-topbar">
        <div className="vl-wrap">
          {b.serviceArea && <span><Icon name="map-pin" size={15} />Serving {b.serviceArea}</span>}
          {b.hours[0] && <span><Icon name="clock" size={15} />{b.hours[0].days} {b.hours[0].time}</span>}
          {b.email && <a href={`mailto:${b.email}`}><Icon name="mail" size={15} />{b.email}</a>}
        </div>
      </div>
      <header className="vl-header">
        <div className="vl-wrap vl-header__inner">
          <a className="vl-brand" href={href("")}>{brand}</a>
          <nav className="vl-nav" aria-label="Main">
            {links.map((l) => (
              <a key={l.href} href={l.href} aria-current={l.current ? "page" : undefined}>{l.label}</a>
            ))}
          </nav>
          <a className="vl-button vl-header__call" href={tel}><Icon name="phone" size={18} />{b.phone}</a>
          <details className="vl-menu">
            <summary aria-label="Menu"><span /><span /><span /></summary>
            <nav aria-label="Mobile">
              {links.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
              <a className="vl-button" href={tel}>Call {b.phone}</a>
            </nav>
          </details>
        </div>
      </header>
      <main id="main">
        {page.sections.map((s, i) => <SectionView key={i} section={s} asset={asset} />)}
      </main>
      <footer className="vl-footer">
        <div className="vl-wrap vl-footer__grid">
          <div>
            <p className="vl-footer__brand">{b.name}</p>
            {b.tagline && <p>{b.tagline}</p>}
            {b.social.length > 0 && (
              <ul className="vl-social">
                {b.social.map((s) => <li key={s.network}><a href={s.href} rel="noopener">{SOCIAL_LABELS[s.network]}</a></li>)}
              </ul>
            )}
          </div>
          {links.length > 0 && (
            <div>
              <p className="vl-footer__title">Explore</p>
              <ul>{links.map((l) => <li key={l.href}><a href={l.href}>{l.label}</a></li>)}</ul>
            </div>
          )}
          <div>
            <p className="vl-footer__title">Contact</p>
            <ul>
              <li><a href={tel}>{b.phone}</a></li>
              {b.email && <li><a href={`mailto:${b.email}`}>{b.email}</a></li>}
              {b.address && <li>{b.address}</li>}
            </ul>
          </div>
          {b.hours.length > 0 && (
            <div>
              <p className="vl-footer__title">Hours</p>
              <ul>{b.hours.map((h, i) => <li key={i}>{h.days}: {h.time}</li>)}</ul>
            </div>
          )}
        </div>
        <div className="vl-wrap vl-footer__base">© {year} {b.name}. All rights reserved.</div>
      </footer>
    </div>
  );
}
