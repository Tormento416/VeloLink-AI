import type { Site, Page } from "../site";
import { themeClasses } from "../theme";
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

export function pageHref(slug: string): string {
  return slug === "" ? "/" : `/${slug}`;
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
  return (
    <div className={themeClasses(site.theme)}>
      {site.pages.length > 1 && (
        <nav className="vl-nav">
          <strong>{site.business.name}</strong>
          {site.pages.map((p) => (
            <a key={p.slug} href={href(p.slug)} aria-current={p.slug === page.slug ? "page" : undefined}>
              {p.title}
            </a>
          ))}
        </nav>
      )}
      <main>
        {page.sections.map((s, i) => <SectionView key={i} section={s} asset={asset} />)}
      </main>
      <footer>
        {site.business.social.length > 0 && (
          <ul className="vl-social">
            {site.business.social.map((s) => (
              <li key={s.network}><a href={s.href} rel="noopener">{SOCIAL_LABELS[s.network]}</a></li>
            ))}
          </ul>
        )}
        <p>© {site.business.name}</p>
      </footer>
    </div>
  );
}
