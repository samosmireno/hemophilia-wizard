import { Navigate, createBrowserRouter, type RouteObject } from "react-router";

import Acronyms from "./Acronyms";
import AppShell from "./AppShell";
import Education from "./Education";
import Explore from "./Explore";
import Glossary from "./Glossary";
import Landing from "./Landing";
import References from "./References";
import Resources from "./Resources";
import Survey from "./Survey";
import TopRule from "./TopRule";
import Wizard from "./Wizard";
import WizardIntro from "./WizardIntro";
import WizardGate from "./wizard/Gate";
import Scenario from "./wizard/Scenario";
import Therapies from "./wizard/Therapies";

/**
 * The app's route config (data router). `AppShell` is the layout route; every
 * page renders into its `<Outlet />`.
 *
 * - `/` is a standalone landing page — not a redirect into education. It is the
 *   only child outside `TopRule`, the pathless layout route that draws the
 *   crimson rule across the top of every other page.
 * - `/education` has no overview: bare `/education` redirects to the first
 *   chapter; `/education/:section` renders a chapter (an unknown `:section`
 *   redirects to the first chapter from inside `Education`).
 * - `/wizard` is three routes: the questions at the index, then `scenario` and
 *   `therapies` behind `WizardGate`, which redirects to the questions unless all
 *   three answers are in session state.
 * - `/glossary`, `/acronyms`, `/references` are off-line reference pages.
 *
 * There is no not-found page. Unknown paths under a section resolve to that
 * section (the nested `*` under `education` sends deeper junk to the first
 * chapter); any other unknown path redirects to the landing page (`/`).
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
        element: <TopRule />,
        children: [
          {
            path: "education",
            children: [
              { index: true, element: <Navigate to="/education/disease-background" replace /> },
              { path: ":section", element: <Education /> },
              { path: "*", element: <Navigate to="/education/disease-background" replace /> },
            ],
          },
          { path: "wizard-intro", element: <WizardIntro /> },
          {
            path: "wizard",
            children: [
              { index: true, element: <Wizard /> },
              // The two pages past the questions render a scenario, so they are
              // mounted behind `WizardGate` — no answers, no scenario, back to
              // the questions.
              {
                element: <WizardGate />,
                children: [
                  { path: "scenario", element: <Scenario /> },
                  { path: "therapies", element: <Therapies /> },
                ],
              },
              // Junk under `/wizard` resolves to the wizard, the way junk under
              // `/education` resolves to a chapter — not to the landing page.
              { path: "*", element: <Navigate to="/wizard" replace /> },
            ],
          },
          { path: "explore", element: <Explore /> },
          { path: "resources", element: <Resources /> },
          { path: "survey", element: <Survey /> },
          { path: "glossary", element: <Glossary /> },
          { path: "acronyms", element: <Acronyms /> },
          { path: "references", element: <References /> },
          { path: "*", element: <Navigate to="/" replace /> },
        ],
      },
    ],
  },
];

export const router = createBrowserRouter(routes);
