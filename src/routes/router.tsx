import { Navigate, createBrowserRouter, type RouteObject } from "react-router";

import Acronyms from "./Acronyms";
import AppShell from "./AppShell";
import DiseaseBackground from "./education/DiseaseBackground";
import FviiiMimetics from "./education/FviiiMimetics";
import ProphylaxisGuidance from "./education/ProphylaxisGuidance";
import RebalancingAgents from "./education/RebalancingAgents";
import TreatmentLandscape from "./education/TreatmentLandscape";
import Explore from "./Explore";
import Glossary from "./Glossary";
import HowTo from "./HowTo";
import Landing from "./Landing";
import References from "./References";
import Resources from "./Resources";
import Survey from "./Survey";
import TopRule from "./TopRule";
import Wizard from "./Wizard";
import WizardIntro from "./WizardIntro";
import { LeafGate, ScenarioGate } from "./wizard/Gate";
import Reason from "./wizard/Reason";
import Scenario from "./wizard/Scenario";
import Therapies from "./wizard/Therapies";

/** Where bare `/education` and its unmatched sections land: the first chapter. */
const EDUCATION_DEFAULT = "/education/disease-background";

export const routes: RouteObject[] = [
  {
    element: <AppShell />,
    children: [
      { index: true, element: <Landing /> },
      {
        element: <TopRule />,
        children: [
          { path: "how-to", element: <HowTo /> },
          {
            path: "education",
            /*
              Static routes, not a `:section` param: the chapters are a closed
              set, so which slug renders which chapter is the router's own
              matching, and anything unmatched — unknown sections, prototype
              keys, deeper paths — falls to `*` without a hand-rolled guard.
              `rebalancing-agents` and `fviii-mimetics` are wizard cross-link
              targets, so their slugs are contractual.
            */
            children: [
              { index: true, element: <Navigate to={EDUCATION_DEFAULT} replace /> },
              { path: "disease-background", element: <DiseaseBackground /> },
              { path: "treatment-landscape", element: <TreatmentLandscape /> },
              { path: "rebalancing-agents", element: <RebalancingAgents /> },
              { path: "fviii-mimetics", element: <FviiiMimetics /> },
              { path: "prophylaxis-guidance", element: <ProphylaxisGuidance /> },
              { path: "*", element: <Navigate to={EDUCATION_DEFAULT} replace /> },
            ],
          },
          { path: "wizard-intro", element: <WizardIntro /> },
          {
            path: "wizard",
            children: [
              { index: true, element: <Wizard /> },
              {
                // Two gate levels, nested: the scenario pages need the two
                // patient answers; the leaf additionally needs the reason, and
                // its gate can assume the outer one held (see Gate.tsx).
                element: <ScenarioGate />,
                children: [
                  { path: "scenario", element: <Scenario /> },
                  { path: "reason", element: <Reason /> },
                  {
                    element: <LeafGate />,
                    children: [{ path: "therapies", element: <Therapies /> }],
                  },
                ],
              },
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
