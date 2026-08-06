import bleedingUrl from "../../assets/images/bleeding_manifestations_diagram.webp";
import cascadeThumbUrl from "../../assets/images/clotting-cascade-thumb.webp";
import diagnosticUrl from "../../assets/images/diagnostic_approach_diagram.webp";
import BulletList from "../../components/BulletList";
import DisclosureBand, { type Disclosure } from "../../components/DisclosureBand";
import ExpandableFigure from "../../components/ExpandableFigure";
import PopupFigure from "../../components/PopupFigure";
import { SEVERITY_TABLE, topicById } from "../../data/education";
import { cn } from "../../lib/cn";
import { usePreloadImages } from "../../lib/preloadImage";
import ClottingCascadeFigure from "./ClottingCascadeFigure";

const CASCADE_TITLE = "Initiation and Amplification of the Clotting Cascade";

const MECHANISM = topicById("disease-mechanism")!;
const DIAGNOSIS = topicById("diagnosis")!;

const DISCLOSURES: readonly [Disclosure, Disclosure, Disclosure] = [
  {
    label: DIAGNOSIS.title,
    title: "Diagnostic approach for Hemophilia A/B",
    content: (
      <PopupFigure
        src={diagnosticUrl}
        width={720}
        height={608}
        alt="Diagnostic algorithm for hemophilia A and B. Initial testing: PT/aPTT, then a mixing study if the aPTT is prolonged. A prolonged aPTT that corrects leads to factor assays, which split into reduced FVIII activity and reduced FIX activity. Reduced FVIII activity also prompts VWF testing (VWF:Ag and VWF:Act) to rule out von Willebrand disease. Both arms lead to genetic analysis: F8 genotyping confirms hemophilia A and F9 genotyping confirms hemophilia B, identifying the mutation and inhibitor risk. VWF testing is repeated for discrepant results, suspected inhibitors, and complex cases."
      />
    ),
  },
  {
    label: "Disease severity and bleeding in HA/HB",
    // "FACOTOR" in the export is a typo and is not reproduced.
    title: "Hemophilia Severity Based on Factor VIII/IX Level",
    content: <SeverityTable />,
  },
  {
    label: "Bleeding manifestations in HA/HB",
    title: "Bleeding Manifestations in HA/HB",
    content: (
      <PopupFigure
        src={bleedingUrl}
        width={720}
        height={640}
        alt="Typical bleeding manifestations in males and females with hemophilia A or B, annotated on a body diagram. Musculoskeletal bleeding, mainly the elbows, ankles, and knees, accounts for 80%. Also shown: intracranial hemorrhage; oropharyngeal cavity bleeding; epistaxis, rarely; gastrointestinal bleeding; genitourinary bleeding; heavy menstrual bleeding and postpartum hemorrhage; and easy bruising."
      />
    ),
  },
];

const DISCLOSURE_FIGURES = [diagnosticUrl, bleedingUrl];

export default function DiseaseBackground() {
  usePreloadImages(DISCLOSURE_FIGURES);

  return (
    <section aria-labelledby="chapter-heading" className="flex flex-1 flex-col">
      {/* Uppercase is CSS, not copy: the accessible name stays title-case, the
          way `Landing` keeps the activity title readable. */}
      <h1
        id="chapter-heading"
        className="font-display text-3xl font-bold tracking-wide text-brand-crimson-50 uppercase lg:text-5xl"
      >
        Hemophilia Disease Background
      </h1>
      {/* 29.375rem === the drawn 470px at a 16px root. */}
      <div className="mt-5 mb-4 grid xl:grid-cols-[1fr_29.375rem] xl:gap-x-8">
        <div className="xl:mt-3">
          <h2 className="text-2xl font-bold tracking-wide text-black lg:text-3xl">
            {MECHANISM.title}
          </h2>
          <BulletList items={MECHANISM.body} className="mt-4" />
          <h2 className="mt-4 text-2xl font-bold tracking-wide text-black lg:text-3xl">
            Diagnosis:
          </h2>
        </div>

        <ExpandableFigure
          thumbSrc={cascadeThumbUrl}
          thumbWidth={940}
          thumbHeight={538}
          title={CASCADE_TITLE}
          surface="white"
          className="mx-auto mt-8 max-w-120 xl:mx-0 xl:mt-0"
        >
          <ClottingCascadeFigure />
        </ExpandableFigure>

        <BulletList items={DIAGNOSIS.body} className="mt-4 xl:col-span-2" />
      </div>

      <DisclosureBand title="Hemophilia Severity and Bleeding Patterns" disclosures={DISCLOSURES} />
    </section>
  );
}

const MANIFESTATION_HEADING = "Bleeding Manifestation Based on Severity";

function SeverityTable() {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-105 table-fixed border-separate border-spacing-x-0 border-spacing-y-2 text-center text-black">
        <thead>
          <tr>
            {SEVERITY_TABLE.map((row, index) => (
              <th
                key={row.severity}
                scope="col"
                className={cn(
                  "bg-white/50 px-2 py-5 text-base font-bold lg:text-2xl",
                  index === 0 && "rounded-l-2xl",
                  index === SEVERITY_TABLE.length - 1 && "rounded-r-2xl",
                )}
              >
                {row.severity}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {SEVERITY_TABLE.map((row, index) => (
              <td
                key={row.severity}
                className={cn(
                  "px-2 py-5 text-base font-bold lg:text-2xl",
                  index > 0 && "border-l border-black/10",
                )}
              >
                {row.factorLevel}
              </td>
            ))}
          </tr>
          <tr>
            <th
              scope="colgroup"
              colSpan={SEVERITY_TABLE.length}
              className="rounded-2xl bg-white/50 px-2 py-5 text-base font-bold lg:text-2xl"
            >
              {MANIFESTATION_HEADING}
            </th>
          </tr>
          <tr>
            {SEVERITY_TABLE.map((row, index) => (
              <td
                key={row.severity}
                className={cn("px-2 pt-2 pb-6 align-top", index > 0 && "border-l border-black/10")}
              >
                <ul className="list-disc pl-6 text-left text-sm leading-[1.6] font-normal lg:text-xl">
                  {row.manifestations.map((manifestation) => (
                    <li key={manifestation}>{manifestation}</li>
                  ))}
                </ul>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
