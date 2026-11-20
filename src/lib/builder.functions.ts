import { createMiddleware, createServerFn } from "@tanstack/react-start";
import { repBuilderSchema, quoteHandoff } from "./builder-schema";

export const requireRep = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const { verifiedRep } = await import("./rep-auth.server");
  const rep = await verifiedRep();
  if (!rep) throw new Error("Rep access denied. Sign in with an authorized, verified account.");
  return next({ context: { rep } });
});

export const getRepAccess = createServerFn({ method: "POST" }).handler(async () => {
  const { verifiedRep } = await import("./rep-auth.server");
  const rep = await verifiedRep();
  return rep ? { allowed: true, email: rep.email } : { allowed: false, email: null };
});

export const submitRepQuote = createServerFn({ method: "POST" })
  .middleware([requireRep])
  .inputValidator((input: unknown) => repBuilderSchema.parse(input))
  .handler(async ({ data, context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: identity, error: identityError } = await supabaseAdmin.from("rep_identities").upsert({ workos_user_id: context.rep.userId, email: context.rep.email }, { onConflict: "workos_user_id" }).select("id").single();
    if (identityError || !identity) throw new Error("Your request could not be saved. Please try again.");
    const { data: order, error } = await supabaseAdmin.from("builder_orders").insert({
      source: "rep", rep_user_id: identity.id, rep_email: context.rep.email,
      business_name: data.business_name, contact_email: data.contact_email,
      page_count: data.page_count, payment_preference: data.payment_preference, configuration: data,
    }).select("id").single();
    if (error || !order) throw new Error("Your request could not be saved. Please try again.");
    return { id: order.id, ...quoteHandoff };
  });

export const listRepQuotes = createServerFn({ method: "POST" })
  .middleware([requireRep])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: identity, error: identityError } = await supabaseAdmin.from("rep_identities").select("id").eq("workos_user_id", context.rep.userId).maybeSingle();
    if (identityError) throw new Error("Quote requests could not be loaded. Please retry.");
    if (!identity) return [];
    const { data, error } = await supabaseAdmin.from("builder_orders")
      .select("id, created_at, business_name, contact_email, page_count, payment_preference, status, pricing_status, configuration")
      .eq("source", "rep").eq("rep_user_id", identity.id)
      .order("created_at", { ascending: false }).limit(100);
    if (error) throw new Error("Quote requests could not be loaded. Please retry.");
    return data ?? [];
  });