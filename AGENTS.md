<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Define standalone offer prices and optional add-ons in `src/lib/offers.ts` and reuse `StandaloneOffer` on Home and Packages so the entry offer stays consistent across pages.
- Include newly used UI dependencies in Vite's `optimizeDeps.include` so first-use optimization does not swap React modules in an already open preview.
- Carry custom bundle and package interest through validated contact-page search parameters, using shared offer helpers, so selections survive navigation without browser storage or invented totals.
- Keep demo showcase entries in `src/lib/demos.ts` with an explicit `status`, and set a demo to `live` only once its URL is actually published, so sample builds never read as client work.
- Sales configuration uses a strict rep-only input schema and authorized server actions; no public order or checkout endpoint exists, preventing anonymous privileged writes.
- Builder orders have no browser Data API grants; every sales handler verifies the current rep identity before privileged access and scopes rep reads by authenticated ID because membership is runtime server configuration.
- Keep rep allowlist checks in server-only modules and one root sales-auth subscriber; the inline-login builder has no private loader, and every private server action independently verifies authorization.
- Rep sign-in is WorkOS on internal.velolinkai.com only; public hosts return not found for /builder and WorkOS routes, and public navigation never links the workspace.

