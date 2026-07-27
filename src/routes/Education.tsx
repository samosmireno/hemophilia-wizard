import { useParams } from "react-router";

import NotFound from "./NotFound";

/**
 * `/education/:section` — multi-chapter education module (content is issue 11).
 *
 * The four chapter slugs below are stable URLs — `rebalancing-agents` and
 * `fviiia-mimetics` are wizard cross-link targets. Their walkthrough order is
 * owned by `SECTION_ORDER` in `src/data/sectionOrder.ts`; this set only gates
 * which `:section` values are valid. An unknown section falls through to the
 * single global `NotFound` (one fallback everywhere).
 */
const EDUCATION_SECTIONS = [
  "disease-background",
  "treatment-landscape",
  "rebalancing-agents",
  "fviiia-mimetics",
] as const;

type EducationSection = (typeof EDUCATION_SECTIONS)[number];

function isEducationSection(value: string | undefined): value is EducationSection {
  return EDUCATION_SECTIONS.includes(value as EducationSection);
}

export default function Education() {
  const { section } = useParams();

  if (!isEducationSection(section)) {
    return <NotFound />;
  }

  return (
    <section aria-labelledby="education-heading">
      <h1 id="education-heading">Education — {section}</h1>
      <p>Education chapter placeholder.</p>
    </section>
  );
}
