import { useState, type FormEvent, type ReactNode } from "react";
import { useServerFn } from "@tanstack/react-start";
import { CheckCircle2, FileText, Globe, Headphones, LockKeyhole } from "lucide-react";
import { Button } from "@/components/ui/button";
import { repBuilderSchema } from "@/lib/builder-schema";
import { submitRepQuote } from "@/lib/builder.functions";
import { websiteAddOns } from "@/lib/offers";

const field = "w-full min-w-0 rounded-md border border-input bg-background px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ring";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return <label className="grid min-w-0 gap-2 text-sm font-medium">{label}{children}</label>;
}

export function WebsiteConfigurator({ onSaved }: { onSaved?: () => void }) {
  const [scope, setScope] = useState<"single" | "multi">("single");
  const [pageCount, setPageCount] = useState(1);
  const [pageNames, setPageNames] = useState("Home");
  const [template, setTemplate] = useState("service");
  const [scheme, setScheme] = useState("navy-teal");
  const [ai, setAi] = useState(false);
  const [tier, setTier] = useState("Base");
  const [payment, setPayment] = useState("one-time");
  const [options, setOptions] = useState<string[]>([]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);
  const repSubmit = useServerFn(submitRepQuote);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const get = (name: string) => String(form.get(name) ?? "");
    const common = {
      business_name: get("business_name"), existing_url: get("existing_url"), description: get("description"),
      industry: get("industry"), service_area: get("service_area"), contact_name: get("contact_name"),
      contact_email: get("contact_email"), contact_phone: get("contact_phone"), site_info: get("site_info"),
      template, color_scheme: scheme,
      customer_address: get("customer_address"), customer_notes: get("customer_notes"), selected_options: options,
    };
    const input = {
      ...common, scope, page_count: pageCount, pages: pageNames.split("\n").map((s) => s.trim()).filter(Boolean),
      payment_preference: payment,
      vapi: { enabled: ai, model: get("model"), voice_tier: tier, monthly_minutes: get("monthly_minutes") === "" ? null : Number(get("monthly_minutes")) },
    };
    setError("");
    setBusy(true);
    try {
      const result = await repSubmit({ data: repBuilderSchema.parse(input) });
      setSaved(result.id);
      onSaved?.();
    } catch (err) {
      setError(err && typeof err === "object" && "issues" in err
        ? "Please check your details, website URL, and page list. All page names must match the count."
        : "Unable to save your quote request. Please try again or contact VeloLinkAI.");
    } finally { setBusy(false); }
  }

  if (saved) return <section className="mx-auto max-w-3xl py-12" aria-live="polite">
    <CheckCircle2 className="h-10 w-10 text-accent" />
    <h2 className="mt-5 text-2xl font-semibold">Quote request saved</h2>
    <p className="mt-3 text-muted-foreground">Your configuration is awaiting confirmed pricing. No payment has been taken and no website or receptionist has been provisioned.</p>
    <p className="mt-4 break-all text-sm">Reference: {saved}</p>
    <Button variant="outline" className="mt-6" onClick={() => setSaved(null)}>Create another request</Button>
  </section>;

  return <form onSubmit={submit} className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_320px]">
    <div className="min-w-0 space-y-9">
      <fieldset className="space-y-5 border-b pb-8">
        <legend className="mb-5 flex items-center gap-3 text-xl font-semibold"><Globe className="text-accent" />Business & website</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Business / site name"><input name="business_name" required maxLength={120} className={field} /></Field>
          <Field label="Existing website URL"><input name="existing_url" type="url" placeholder="https://yourbusiness.com" maxLength={500} className={field} /></Field>
        </div>
        <Field label="Business description"><textarea name="description" required rows={4} maxLength={4000} className={field} /></Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Industry"><input name="industry" required maxLength={120} className={field} /></Field>
          <Field label="Service area"><input name="service_area" maxLength={500} className={field} /></Field>
        </div>
        <Field label="Site information & requirements"><textarea name="site_info" rows={4} maxLength={4000} className={field} /></Field>
      </fieldset>

      <fieldset className="space-y-5 border-b pb-8">
        <legend className="mb-5 text-xl font-semibold">Customer profile</legend>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Contact name"><input name="contact_name" required maxLength={120} autoComplete="name" className={field} /></Field>
          <Field label="Contact email"><input name="contact_email" type="email" required maxLength={254} autoComplete="email" className={field} /></Field>
          <Field label="Contact phone"><input name="contact_phone" type="tel" maxLength={60} autoComplete="tel" className={field} /></Field>
        </div>
        <Field label="Customer address"><textarea name="customer_address" rows={2} maxLength={500} className={field} /></Field>
        <Field label="Customer notes"><textarea name="customer_notes" rows={3} maxLength={4000} className={field} /></Field>
      </fieldset>

      <fieldset className="space-y-5 border-b pb-8">
        <legend className="mb-5 text-xl font-semibold">Design direction</legend>
        <Field label="Template"><select value={template} onChange={(e) => setTemplate(e.target.value)} className={field}>
          <option value="service">Local service & trades</option><option value="professional">Professional office</option><option value="creative">Creative & community</option>
        </select></Field>
        <Field label="Color scheme"><select value={scheme} onChange={(e) => setScheme(e.target.value)} className={field}>
          <option value="navy-teal">Navy & teal</option><option value="charcoal-ivory">Charcoal & ivory</option><option value="forest-light">Forest & light</option>
        </select></Field>
      </fieldset>

      <fieldset className="space-y-5 border-b pb-8">
        <legend className="mb-5 flex items-center gap-3 text-xl font-semibold"><FileText className="text-accent" />Page scope</legend>
        <Field label="Page scope"><select value={scope} onChange={(e) => {
          const multi = e.target.value === "multi";
          setScope(multi ? "multi" : "single"); setPageCount(multi ? 2 : 1); setPageNames(multi ? "Home\nServices" : "Home");
        }} className={field}><option value="single">Single page</option><option value="multi">Multi-page website</option></select></Field>
        {scope === "multi" && <Field label="Number of pages"><input type="number" min={2} max={50} required value={pageCount} onChange={(e) => setPageCount(Number(e.target.value))} className={field} /></Field>}
        <Field label="Page names (one per line)"><textarea value={pageNames} onChange={(e) => setPageNames(e.target.value)} required rows={4} className={field} /></Field>
      </fieldset>

      <fieldset className="space-y-5 border-b pb-8">
        <legend className="mb-5 flex items-center gap-3 text-xl font-semibold"><Headphones className="text-accent" />Vapi AI receptionist</legend>
        <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={ai} onChange={(e) => setAi(e.target.checked)} className="h-4 w-4 accent-accent" />Include AI receptionist in quote</label>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Voice tier"><select value={tier} onChange={(e) => setTier(e.target.value)} disabled={!ai} className={field}><option>Base</option><option>Premium</option></select></Field>
          <Field label="Monthly minutes allowance"><input name="monthly_minutes" type="number" min={0} max={1000000} disabled={!ai} className={field} /></Field>
          <Field label="Requested model"><input name="model" maxLength={120} disabled={!ai} className={field} /></Field>
        </div>
        <p className="text-sm text-muted-foreground">Provisioned after confirmation. Voice, model, and minutes are quote options, not active services.</p>
      </fieldset>

      <fieldset className="space-y-4 border-b pb-8"><legend className="mb-5 text-xl font-semibold">Additional options</legend>{websiteAddOns.filter((option) => ["seo-engine", "video-backgrounds", "image-slideshows"].includes(option.id)).map((option) => <label key={option.id} className="flex items-center gap-3 text-sm"><input type="checkbox" checked={options.includes(option.id)} onChange={(e) => setOptions((current) => e.target.checked ? [...current, option.id] : current.filter((id) => id !== option.id))} className="h-4 w-4 accent-accent" />{option.name}</label>)}</fieldset>
      <Field label="Payment preference"><select value={payment} onChange={(e) => setPayment(e.target.value)} className={field}><option value="one-time">One-time</option><option value="subscription">Subscription</option></select></Field>
    </div>

    <aside className="min-w-0 rounded-lg border bg-navy p-6 text-navy-foreground lg:sticky lg:top-24" aria-label="Quote summary">
      <p className="text-xs font-semibold uppercase text-accent">Quote summary</p>
      <h2 className="mt-3 text-xl font-semibold">Website configuration</h2>
      <dl className="mt-6 space-y-4 text-sm">
        <Summary label="Pages" value={`${pageCount} · ${scope === "multi" ? "Multi-page" : "Single page"}`} />
        <Summary label="Template" value={template === "service" ? "Local service & trades" : template === "professional" ? "Professional office" : "Creative & community"} />
        <Summary label="Colors" value={scheme.replaceAll("-", " ")} />
        <Summary label="Receptionist" value={ai ? `${tier} · after confirmation` : "Not included"} />
        <Summary label="Additional options" value={websiteAddOns.filter((item) => options.includes(item.id)).map((item) => item.name).join(", ") || "None"} />
        <Summary label="Payment preference" value={payment === "subscription" ? "Subscription" : "One-time"} />
      </dl>
      <div className="mt-6 border-t border-navy-border pt-5"><p className="font-semibold">Pricing pending confirmation</p><p className="mt-2 text-sm text-navy-muted">Final scope and pricing must be confirmed by VeloLinkAI before checkout.</p></div>
      <p className="mt-5 flex items-center gap-2 text-sm text-navy-muted"><LockKeyhole className="h-4 w-4 shrink-0" />Quote only · no payment taken</p>
      {error && <p role="alert" className="mt-5 rounded-md bg-background p-3 text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={busy} size="lg" className="mt-6 w-full bg-accent text-accent-foreground hover:bg-accent/90">{busy ? "Saving…" : "Request confirmed pricing"}</Button>
    </aside>
  </form>;
}

function Summary({ label, value }: { label: string; value: string }) {
  return <div className="grid gap-1"><dt className="text-navy-muted">{label}</dt><dd className="break-words font-medium capitalize">{value}</dd></div>;
}