import bleedingUrl from "../../assets/images/bleeding_manifestations_diagram.webp";
import cascadeThumbUrl from "../../assets/images/clotting-cascade-thumb.webp";
import diagnosticUrl from "../../assets/images/diagnostic_approach_diagram.webp";
import DisclosureBand, { type Disclosure } from "../../components/DisclosureBand";
import ExpandableFigure from "../../components/ExpandableFigure";
import PopupFigure from "../../components/PopupFigure";
import { type Bullet, SEVERITY_TABLE, topicById } from "../../data/education";
import { cn } from "../../lib/cn";
import ClottingCascadeFigure from "./ClottingCascadeFigure";

/**
 * The clotting cascade's own heading, which is not its §7.7 caption ("Disease
 * mechanism for HA/HB") — the same caption-vs-title split `Disclosure` records.
 */
const CASCADE_TITLE = "Initiation and Amplification of the Clotting Cascade";

/**
 * `/education/disease-background` — CONTEXT.md §7.2, the first chapter of the
 * education module and step 1 of the walkthrough after `/`.
 *
 * Non-null: both ids are literals in this repo's own data module, and the
 * chapter test asserts they resolve. A fallback here would be a second,
 * unverified answer to a question the test already answers.
 */
const MECHANISM = topicById("disease-mechanism")!;
const DIAGNOSIS = topicById("diagnosis")!;

/**
 * The three "Click here:" disclosures under the severity heading (§7.7).
 *
 * Labels are literals rather than data reads: only the first has a matching
 * `EDUCATION_TOPICS` title. Second pass reconciles all three with the data
 * model.
 *
 * **Every one of them carries its own `title`.** The caption under the button
 * and the heading on the card are different strings in the design — the caption
 * names the target from the §7.7 index ("Diagnostic algorithm for HA/HB"), the
 * card wears the figure's own title ("Diagnostic approach for Hemophilia A/B").
 * Neither is derivable from the other, so both are stated.
 *
 * A 3-tuple, matching `DisclosureBand`'s prop: the band's grid and arch are
 * drawn around three columns, so a fourth is a design question, and the type is
 * what makes it get asked.
 */
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
    label: "Typical bleeding manifestations in males and females with HA/HB",
    // Same string the `severity-bleeding` topic lists as its figure caption —
    // stated here rather than read out of that array, which is an unordered
    // list of captions and not a keyed lookup.
    title: "Bleeding in males and females with hemophilia",
    content: (
      <PopupFigure
        src={bleedingUrl}
        width={720}
        height={655}
        alt="Typical bleeding manifestations in males and females with hemophilia A or B, annotated on a body diagram. Musculoskeletal bleeding, mainly the elbows, ankles, and knees, accounts for 80%. Also shown: intracranial hemorrhage; oropharyngeal cavity bleeding; epistaxis, rarely; gastrointestinal bleeding; genitourinary bleeding; heavy menstrual bleeding and postpartum hemorrhage; and easy bruising."
      />
    ),
  },
];

