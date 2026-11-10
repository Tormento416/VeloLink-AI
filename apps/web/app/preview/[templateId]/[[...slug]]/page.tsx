import { notFound } from "next/navigation";
import { BASE_CSS, getTemplate, SitePage, themeToCss } from "@velolink/core";
import { demoSiteFor } from "../../../../lib/demo";

type Params = Promise<{ templateId: string; slug?: string[] }>;

// Shows a template filled with sample content, using the same components as published sites.
export default async function PreviewPage({ params }: { params: Params }) {
  const { templateId, slug } = await params;
  const template = getTemplate(templateId);
  if (!template) notFound();
  const site = demoSiteFor(template);
  const page = site.pages.find((p) => p.slug === (slug?.join("/") ?? ""));
  if (!page) notFound();
  return (
    <>
      <style>{`:root{${themeToCss(site.theme)}}${BASE_CSS}`}</style>
      <SitePage site={site} page={page} asset={(id) => `/assets/${encodeURIComponent(id)}`} />
    </>
  );
}
