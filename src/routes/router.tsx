import { Navigate, createBrowserRouter, type RouteObject } from "react-router";

import Acronyms from "./Acronyms";
import AppShell from "./AppShell";
import Education from "./Education";
import Explore from "./Explore";
import Glossary from "./Glossary";
import Landing from "./Landing";
import NotFound from "./NotFound";
import References from "./References";
import Resources from "./Resources";
import Survey from "./Survey";
import Wizard from "./Wizard";

/**
 * The app's route config (data router). `AppShell` is the layout route; every
 * page renders into its `<Outlet />`.
 *
 * - `/` is a standalone landing page — not a redirect into education.
 * - `/education` has no overview: bare `/education` redirects to the first
 *   chapter; `/education/:section` renders a chapter (an unknown `:section`
 *   falls through to `NotFound` from inside `Education`).
 * - `/glossary`, `/acronyms`, `/references` are off-line reference pages.
 * - `*` is the single global fallback.
 *
 * Exported so the browser router (below) and the test memory router share one
 * source of truth.
 */
export const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Landing /> },
      {
        path: "education",
        children: [
          { index: true, element: <Navigate to="/education/disease-background" replace /> },
          { path: ":section", element: <Education /> },
        ],
      },
      { path: "wizard", element: <Wizard /> },
      { path: "explore", element: <Explore /> },
      { path: "resources", element: <Resources /> },
      { path: "survey", element: <Survey /> },
      { path: "glossary", element: <Glossary /> },
      { path: "acronyms", element: <Acronyms /> },
      { path: "references", element: <References /> },
      { path: "*", element: <NotFound /> },
    ],
  },
];

export const router = createBrowserRouter(routes);