export default function DiseaseBackground() {
  // A growing flex column so the severity band below can take the leftover
  // height — the shell hands every page a `flex-1` wrapper inside a `min-h-dvh`
  // `<main>`, so `flex-1` here resolves against the viewport.
  return (
    <section aria-labelledby="chapter-heading" className="flex flex-1 flex-col">
      {/* Uppercase is CSS, not copy: the accessible name stays title-case, the
          way `Landing` keeps the activity title readable. */}
      <h1
        id="chapter-heading"
        className="font-display text-h1 tracking-wide text-brand-crimson-50 uppercase"
      >
        Hemophilia Disease Background
      </h1>
      {/* The figure sets the top of this block and the prose is nudged down
          under it — hence the per-column margins rather than one on the grid:
          in the comp the pop-up sits nearer the chapter title than the
          "Disease mechanism" heading does. */}
      <div className="mt-5 grid lg:grid-cols-[1fr_470px] lg:gap-x-8">
        <div className="lg:mt-3">
          <h2 className="text-h2 font-bold tracking-wide text-black">{MECHANISM.title}</h2>
          <BulletList items={MECHANISM.body} className="mt-4" />
          <h2 className="mt-4 text-h2 font-bold tracking-wide text-black">Diagnosis:</h2>
        </div>

        {/*
          The one §7.7 target the design draws in the chapter body rather than
          behind a "Click here:" button, so it is an `ExpandableFigure` and not a
          fourth `Disclosure` — the band's grid and arch are built for three.

          The thumbnail is the designer's export with only the ✕ cropped out —
          a control that did nothing while this was a static placeholder — so it
          keeps the crimson title band and labels itself in a 470px column. What
          it opens is rebuilt as markup rather than shown as that same raster
          (docs/styling.md §13), which is why the card is white: the diagram is
          drawn on white, and the tinted body would frame it as a rectangle.
        */}
        <ExpandableFigure
          thumbSrc={cascadeThumbUrl}
          title={CASCADE_TITLE}
          surface="white"
          className="mt-8 max-w-[470px] lg:mt-0"
        >
          <ClottingCascadeFigure />
        </ExpandableFigure>

        <BulletList items={DIAGNOSIS.body} className="mt-4 lg:col-span-2" />
      </div>

      {/*
        The band closes the page: `grow` takes whatever height is left under the
        disclosures on a short chapter, and is inert once the content itself
        passes the fold (`min-h-dvh` is a floor, so there is no free space to
        take) — which is why the `<section>` above is a flex column.

        The 44px above it was the band heading's own top margin collapsing out
        through the (padding-less) div. A flex item establishes its own
        formatting context, which stops that; the gap is stated directly as a
        margin instead, so nothing inside moved.
      */}
      <DisclosureBand title="Hemophilia Severity and Bleeding Patterns" disclosures={DISCLOSURES} />
    </section>
  );
}

/** The banner over the bullet row — a table heading in the design, so a literal here. */
const MANIFESTATION_HEADING = "Bleeding Manifestation Based on Severity";

/**
 * `SEVERITY_TABLE` as the §7.7 pop-up draws it: severity across the top, the
 * factor level under it, then the bleeding manifestations under a banner of
 * their own.
 *
 * **A real `<table>`**, not the grid the visual suggests. The two pale bars
 * span all three columns and read as single pills, which is a grid's natural
 * shape and a table's awkward one — but the content is a genuine 3×2 matrix
 * (severity × [factor level, manifestations]), and a grid throws away the
 * column association that makes ">5% – <40%" mean something. `border-separate`
 * with zero x-spacing buys the pill back: the header cells touch, share one
 * `bg-white/50`, and only the outer two round, so the row paints as one bar.
 * The banner is one `colspan=3` cell for the same reason — a `colgroup` header
 * over the row beneath it, which is what it is.
 *
 * Type is raw design values under §8's precedent — 26/700 lands on the `text-h3`
 * step at a heavier weight, and 22px is off the scale entirely. The column rules
 * are inferred: the export draws a hairline the palette has no token for.
 */
function SeverityTable() {
  return (
    <table className="w-full table-fixed border-separate border-spacing-x-0 border-spacing-y-2 text-center text-black">
      <thead>
        <tr>
          {SEVERITY_TABLE.map((row, index) => (
            <th
              key={row.severity}
              scope="col"
              className={cn(
                "bg-white/50 px-2 py-5 text-h3 font-bold",
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
              className={cn("px-2 py-5 text-h3 font-bold", index > 0 && "border-l border-black/10")}
            >
              {row.factorLevel}
            </td>
          ))}
        </tr>
        <tr>
          <th
            scope="colgroup"
            colSpan={SEVERITY_TABLE.length}
            className="rounded-2xl bg-white/50 px-2 py-5 text-h3 font-bold"
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
              <ul className="list-disc pl-6 text-left text-[22px] leading-[1.6] font-normal">
                {row.manifestations.map((manifestation) => (
                  <li key={manifestation}>{manifestation}</li>
                ))}
              </ul>
            </td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}

function BulletList({ items, className }: { items: readonly Bullet[]; className?: string }) {
  return (
    <ul className={cn("list-disc pl-6 text-body text-black", className)}>
      {items.map((item) =>
        typeof item === "string" ? (
          <li key={item}>{item}</li>
        ) : (
          <li key={item.text}>
            {item.text}
            <ul className="list-disc ps-7">
              {item.children.map((child) => (
                <li key={child}>{child}</li>
              ))}
            </ul>
          </li>
        ),
      )}
    </ul>
  );
}
