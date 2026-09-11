import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider, createHashRouter } from "react-router";
import { initAnalytics } from "./lib/analytics";
import { sanitizeLocation } from "./lib/sanitizeLocation";
import { routes } from "./routes/router.tsx";

// Barlow Condensed needs 400 as well as 600/700 — without it the landing hero's
// eyebrow and subtitle get a browser-synthesized regular (docs/styling.md §8).
import "@fontsource-variable/dm-sans";
import "@fontsource/barlow-condensed/latin-400.css";
import "@fontsource/barlow-condensed/latin-600.css";
import "@fontsource/barlow-condensed/latin-700.css";
import "./styles/tokens.css";

// Campaign links may arrive carrying a per-recipient token appended by whatever
// tool sent them. Strip everything but `utm_*` from the address bar before the
// router captures the URL and before gtag can read it (docs/adr/0010, amendment).
sanitizeLocation();

// Built here rather than in `router.tsx` so the sanitized URL is what it captures —
// module imports are hoisted, so a `router` export would have read the raw one.
//
// Hash-based, because the build also ships as a folder the client serves from
// their own site, in an iframe: a history route has to survive a server round
// trip on reload, and that server is theirs, with no rewrite to `index.html`.
// Behind the hash a route never leaves the browser, and the document URL stays
// at the install root, which is what lets `base: "./"` (vite.config.ts) resolve
// assets from any subdirectory. On Vercel the catch-all rewrite is harmless.
// Analytics is unaffected: `useLocation().pathname` still reads `/wizard`, and
// that is what `AppShell` sends as the page path. Campaign params sit before the
// hash, where `sanitizeLocation` and gtag read them.
const router = createHashRouter(routes);

// The env reads live here, not in the module, so `analytics.ts` stays testable.
// Production-only: a dev session must not send hits to the client-facing
// property (see docs/analytics.md for the full schema and GA4-side setup).
initAnalytics(import.meta.env.VITE_GA_MEASUREMENT_ID, import.meta.env.PROD);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
