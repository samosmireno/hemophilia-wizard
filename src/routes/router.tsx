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
              {
                element: <WizardGate />,
                children: [
                  { path: "scenario", element: <Scenario /> },
                  { path: "therapies", element: <Therapies /> },
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
