import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/start")({
  beforeLoad: () => { throw redirect({ to: "/builder", replace: true }); },
  head: () => ({ meta: [
    { title: "AI Web Builder — Rep Access | VeloLinkAI" },
    { name: "description", content: "Sign in as an authorized VeloLinkAI representative to access the AI Web Builder." },
    { property: "og:title", content: "VeloLinkAI AI Web Builder" },
    { property: "og:description", content: "AI Web Builder access is reserved for authorized VeloLinkAI representatives." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }),
});