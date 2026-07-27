import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import ReactGA from "react-ga4";
import { RouterProvider } from "react-router";

import { router } from "./routes/router.tsx";
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
