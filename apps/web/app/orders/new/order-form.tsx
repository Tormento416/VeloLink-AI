"use client";

import { startTransition, useActionState, useState, type FormEvent, type ReactNode } from "react";
import { submitOrder, type SubmitState } from "./actions";

type TemplateOption = { id: string; name: string; description: string };

const CSS = `
.of{--ink:#0f172a;--muted:#475569;--line:#cbd5e1;--bg:#f8fafc;--card:#fff;--accent:#1e5fbf;--bad:#b42318;
  font:16px/1.5 system-ui,sans-serif;color:var(--ink);background:var(--bg);min-height:100vh;padding:32px 16px}
.of form{max-width:760px;margin:0 auto}
.of h1{margin:0 0 4px;font-size:28px}.of .lede{margin:0 0 24px;color:var(--muted)}
.of fieldset{border:1px solid var(--line);border-radius:12px;background:var(--card);padding:20px;margin:0 0 20px}
.of legend{font-weight:700;padding:0 6px}
.of .grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:14px}
.of label{display:block;font-weight:600;font-size:14px}
.of .hint{display:block;font-weight:400;color:var(--muted);font-size:13px}
.of input[type=text],.of input[type=email],.of input[type=tel],.of input[type=url],.of select,.of textarea{
  width:100%;box-sizing:border-box;margin-top:4px;padding:9px 10px;border:1px solid var(--line);border-radius:8px;font:inherit;background:#fff;color:inherit}
.of textarea{min-height:84px;resize:vertical}
.of .check{display:flex;gap:8px;align-items:center;font-weight:600}
.of .err{color:var(--bad);font-size:13px;font-weight:600;margin-top:4px}
.of [aria-invalid=true]{border-color:var(--bad)}
.of .banner{border-radius:10px;padding:12px 14px;margin:0 0 20px;font-weight:600}
.of .banner.bad{background:#fef3f2;color:var(--bad);border:1px solid #fecdca}
.of .banner.ok{background:#ecfdf3;color:#05603a;border:1px solid #abefc6}
.of button{background:var(--accent);color:#fff;border:0;border-radius:10px;padding:12px 22px;font:inherit;font-weight:700;cursor:pointer}
.of button[disabled]{opacity:.6;cursor:wait}
.of .full{grid-column:1/-1}
`;

