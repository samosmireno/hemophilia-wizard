import { Navigate, useParams } from "react-router";

import DiseaseBackground from "./education/DiseaseBackground";
import FviiiMimetics from "./education/FviiiMimetics";
import ProphylaxisGuidance from "./education/ProphylaxisGuidance";
import RebalancingAgents from "./education/RebalancingAgents";
import TreatmentLandscape from "./education/TreatmentLandscape";

const EDUCATION_DEFAULT = "/education/disease-background";

/**
 * `rebalancing-agents` and `fviii-mimetics` are wizard cross-link targets, so
 * their slugs are contractual.
 */
const CHAPTERS = {
  "disease-background": DiseaseBackground,
  "treatment-landscape": TreatmentLandscape,
  "rebalancing-agents": RebalancingAgents,
  "fviii-mimetics": FviiiMimetics,
  "prophylaxis-guidance": ProphylaxisGuidance,
} as const;

type EducationSection = keyof typeof CHAPTERS;

/** `Object.hasOwn`, not `in` — `in` walks the prototype chain. */
function isEducationSection(value: string | undefined): value is EducationSection {
  return value !== undefined && Object.hasOwn(CHAPTERS, value);
}

export default function Education() {
  const { section } = useParams();

  if (!isEducationSection(section)) {
    return <Navigate to={EDUCATION_DEFAULT} replace />;
  }

  const Chapter = CHAPTERS[section];
  return <Chapter />;
}
