import { renderToStaticMarkup } from "react-dom/server";
import type { Site } from "../site";
import { themeToCss } from "../theme";
import type { AssetResolver } from "./sections";
import { SitePage } from "./site-page";
import { BASE_CSS } from "./styles";

export { pageHref } from "./site-page";

/** Renders one page of a site as a complete static HTML document. */
export function renderPageHtml(site: Site, slug: string, asset: AssetResolver): string {
  const page = site.pages.find((p) => p.slug === slug);
  if (!page) throw new Error(`Page "${slug}" not found in site`);
  const title = page.slug === "" ? site.business.name : `${page.title} | ${site.business.name}`;
  const body = renderToStaticMarkup(<SitePage site={site} page={page} asset={asset} />);
  const head = renderToStaticMarkup(
    <>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <title>{title}</title>
    </>,
  );
  return `<!doctype html><html lang="en"><head>${head}<style>:root{${themeToCss(site.theme)}}${BASE_CSS}</style></head><body>${body}</body></html>`;
}
