import { notFound } from "next/navigation";
import { BASE_CSS, getTemplate, Package, pageHref, SitePage, themeFontsHref, themeToCss } from "@velolink/core";
import { demoSiteFor } from "../../../../../lib/demo";

type Params = Promise<{ templateId: string; pkg: string; slug?: string[] }>;

// Shows a template + package combination filled with sample content,
// using the same components as published sites.
export default async function PreviewPage({ params }: { params: Params }) {
  const { templateId, pkg, slug } = await params;
  const template = getTemplate(templateId);
  const parsedPkg = Package.safeParse(pkg);
  if (!template || !parsedPkg.success) notFound();
  const site = demoSiteFor(template, parsedPkg.data);
  const page = site.pages.find((p) => p.slug === (slug?.join("/") ?? ""));
  if (!page) notFound();
  const base = `/preview/${template.id}/${parsedPkg.data}`;
  const fonts = themeFontsHref(site.theme);
  return (
    <>
      {/* React 19 hoists these into <head>. */}
      {fonts && <link rel="stylesheet" href={fonts} precedence="default" />}
      <style>{`:root{${themeToCss(site.theme)}}${BASE_CSS}`}</style>
      <SitePage
        site={site}
        page={page}
        asset={(id) => `/assets/${encodeURIComponent(id)}`}
        href={(s) => `${base}${pageHref(s) === "/" ? "" : pageHref(s)}`}
      />
    </>
  );
}
