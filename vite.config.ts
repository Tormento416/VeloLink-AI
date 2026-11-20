// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - TanStack devtools (dev-only, first), tanstackStart, viteReact, tailwindcss, tsConfigPaths,
//     nitro (build-only using cloudflare as a default target), VITE_* env injection, @ path alias,
//     React/TanStack dedupe, error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  vite: {
    // Bundle WorkOS AuthKit into the SSR build: its dist uses a JSON import
    // attribute for package.json that the externalized dev SSR runner cannot
    // resolve, which crashed every internal-host request with a 500.
    ssr: {
      noExternal: ["@workos/authkit-tanstack-react-start", "@workos/authkit-session", "@workos-inc/node"],
    },
    optimizeDeps: {
      include: ["@radix-ui/react-slot", "@radix-ui/react-checkbox", "class-variance-authority", "clsx", "lucide-react", "sonner", "tailwind-merge"],
    },
  },
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
});
