import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { LogOut, RefreshCw, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WebsiteConfigurator } from "@/components/site/WebsiteConfigurator";
import { useSalesAuth } from "@/components/site/SalesAuth";
import { getRepAccess, listRepQuotes } from "@/lib/builder.functions";

export const Route = createFileRoute("/builder")({
  ssr: false,
  head: () => ({ meta: [
    { title: "Rep Builder — Sales Workspace | VeloLinkAI" },
    { name: "description", content: "Authorized VeloLinkAI representatives can prepare website and receptionist quote requests." },
    { property: "og:title", content: "VeloLinkAI Rep Builder" },
    { property: "og:description", content: "Private sales workspace for authorized VeloLinkAI representatives." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
    { name: "robots", content: "noindex, nofollow" },
  ] }),
  component: Builder,
});

function Builder() {
  const { user, loading, configured, internal } = useSalesAuth();
  const accessFn = useServerFn(getRepAccess);
  const ordersFn = useServerFn(listRepQuotes);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [signoutError, setSignoutError] = useState("");
  const access = useQuery({ queryKey: ["rep-access", user?.id], queryFn: () => accessFn(), enabled: Boolean(user), retry: false });
  const orders = useQuery({ queryKey: ["rep-orders", user?.id], queryFn: () => ordersFn(), enabled: access.data?.allowed === true, retry: false });

  async function signOut() {
    await queryClient.cancelQueries(); queryClient.clear();
    try {
      const result = await fetch("/api/public/workos/sign-out", { method: "POST" });
      if (!result.ok) throw new Error("Sign-out failed");
      const data: { url: string } = await result.json();
      await navigate({ href: data.url, replace: true });
    } catch { setSignoutError("Unable to sign out. Please retry."); }
  }

  if (loading) return <div className="px-5 py-20 text-center" role="status">Checking account…</div>;
  if (!internal) return <section className="mx-auto max-w-md px-5 py-20"><h1 className="text-3xl font-bold">Page not found</h1></section>;
  if (!user) return <RepLogin configured={configured} />;
  if (access.isPending) return <div className="px-5 py-20 text-center" role="status">Checking rep access…</div>;
  if (access.data?.allowed !== true) return <section className="mx-auto max-w-xl px-5 py-20"><ShieldCheck className="h-9 w-9 text-accent" /><h1 className="mt-5 text-3xl font-bold">Rep access required</h1><p className="mt-4 text-muted-foreground">{access.isError ? "We could not check your access. Please retry." : "This verified account is not authorized for the rep workspace. Contact the VeloLinkAI owner to enable access."}</p><div className="mt-6 flex gap-3"><Button variant="outline" onClick={() => void access.refetch()}><RefreshCw />Retry</Button><Button onClick={() => void signOut()}><LogOut />Sign out</Button></div>{signoutError && <p role="alert" className="mt-4 text-destructive">{signoutError}</p>}</section>;

  return <>
    <section className="bg-navy-deep px-5 py-10 text-navy-foreground"><div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-5"><div><p className="flex items-center gap-2 text-sm text-accent"><ShieldCheck className="h-4 w-4" />Authorized rep</p><h1 className="mt-3 text-3xl font-bold">Rep Builder</h1><p className="mt-3 break-all text-sm text-navy-muted">{access.data.email}</p></div><Button variant="ghostDark" onClick={() => void signOut()}><LogOut />Sign out</Button></div></section>
    <section className="px-5 py-12"><div className="mx-auto max-w-6xl"><WebsiteConfigurator onSaved={() => { void orders.refetch(); }} /></div></section>
    <section className="border-t px-5 py-12"><div className="mx-auto max-w-6xl"><div className="flex items-center justify-between gap-4"><h2 className="text-2xl font-semibold">Your quote requests</h2><Button variant="outline" size="icon" aria-label="Refresh quote requests" title="Refresh quote requests" onClick={() => void orders.refetch()}><RefreshCw /></Button></div>
      {orders.isPending && <p className="mt-5" role="status">Loading requests…</p>}
      {orders.isError && <p role="alert" className="mt-5 text-destructive">Requests could not be loaded. Please retry.</p>}
      {orders.data?.length === 0 && <p className="mt-5 text-muted-foreground">No quote requests yet.</p>}
      <div className="mt-6 space-y-3">{orders.data?.map((order) => <details key={order.id} className="rounded-lg border bg-card p-5"><summary className="cursor-pointer font-semibold">{order.business_name} <span className="ml-2 text-sm font-normal text-muted-foreground">{order.page_count} page{order.page_count === 1 ? "" : "s"} · {order.payment_preference} · Pricing pending</span></summary><p className="mt-4 break-all text-sm">Reference: {order.id}</p><p className="mt-2 text-sm">{order.contact_email}</p><p className="mt-2 text-sm text-muted-foreground">{new Date(order.created_at).toLocaleDateString()} · Quote requested</p><pre className="mt-4 overflow-auto whitespace-pre-wrap break-all rounded-md bg-muted p-4 text-xs">{JSON.stringify(order.configuration, null, 2)}</pre></details>)}</div>
    </div></section>
    {signoutError && <p role="alert" className="px-5 text-destructive">{signoutError}</p>}
  </>;
}

function RepLogin({ configured }: { configured: boolean }) {
  return <section className="mx-auto max-w-md px-5 py-16"><ShieldCheck className="h-10 w-10 text-accent" /><p className="mt-5 text-sm font-semibold text-muted-foreground">VeloLinkAI · Internal</p><h1 className="mt-3 text-3xl font-bold">Rep workspace</h1><p className="mt-3 text-muted-foreground">Authorized representatives only.</p>{configured ? <Button asChild className="mt-8 w-full"><a href="/api/public/workos/sign-in">Sign in with WorkOS</a></Button> : <p role="status" className="mt-8 border-t pt-5 text-sm text-muted-foreground">WorkOS sign-in is awaiting owner setup.</p>}</section>;
}