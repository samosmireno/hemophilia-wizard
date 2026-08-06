import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ReactGA from "react-ga4";
import { RouterProvider } from "react-router";
import { router } from "./routes/router.tsx";

// Barlow Condensed needs 400 as well as 600/700 — without it the landing hero's
// eyebrow and subtitle get a browser-synthesized regular (docs/styling.md §8).
import "@fontsource-variable/dm-sans";
import "@fontsource/barlow-condensed/latin-400.css";
import "@fontsource/barlow-condensed/latin-600.css";
import "@fontsource/barlow-condensed/latin-700.css";
import "./styles/tokens.css";

// A missing VITE_GA_MEASUREMENT_ID must not crash the app — react-ga4 throws
// "Require GA_MEASUREMENT_ID" if called with an empty value.
const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID;
if (gaMeasurementId) {
  ReactGA.initialize(gaMeasurementId);
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
);
