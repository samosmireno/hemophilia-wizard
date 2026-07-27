import { Navigate, useParams } from "react-router";

/** Default chapter an unknown `/education/...` path is sent to. */
const EDUCATION_DEFAULT = "/education/disease-background";

/**
 * `/education/:section` — multi-chapter education module (content is issue 11).
 *
 * The four chapter slugs below are stable URLs — `rebalancing-agents` and
 * `fviiia-mimetics` are wizard cross-link targets. Their walkthrough order is
 * owned by `SECTION_ORDER` in `src/data/sectionOrder.ts`; this set only gates
 * which `:section` values are valid. An unknown section redirects to the
 * default chapter (there is no not-found page — unknown paths under a section
 * resolve to that section).
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
    return <Navigate to={EDUCATION_DEFAULT} replace />;
  }

  return (
    <section aria-labelledby="education-heading">
      <h1 id="education-heading">Education — {section}</h1>
      <p>Education chapter placeholder.</p>
    </section>
  );
}