export function OrderForm({ orderId, templates }: { orderId: string; templates: TemplateOption[] }) {
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitOrder, { status: "idle" });
  const [domainOption, setDomainOption] = useState("existing");
  const [receptionist, setReceptionist] = useState(false);
  const errors = state.status === "error" ? state.errors : {};

  // Submit by hand: a plain form action clears every field, which would wipe the rep's work on an error.
  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    startTransition(() => action(data));
  };

  const field = (name: string, label: ReactNode, opts: { type?: string; required?: boolean; hint?: string; full?: boolean; multiline?: boolean } = {}) => (
    <div className={opts.full ? "full" : undefined}>
      <label htmlFor={name}>
        {label}
        {opts.hint && <span className="hint">{opts.hint}</span>}
      </label>
      {opts.multiline ? (
        <textarea id={name} name={name} required={opts.required} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-err` : undefined} />
      ) : (
        <input id={name} name={name} type={opts.type ?? "text"} required={opts.required} aria-invalid={!!errors[name]} aria-describedby={errors[name] ? `${name}-err` : undefined} />
      )}
      {errors[name] && (
        <div className="err" id={`${name}-err`}>
          {errors[name]}
        </div>
      )}
    </div>
  );

  return (
    <main className="of">
      <style>{CSS}</style>
      <form onSubmit={onSubmit}>
        <h1>New website order</h1>
        <p className="lede">Fill this in with the customer. Sending it opens a build ticket in Zendesk under your name.</p>

        {state.status === "error" && (
          <div className="banner bad" role="alert">
            {state.message}
            {errors.form && <div>{errors.form}</div>}
          </div>
        )}
        {state.status === "sent" && (
          <div className="banner ok" role="status">
            {state.created ? "Order sent." : "This order was already sent."} Zendesk ticket #{state.ticketId}.
          </div>
        )}

        <input type="hidden" name="orderId" value={orderId} />

        <fieldset>
          <legend>Customer</legend>
          <div className="grid">
            {field("customerName", "Name", { required: true })}
            {field("customerEmail", "Email", { type: "email", required: true, hint: "Their review link and receipts go here" })}
            {field("customerPhone", "Phone", { type: "tel" })}
          </div>
        </fieldset>

        <fieldset>
          <legend>Business</legend>
          <div className="grid">
            {field("businessName", "Business name", { required: true })}
            {field("businessPhone", "Business phone", { type: "tel", required: true })}
            {field("businessEmail", "Business email", { type: "email" })}
            {field("industry", "Industry", { required: true, hint: "Plain words, e.g. residential plumbing" })}
            {field("address", "Address", { full: true })}
            {field("serviceArea", "Main area", { hint: "e.g. Austin, TX" })}
            {field("serviceAreas", "Towns served", { hint: "Separate with commas" })}
            {field("tagline", "One-line tagline", { full: true })}
            {field("hours", "Hours", { multiline: true, hint: "One per line: Mon–Fri | 8am–6pm" })}
            {field("social", "Social profiles", { multiline: true, hint: "One https link per line" })}
          </div>
        </fieldset>

        <fieldset>
          <legend>What goes on the site</legend>
          <p className="hint">The AI writes around these facts and never invents prices, licenses or reviews.</p>
          <div className="grid">
            {field("services", "Services", { multiline: true, required: true, hint: "One per line, up to 12" })}
            {field("highlights", "What sets them apart", { multiline: true, hint: "One per line, e.g. Licensed and insured" })}
            {field("story", "Owner's story", { multiline: true, full: true })}
            {field("reviews", "Real reviews", { multiline: true, full: true, hint: "One per line: Name | 5 | What they said" })}
            {field("faqs", "Questions customers ask", { multiline: true, full: true, hint: "One per line: Question? | Answer (answer optional)" })}
            <div>
              <label htmlFor="primaryAction">Main button</label>
              <select id="primaryAction" name="primaryAction" defaultValue="call">
                <option value="call">Call now</option>
                <option value="book">Book online</option>
                <option value="quote">Request a quote</option>
              </select>
            </div>
            {field("bookingUrl", "Booking link", { type: "url", hint: "Only if they book online" })}
            {field("copyNotes", "Notes for the writer", { multiline: true, full: true, hint: "Tone, things to stress or avoid" })}
          </div>
        </fieldset>

        <fieldset>
          <legend>What was sold</legend>
          <div className="grid">
            <div>
              <label htmlFor="package">Package</label>
              <select id="package" name="package" required defaultValue="">
                <option value="" disabled>
                  Choose…
                </option>
                <option value="single_page">Single page</option>
                <option value="five_page">5 page</option>
                <option value="seven_plus_page">7+ page</option>
              </select>
              {errors.package && <div className="err">{errors.package}</div>}
            </div>
            <div>
              <label htmlFor="templateId">Template</label>
              <select id="templateId" name="templateId" required defaultValue="">
                <option value="" disabled>
                  Choose…
                </option>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <span className="hint">
                <a href="/" target="_blank" rel="noreferrer">
                  Preview templates
                </a>
              </span>
            </div>
            {field("amount", "Price (USD)", { required: true, hint: "Total the customer pays, e.g. 1499" })}
            <div className="full">
              <label className="check">
                <input type="checkbox" name="maintenance" /> Monthly maintenance plan
              </label>
              <label className="check">
                <input type="checkbox" name="receptionist" checked={receptionist} onChange={(e) => setReceptionist(e.target.checked)} /> AI receptionist
              </label>
            </div>
            {receptionist && field("voice", "Receptionist voice", { required: true })}
          </div>
        </fieldset>

        <fieldset>
          <legend>Domain</legend>
          <div className="grid">
            <div>
              <label htmlFor="domainOption">Domain</label>
              <select id="domainOption" name="domainOption" value={domainOption} onChange={(e) => setDomainOption(e.target.value)}>
                <option value="existing">They already own one</option>
                <option value="purchase">We buy one for them</option>
              </select>
            </div>
            {field("domainName", domainOption === "purchase" ? "Preferred domain" : "Their domain", {
              required: domainOption === "existing",
              hint: domainOption === "purchase" ? "Optional; we'll check it's free" : "e.g. smithplumbing.com",
            })}
            {domainOption === "purchase" && field("domainFee", "Domain fee (USD)", { hint: "e.g. 25" })}
          </div>
        </fieldset>

        <fieldset>
          <legend>Anything else</legend>
          {field("notes", "Notes for the build team", { multiline: true, full: true })}
        </fieldset>

        <button type="submit" disabled={pending}>
          {pending ? "Sending…" : "Send order"}
        </button>
      </form>
    </main>
  );
}
