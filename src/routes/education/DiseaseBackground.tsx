import bleedingUrl from "../../assets/images/bleeding_manifestations_diagram.webp";
import cascadeThumbUrl from "../../assets/images/clotting-cascade-thumb.svg";
import diagnosticUrl from "../../assets/images/diagnostic_approach_diagram.webp";
import BulletList from "../../components/BulletList";
import DisclosureBand from "../../components/DisclosureBand";
import { type Disclosure } from "../../components/disclosures";
import ExpandableFigure from "../../components/ExpandableFigure";
import PageSection from "../../components/PageSection";
import PopupFigure from "../../components/PopupFigure";
import { SEVERITY_TABLE, EDUCATION_TOPICS } from "../../data/education";
import { cn } from "../../lib/cn";
import { usePreloadImages } from "../../lib/preloadImage";
import ClottingCascadeFigure from "./ClottingCascadeFigure";

/** Exported for `/how-to`, whose clickable-image demo is this same figure. */
export const CASCADE_TITLE = "Initiation and Amplification of the Clotting Cascade";

const MECHANISM = EDUCATION_TOPICS["disease-mechanism"];
const DIAGNOSIS = EDUCATION_TOPICS["diagnosis"];

const DISCLOSURES: readonly [Disclosure, Disclosure, Disclosure] = [
  {
    label: DIAGNOSIS.title,
    title: "Diagnostic approach for Hemophilia A/B",
    content: (
      <PopupFigure
        src={diagnosticUrl}
        width={720}
        height={608}
        alt="Diagnostic algorithm for hemophilia A/B: prolonged aPTT leads to mixing study, factor and VWF assays, then F8 or F9 genotyping to confirm."
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
        alt="Body diagram of bleeding in hemophilia A/B: musculoskeletal bleeds (80%), intracranial, oropharyngeal, GI, genitourinary bleeding, easy bruising."
      />
    ),
  },
];

const DISCLOSURE_FIGURES = [diagnosticUrl, bleedingUrl];

export default function DiseaseBackground() {
  usePreloadImages(DISCLOSURE_FIGURES);

  return (
    <PageSection title="Hemophilia Disease Background" className="flex flex-1 flex-col">
      {/* 29.375rem === the drawn 470px at a 16px root. */}
      <div className="mt-5 mb-4 grid xl:grid-cols-[1fr_29.375rem] xl:gap-x-8">
        <div className="xl:mt-3">
          <h2 className="text-2xl font-bold tracking-wide text-black lg:text-3xl">
            {MECHANISM.title}
          </h2>
          <BulletList items={MECHANISM.body} className="mt-4 text-lg" />
          <h2 className="mt-4 text-2xl font-bold tracking-wide text-black lg:text-3xl">
            Diagnosis:
          </h2>
        </div>

        <ExpandableFigure
          thumbSrc={cascadeThumbUrl}
          thumbWidth={473.26}
          thumbHeight={271}
          title={CASCADE_TITLE}
          surface="white"
          className="mx-auto mt-8 max-w-120 xl:mx-0 xl:mt-0"
        >
          <ClottingCascadeFigure />
        </ExpandableFigure>

        <BulletList items={DIAGNOSIS.body} className="mt-4 text-lg xl:col-span-2" />
      </div>

      <DisclosureBand title="Hemophilia Severity and Bleeding Patterns" disclosures={DISCLOSURES} />
    </PageSection>
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
