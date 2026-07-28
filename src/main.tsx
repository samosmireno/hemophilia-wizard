import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ReactGA from "react-ga4";
import { RouterProvider } from "react-router";
import { router } from "./routes/router.tsx";

// Self-hosted brand fonts. DM Sans (variable, body/UI) + Barlow Condensed
// (static; display needs the 600/700 weights the type scale uses, plus 400 for
// the landing hero's eyebrow and subtitle — without it those two lines get a
// browser-synthesized regular off the 600, see docs/styling.md §8).
import "@fontsource-variable/dm-sans";
import "@fontsource/barlow-condensed/latin-400.css";
import "@fontsource/barlow-condensed/latin-600.css";
import "@fontsource/barlow-condensed/latin-700.css";
import "./styles/tokens.css";

// Analytics is optional: only initialize when the measurement ID is present at
// build time. A missing VITE_GA_MEASUREMENT_ID (e.g. on preview deploys where
// the env var is scoped to production) must not crash the app — react-ga4
// throws "Require GA_MEASUREMENT_ID" if called with an empty value.
const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (gaMeasurementId) {
  ReactGA.initialize(gaMeasurementId);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
