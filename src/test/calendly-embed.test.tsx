import { act, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { CalendlyEmbed } from "@/components/site/CalendlyEmbed";
import { BOOKING_URL } from "@/lib/booking";

describe("CalendlyEmbed", () => {
  afterEach(() => {
    delete window.Calendly;
    vi.useRealTimers();
  });

  it("opens the VeloLinkAI calendar in the embed host", async () => {
    const initInlineWidget = vi.fn();
    window.Calendly = { initInlineWidget };

    const { container } = render(<CalendlyEmbed url={BOOKING_URL} />);
    await act(async () => {});

    expect(initInlineWidget).toHaveBeenCalledTimes(1);
    const options = vi.mocked(initInlineWidget).mock.calls[0]?.[0];
    expect(options?.url).toBe("https://calendly.com/velolinkai");
    expect(options?.parentElement).toBe(container.querySelector("[data-calendly-host]"));
  });

  it("offers the calendar link directly when the widget never loads", async () => {
    vi.useFakeTimers();

    render(<CalendlyEmbed url={BOOKING_URL} />);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(12000);
    });

    const link = screen.getByRole("link", { name: /open booking calendar/i });
    expect(link).toHaveAttribute("href", BOOKING_URL);
  });
});
