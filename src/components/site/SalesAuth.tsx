import { createContext, useContext, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouterState } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { getSalesSession } from "@/lib/sales-session.functions";

const SalesAuthContext = createContext<{ user: { id: string; email: string } | null; loading: boolean; configured: boolean; internal: boolean }>({ user: null, loading: true, configured: false, internal: false });

export function SalesAuthProvider({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (state) => state.location.pathname });
  const sessionFn = useServerFn(getSalesSession);
  const session = useQuery({ queryKey: ["sales-session"], queryFn: () => sessionFn(), enabled: pathname === "/builder", retry: false });
  return <SalesAuthContext.Provider value={{ user: session.data?.user ?? null, loading: pathname === "/builder" && session.isPending, configured: session.data?.configured ?? false, internal: session.data?.internal ?? false }}>{children}</SalesAuthContext.Provider>;
}

export const useSalesAuth = () => useContext(SalesAuthContext);