import { Fragment, useState } from "react";
import { PopupButton } from "mlg-components";

import bloodDropUrl from "../../assets/images/blood_drop.webp";
import BulletList from "../../components/BulletList";
import { type Disclosure, disclosureCard } from "../../components/disclosures";
import PageSection from "../../components/PageSection";
import Popup from "../../components/Popup";
import {
  type BenefitsChallenges,
  type Bullet,
  type FootnoteKey,
  TREATMENT_OPTIONS_FOOTNOTES,
  TREATMENT_OPTIONS_MATRIX,
  EDUCATION_TOPICS,
} from "../../data/education";
import { cn } from "../../lib/cn";
import { usePreloadImage } from "../../lib/preloadImage";

const LANDSCAPE = EDUCATION_TOPICS["evolving-landscape"];
const CLOTTING = EDUCATION_TOPICS["clotting-factor-replacement"];
const NFT = EDUCATION_TOPICS["nft"];
const PERSONALIZED = EDUCATION_TOPICS["personalized-therapy"];

/** A drawn row: its prose and reserved figure box, then the disclosure beside them. */
interface Row extends Disclosure {
  heading: string;
  bullets: readonly Bullet[];
}

const ROWS: readonly [Row, Row, Row] = [
  {
    heading: "Clotting factor replacement:",
    bullets: CLOTTING.body,
    // Ships as drawn: the design drops "factor" from the class name.
    label: "Benefits and challenges of clotting replacement therapies",
    title: "Benefits and Challenges Associated with Clotting Factor Replacement Therapies",
    subtitle: "(Options include SHL, EHL, and UHL FVIII/FIX products)",
    content: <BenefitsChallengesCard data={CLOTTING.benefitsChallenges} image={bloodDropUrl} />,
  },
  {
    heading: "Non-factor therapies:",
    bullets: NFT.body,
    label: "Benefits and challenges of NFTs",
    title: NFT.title,
    width: "narrow",
    content: <BenefitsChallengesCard data={NFT.benefitsChallenges} image={bloodDropUrl} />,
  },
  {
    heading: "Personalized therapy for HA/HB:",
    bullets: PERSONALIZED.body,
    label: "Novel Therapies for HA/HB",
    content: <TreatmentOptionsTable />,
  },
];

export default function TreatmentLandscape() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const open = openIndex === null ? undefined : ROWS[openIndex];

  usePreloadImage(bloodDropUrl);

  return (
    <PageSection title={LANDSCAPE.title}>
      {/* 12.5rem / 18.75rem === the drawn 200px / 300px at a 16px root. */}
      <div className="mt-8 grid gap-y-10 sm:grid-cols-[12.5rem_1fr] sm:gap-x-6 xl:grid-cols-[1fr_12.5rem_18.75rem] xl:items-center xl:gap-y-5">
        {ROWS.map((row, index) => (
          <Fragment key={row.heading}>
            <div className="sm:col-span-2 xl:col-span-1">
              <h2 className="text-2xl font-bold tracking-wide text-black lg:text-3xl">
                {row.heading}
              </h2>
              <BulletList items={row.bullets} className="mt-4" />
            </div>

            {/* `border-[0.25rem]` not `border-4`: the numeric utility is px and
                would pin the outline while the box scales (§19). Editors will
                offer to "canonicalise" it — decline. */}
            <div className="mx-auto h-41.5 w-full max-w-50 border-[0.25rem] border-black" />

            <div className="flex flex-col items-center">
              {/* Not `aria-controls`: a modal dialog lives in the top layer, so
                  it is not a region of this page the button expands. */}
              <PopupButton
                label={row.label}
                open={openIndex === index}
                aria-haspopup={row.content ? "dialog" : undefined}
                onClick={(next) => setOpenIndex(next ? index : null)}
              />
              <p className="mt-4 text-center text-xl font-bold text-popup-caption lg:text-2xl">
                {row.label}
              </p>
            </div>
          </Fragment>
        ))}
      </div>

      <Popup card={disclosureCard(open)} onClose={() => setOpenIndex(null)} />
    </PageSection>
  );
}

