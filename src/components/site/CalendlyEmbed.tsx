import { useEffect, useRef, useState } from "react";
import { ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

const WIDGET_SRC = "https://assets.calendly.com/assets/external/widget.js";
const LOAD_TIMEOUT_MS = 12000;

type CalendlyWidget = {
  initInlineWidget: (options: {
    url: string;
    parentElement: HTMLElement;
    prefill?: Record<string, string>;
    utm?: Record<string, string>;
  }) => void;
};

declare global {
  interface Window {
    Calendly?: CalendlyWidget;
  }
}

/**
 * Calendly's widget is a browser-only third-party script, so it is never
 * imported statically — SSR would evaluate an import that only exists in the
 * DOM. It is fetched on demand once the embed mounts.
 */
function loadCalendlyWidget(): Promise<CalendlyWidget | null> {
  if (window.Calendly) return Promise.resolve(window.Calendly);

  return new Promise((resolve) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${WIDGET_SRC}"]`);
    const script = existing ?? document.createElement("script");
    const giveUp = setTimeout(() => resolve(null), LOAD_TIMEOUT_MS);

    const check = () => {
      if (window.Calendly) {
        clearTimeout(giveUp);
        resolve(window.Calendly);
      }
    };

    script.addEventListener("load", check);
    script.addEventListener("error", () => {
      clearTimeout(giveUp);
      resolve(null);
    });

    if (!existing) {
      script.src = WIDGET_SRC;
      script.async = true;
      document.head.appendChild(script);
    }
    check();
  });
}

export function CalendlyEmbed({
  url,
  height = "h-[620px] sm:h-[700px]",
}: {
  url: string;
  height?: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [state, setState] = useState<"loading" | "ready" | "failed">("loading");

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;

    let active = true;

    loadCalendlyWidget().then((calendly) => {
      if (!active) return;
      if (!calendly) {
        setState("failed");
        return;
      }
      try {
        calendly.initInlineWidget({ url, parentElement: host });
        setState("ready");
      } catch {
        setState("failed");
      }
    });

    return () => {
      active = false;
      host.innerHTML = "";
    };
  }, [url]);

  return (
    <div className="relative w-full">
      <div
        ref={hostRef}
        data-calendly-host
        aria-hidden={state !== "ready"}
        className={`w-full overflow-hidden rounded-xl bg-background ${height}`}
      />

      {state === "loading" && (
        <div className="pointer-events-none absolute inset-0 grid place-items-center rounded-xl border border-dashed border-input bg-muted/40">
          <p className="text-sm text-muted-foreground">Loading the booking calendar…</p>
        </div>
      )}

      {state === "failed" && (
        <div className="absolute inset-0 grid place-items-center rounded-xl border border-dashed border-input bg-muted/40 p-6">
          <div className="max-w-sm text-center">
            <p className="text-sm font-medium">The booking calendar didn't load.</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Open it in a new tab to pick a time, or send the form below instead.
            </p>
            <Button asChild variant="hero" size="sm" className="mt-4">
              <a href={url} target="_blank" rel="noopener noreferrer">
                Open booking calendar
                <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
              </a>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
