import { useState, type FormEvent, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CalendarClock, CheckCircle2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bookingRequestSchema, contactInquirySchema, intakeRouting } from "@/lib/contact-schema";
import { submitBookingRequest, submitContactInquiry } from "@/lib/contact.functions";

const field = "w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function L({ label, children, wide }: { label: string; children: ReactNode; wide?: boolean }) {
  return <label className={`grid gap-1.5 text-sm font-medium ${wide ? "sm:col-span-2" : ""}`}>{label}{children}</label>;
}

type IntakeState = { status: "idle" | "busy" | "saved" | "error"; message: string };

function useIntake<T>(schema: { safeParse: (value: unknown) => { success: boolean; data?: T } }, submit: (input: T) => Promise<{ id: string; notification: string }>, success: string) {
  const [state, setState] = useState<IntakeState>({ status: "idle", message: "" });
  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const raw = Object.fromEntries(new FormData(form).entries());
    const parsed = schema.safeParse(raw);
    if (!parsed.success || !parsed.data) {
      setState({ status: "error", message: "Please check the highlighted details and try again." });
      return;
    }
    setState({ status: "busy", message: "" });
    try {
      await submit(parsed.data);
      form.reset();
      setState({ status: "saved", message: success });
    } catch {
      setState({ status: "error", message: "We could not save your request. Please try again." });
    }
  }
  return { state, onSubmit };
}

export function ContactInquiryForm({ defaultTopic = "", defaultMessage = "" }: { defaultTopic?: string; defaultMessage?: string }) {
  const submit = useServerFn(submitContactInquiry);
  const { state, onSubmit } = useIntake(contactInquirySchema, (input) => submit({ data: input }), "Inquiry saved. Our sales team will review it and follow up.");
  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border bg-card p-7 shadow-card sm:grid-cols-2" aria-label="Contact inquiry">
      <L label="Name"><input required name="name" maxLength={120} autoComplete="name" className={field} /></L>
      <L label="Business"><input required name="business" maxLength={120} autoComplete="organization" className={field} /></L>
      <L label="Email"><input required type="email" name="email" maxLength={254} autoComplete="email" className={field} /></L>
      <L label="Phone (optional)"><input type="tel" name="phone" maxLength={60} autoComplete="tel" className={field} /></L>
      <L label="Inquiry topic" wide>
        <select required name="topic" defaultValue={defaultTopic} className={field}>
          <option value="" disabled>Select…</option>
          {["Website revamp", "AI receptionist", "Website + AI bundle", "SEO engine", "Demo request", "Something else"].map((topic) => <option key={topic}>{topic}</option>)}
        </select>
      </L>
      <L label="Message" wide><textarea key={defaultMessage} required name="message" rows={6} maxLength={4000} defaultValue={defaultMessage} className={field} /></L>
      <div className="sm:col-span-2">
        <Button type="submit" variant="hero" size="xl" className="w-full" disabled={state.status === "busy"}>{state.status === "busy" ? "Saving…" : "Send inquiry"}</Button>
        <IntakeNote state={state} />
      </div>
    </form>
  );
}

export function BookingRequestForm() {
  const submit = useServerFn(submitBookingRequest);
  const { state, onSubmit } = useIntake(bookingRequestSchema, (input) => submit({ data: input }), "Booking request saved. It is awaiting confirmation — no calendar event has been placed yet.");
  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border bg-card p-7 shadow-card sm:grid-cols-2" aria-label="Meeting request">
      <L label="Name"><input required name="name" maxLength={120} autoComplete="name" className={field} /></L>
      <L label="Business"><input required name="business" maxLength={120} autoComplete="organization" className={field} /></L>
      <L label="Email"><input required type="email" name="email" maxLength={254} autoComplete="email" className={field} /></L>
      <L label="Phone (optional)"><input type="tel" name="phone" maxLength={60} autoComplete="tel" className={field} /></L>
      <L label="Requested date/time or preferred windows" wide><textarea required name="requested_window" rows={3} maxLength={500} placeholder="Example: Tuesday afternoon or Thursday 10–11 AM" className={field} /></L>
      <L label="Timezone">
        <select required name="timezone" defaultValue="America/New_York" className={field}>
          {["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Other"].map((zone) => <option key={zone}>{zone}</option>)}
        </select>
      </L>
      <L label="Short reason"><input required name="reason" maxLength={4000} placeholder="Website review, AI receptionist, or both" className={field} /></L>
      <div className="sm:col-span-2">
        <Button type="submit" variant="hero" size="xl" className="w-full" disabled={state.status === "busy"}>{state.status === "busy" ? "Saving…" : "Request meeting"}</Button>
        <IntakeNote state={state} />
      </div>
    </form>
  );
}

function IntakeNote({ state }: { state: IntakeState }) {
  if (state.status === "idle" || state.status === "busy") return null;
  return <p role={state.status === "error" ? "alert" : "status"} className={`mt-3 text-center text-sm ${state.status === "error" ? "text-destructive" : "text-muted-foreground"}`}>{state.message}</p>;
}

export function ContactRoutingCard() {
  return (
    <div className="space-y-3 rounded-2xl border bg-card p-7 text-sm shadow-card">
      <p className="flex items-center gap-2"><Mail className="h-4 w-4 text-accent" />Email: {intakeRouting.publicEmail}</p>
      <p className="flex items-center gap-2"><CalendarClock className="h-4 w-4 text-accent" />Meeting requests are reviewed before a calendar invitation is sent.</p>
      <p className="flex items-center gap-2 text-muted-foreground"><CheckCircle2 className="h-4 w-4 text-primary" />Your details stay private.</p>
    </div>
  );
}
