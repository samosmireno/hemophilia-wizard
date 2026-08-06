import { Navigate, useParams } from "react-router";

import DiseaseBackground from "./education/DiseaseBackground";
import FviiiMimetics from "./education/FviiiMimetics";
import ProphylaxisGuidance from "./education/ProphylaxisGuidance";
import RebalancingAgents from "./education/RebalancingAgents";
import TreatmentLandscape from "./education/TreatmentLandscape";

/** Default chapter an unknown `/education/...` path is sent to. */
const EDUCATION_DEFAULT = "/education/disease-background";

/**
 * The five chapters, keyed by their stable URL slug. This record is both the
 * validity gate for `:section` and the dispatch table — one source of truth, so
 * a chapter cannot be routable without a component or vice versa.
 *
 * `rebalancing-agents` and `fviii-mimetics` are wizard cross-link targets, so
 * their slugs are contractual. Walkthrough ORDER is not decided here — that is
 * `SECTION_ORDER` in `src/data/sectionOrder.ts`.
 *
 * Each chapter is its own component rather than one data-driven renderer: they
 * are structurally different (`disease-background` pairs prose with a figure and
 * a row of disclosures; `treatment-landscape` carries a five-column matrix), so
 * a shared renderer would be modelling a similarity that is not there.
 */
const CHAPTERS = {
  "disease-background": DiseaseBackground,
  "treatment-landscape": TreatmentLandscape,
  "rebalancing-agents": RebalancingAgents,
  "fviii-mimetics": FviiiMimetics,
  "prophylaxis-guidance": ProphylaxisGuidance,
} as const;

type EducationSection = keyof typeof CHAPTERS;

/**
 * `Object.hasOwn`, not `in` — `in` walks the prototype chain, so
 * `/education/toString` would resolve as a valid section and then blow up
 * trying to render `Object.prototype.toString` as a component.
 */
function isEducationSection(value: string | undefined): value is EducationSection {
  return value !== undefined && Object.hasOwn(CHAPTERS, value);
}

/**
 * `/education/:section` — the multi-chapter education module (issue 11).
 *
 * An unknown section redirects to the default chapter; there is no not-found
 * page, so unknown paths under a section resolve to that section.
 */
export default function Education() {
  const { section } = useParams();

  if (!isEducationSection(section)) {
    return <Navigate to={EDUCATION_DEFAULT} replace />;
  }

  const Chapter = CHAPTERS[section];
  return <Chapter />;
}