function BenefitsChallengesCard({ data, image }: { data: BenefitsChallenges; image: string }) {
  return (
    <div className="flex items-center gap-8 py-6">
      <div className="min-w-0 flex-1">
        {/* `<h3>`: `Popup`'s band heading is the card's `<h2>`. */}
        <h3 className="text-2xl font-bold text-black lg:text-3xl">Benefits</h3>
        <BulletList items={data.benefits} className="mt-4 text-base leading-[1.6] lg:text-xl" />

        <h3 className="mt-6 text-2xl font-bold text-black lg:text-3xl">Challenges</h3>
        <BulletList items={data.challenges} className="mt-4 text-base leading-[1.6] lg:text-xl" />
      </div>

      {/* `w-46.5` === the artboard's drawn 186px. */}
      <img
        src={image}
        alt=""
        width={552}
        height={1020}
        className="hidden h-auto w-46.5 shrink-0 md:block"
      />
    </div>
  );
}

/** The five column headings, as drawn. */
const MATRIX_COLUMNS = [
  "Treatment Options",
  "Mechanism of Action",
  "Population",
  "Indication",
  "Route of Administration",
] as const;

/** The markers the table actually uses, in the order they first appear, deduped. */
const USED_FOOTNOTES: readonly FootnoteKey[] = [
  ...new Set(
    TREATMENT_OPTIONS_MATRIX.map((row) => row.footnote).filter((key) => key !== undefined),
  ),
];

const MATRIX_CELL = "px-2 py-1.5 align-middle";

const MATRIX_LEAD = "text-base leading-tight lg:text-xl";
const MATRIX_PROSE = "text-sm leading-tight lg:text-base";

/** The hairline between cells — inferred: the export draws a flat #A0A0A0 the palette has no token for. */
const MATRIX_RULE = "border-black/30";

/**
 * `↑`/`↓` read as a prefix on the term that follows, so the narrow cells may not
 * wrap between the two. Glued here rather than in the data: which space is
 * breakable is typesetting, and the copy stays a plain sentence to transcribe
 * against.
 */
const bindArrows = (text: string) => text.replace(/([↑↓])\s+/g, "$1\u00a0");

function TreatmentOptionsTable() {
  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-165 table-fixed border-separate border-spacing-0 text-center text-black">
          <thead>
            <tr>
              {MATRIX_COLUMNS.map((column, index) => (
                <th
                  key={column}
                  scope="col"
                  className={cn(
                    "bg-white/50 px-2 py-3 font-normal",
                    MATRIX_LEAD,
                    index === 0 && "rounded-l-2xl",
                    index === MATRIX_COLUMNS.length - 1 && "rounded-r-2xl",
                  )}
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TREATMENT_OPTIONS_MATRIX.map((row, index) => {
              const rule = index > 0 && cn("border-t", MATRIX_RULE);
              const column = cn("border-l", MATRIX_RULE);

              return (
                <tr key={row.option}>
                  <th scope="row" className={cn(MATRIX_CELL, MATRIX_LEAD, "font-normal", rule)}>
                    {row.option}
                    {row.footnote && <sup>{row.footnote}</sup>}
                  </th>
                  <td className={cn(MATRIX_CELL, MATRIX_PROSE, column, rule)}>
                    {bindArrows(row.moa)}
                  </td>
                  <td className={cn(MATRIX_CELL, MATRIX_PROSE, "italic", column, rule)}>
                    {row.population}
                  </td>
                  <td className={cn(MATRIX_CELL, MATRIX_PROSE, column, rule)}>
                    {row.indication.map((line) => (
                      <span key={line} className="block">
                        {line}
                      </span>
                    ))}
                  </td>
                  <td className={cn(MATRIX_CELL, MATRIX_LEAD, column, rule)}>{row.route}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* `list-none` with the marker in the text: the letters join to the `<sup>`s
          above, so they are content, not a counter. `leading-none` is the export's
          — the block is set solid there (open item 37). */}
      <ul className="mt-4 list-none text-sm leading-none font-light text-black">
        {USED_FOOTNOTES.map((key) => {
          const note = TREATMENT_OPTIONS_FOOTNOTES[key];

          return (
            <li key={key}>
              {key}. {typeof note === "string" ? note : note.text}
              {typeof note !== "string" && (
                <ul className="list-disc pl-10 italic">
                  {note.children.map((child) => (
                    <li key={child}>{child}</li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
