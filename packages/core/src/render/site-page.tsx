import type { Site, Page } from "../site";
import { SectionView, type AssetResolver } from "./sections";

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
    <div style={{ minHeight: "100vh" }}>
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
      <footer>© {site.business.name}</footer>
    </div>
  );
}
