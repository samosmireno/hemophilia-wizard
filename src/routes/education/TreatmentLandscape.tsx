import { Fragment, type ReactNode, useState } from "react";
import { PopupButton } from "mlg-components";

import bloodDropUrl from "../../assets/images/blood_drop.webp";
import BulletList from "../../components/BulletList";
import Popup from "../../components/Popup";
import {
  type BenefitsChallenges,
  type Bullet,
  type FootnoteKey,
  TREATMENT_OPTIONS_FOOTNOTES,
  TREATMENT_OPTIONS_MATRIX,
  topicById,
} from "../../data/education";
import { cn } from "../../lib/cn";
import { usePreloadImage } from "../../lib/preloadImage";

/**
 * `/education/treatment-landscape` — CONTEXT.md §7.1, §7.3, §7.4, and step 2 of
 * the walkthrough.
 *
 * Non-null for the same reason `DiseaseBackground` records: every id below is a
 * literal in this repo's own data module, and the chapter test asserts they
 * resolve.
 */
const LANDSCAPE = topicById("evolving-landscape")!;
const CLOTTING = topicById("clotting-factor-replacement")!;
const NFT = topicById("nft")!;
const PERSONALIZED = topicById("personalized-therapy")!;

interface Row {
  /**
   * The block's sub-heading. A **literal**, not `topic.title`: two of the three
   * carry a colon the source titles do not, and the middle one is "Non-factor
   * therapies:" over a topic called "Non-factor Replacement Therapies". Reading
   * the title for two and stating the third would hide which is which — the
   * same call `DiseaseBackground` makes for "Diagnosis:".
   */
  heading: string;
  bullets: readonly Bullet[];
  /**
   * Caption under the `+`, and the button's accessible name — `PopupButton`
   * prefixes it with "Expand"/"Close".
   */
  label: string;
  /**
   * The card's own heading, which is not the caption — the same split
   * `Disclosure` documents: the caption names the target from the §7.7 index
   * ("Benefits and challenges of clotting replacement therapies") while the card
   * wears the figure's full title. Optional only because the one row without
   * content has no card to title yet.
   */
  title?: string;
  /** The card's second band line. See `Popup`'s own `subtitle`. */
  subtitle?: string;
  /**
   * What the `+` opens. Optional because it genuinely is: the last row is a
   * §7.7 target whose artboard has not landed, and it keeps the inert toggle
   * `DisclosureBand` documents rather than opening an empty card.
   */
  content?: ReactNode;
}

/**
 * The three blocks, each one prose + a reserved figure + a "Click here:" `+`.
 *
 * The first block shows **one** of its topic's four bullets. Bullets 2–4 are
 * §7.4 prophylaxis guidance ("recommended over episodic…", "greatly reduces
 * bleeding risk…", "…even for FVIII plasma levels ≥2 IU/dL") that belong to a
 * different chapter, so they stay in the data module and this page slices them
 * off. The other two blocks render their topic's `body` whole.
 */
const ROWS: readonly [Row, Row, Row] = [
  {
    heading: "Clotting factor replacement:",
    bullets: CLOTTING.body.slice(0, 1),
    // The design drops "factor" — §7.7 and §7.4 both name the class in full —
    // but the artboard is the authority for on-screen copy, so it ships as
    // drawn and the wording is a question for the designer, not a silent fix.
    label: "Benefits and challenges of clotting replacement therapies",
    // The artboard sets this in caps and writes "AND"; the case is CSS and the
    // conjunction is copy, so "and" survives here and the casing follows §7.4's
    // own rendering of the same heading.
    title: "Benefits and Challenges Associated with Clotting Factor Replacement Therapies",
    subtitle: "(Options include SHL, EHL, and UHL FVIII/FIX products)",
    content: <BenefitsChallengesCard data={CLOTTING.benefitsChallenges!} image={bloodDropUrl} />,
  },
  {
    heading: "Non-factor therapies:",
    bullets: NFT.body,
    label: "Benefits and challenges of NFTs",
    // A data read where the clotting row above needs a literal: that card's
    // title is copy the source states nowhere else, while this one is its
    // topic's own title, which the artboard reproduces exactly. (The artboard
    // sets it in caps — CSS — and splits it as "NON- FACTOR", which is a stray
    // space in the drawing rather than a spelling this repo should learn.)
    title: NFT.title,
    // No subtitle: unlike §7.4, the artboard gives this card's band one line.
    // The class needs no scope qualifier — the two lists are about NFTs whole.
    content: <BenefitsChallengesCard data={NFT.benefitsChallenges!} image={bloodDropUrl} />,
  },
  {
    heading: "Personalized therapy for HA/HB:",
    bullets: PERSONALIZED.body,
    label: "Novel therapy classes for HA/HB",
    // The one card whose band is not its own subject: the artboard titles it
    // "TABLE 1" and nothing else. Shipped as drawn — the caption on the trigger
    // ("Novel therapy classes for HA/HB") is what tells a reader, and a screen
    // reader user who followed it, which table this is; substituting that
    // caption here would put copy in the band the designer did not draw. Raised
    // with the two wording items in docs/styling.md §11.
    title: "Table 1",
    content: <TreatmentOptionsTable />,
  },
];

export default function TreatmentLandscape() {
  /**
   * One open index rather than three booleans, and one `Popup` rather than one
   * per row — `DisclosureBand`'s model, adopted for its stated reason: two
   * modals at once is not a state the top layer should be asked to represent,
   * and that mutual exclusion is a fact about the group of rows, not about any
   * one button.
   *
   * The buttons are **controlled** as a direct consequence. Uncontrolled, a
   * `PopupButton` toggles its own `+`/`✕` — which was harmless while nothing
   * opened, but a card closed by ESC or by its own ✕ would leave the trigger
   * below it still showing ✕, with the two disagreeing about what is open.
   */
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const open = openIndex === null ? undefined : ROWS[openIndex];

  /**
   * The drop lives inside `open?.content`, so it is not in the DOM — and its
   * bytes are not requested — until the card is first clicked. Warmed from here
   * because this is the nearest scope that stays mounted, exactly as
   * `DiseaseBackground` warms its disclosure figures.
   *
   * The `width`/`height` attributes below already reserve the box without it, so
   * this buys the decode rather than the layout: it removes the beat of empty
   * space where the picture will be, not a resettle.
   */
  usePreloadImage(bloodDropUrl);

  return (
    <section aria-labelledby="chapter-heading">
      {/* Uppercase is CSS, not copy — the accessible name stays title-case, as
          on every other chapter. The string is the topic's own title, which the
          artboard reproduces exactly, so it is a data read and not a literal. */}
      <h1
        id="chapter-heading"
        className="font-display text-h1 tracking-wide text-brand-crimson-50 uppercase"
      >
        {LANDSCAPE.title}
      </h1>

      {/*
        Three rows of [prose | figure | disclosure], one grid rather than a
        prose column beside an independently-spaced rail: each block is paired
        with its own figure and its own `+`, and a shared grid is what keeps
        that pairing when a bullet is added or the viewport narrows.

        Track widths are the artboard's, measured at its 1440 canvas and stated
        as the residue of the content column: 1168 − 32 − 202 − 32 − 286 leaves
        the prose 616px, which puts the figure at x=760 and the caption's right
        edge on the column's own at x=1280. All three are `lg:` only — below
        that the grid collapses and DOM order stacks each row's three parts.

        `items-center` throughout: all three cells centre on their row's own
        height, so whichever of prose / figure / caption is tallest sets the
        row and the other two sit level with its middle. The artboard's own
        alignment is inconsistent — the first figure sits ~30px above its
        heading, the other two level with theirs — and one rule across three
        rows beats reproducing that as a per-row nudge.
      */}
      <div className="mt-8 grid gap-y-5 lg:grid-cols-[1fr_202px_286px] lg:items-center lg:gap-x-6">
        {ROWS.map((row, index) => (
          <Fragment key={row.heading}>
            <div>
              <h2 className="text-h2 font-bold tracking-wide text-black">{row.heading}</h2>
              <BulletList items={row.bullets} className="mt-4" />
            </div>

            {/*
              The figure that is not here yet — the in-page thumbnail, a
              separate gap from the pop-up this row now opens. CONTEXT.md §7.7
              marks all 24 §7 figures image-borne and these three have no asset,
              so the artboard's own "PLACEHOLDER" box ships as a reserved box:
              it holds the track open at the drawn 202×166 so dropping in an
              `ExpandableFigure` later does not re-cut the grid.

              Deliberately not an empty `<img>` — that announces itself as a
              broken image and takes an `alt` it has nothing to say in. An
              empty `<div>` is already invisible to assistive tech, so it
              needs no `aria-hidden` either.
            */}
            <div className="h-41.5 w-full max-w-50.5 border-4 border-black" />

            {/*
              Horizontal centring only — the row's `items-center` already
              places this block vertically, so the height floor and
              `justify-center` this carried under `items-start` would now both
              be inert.
            */}
            <div className="flex flex-col items-center">
              {/*
                Not `aria-controls`: a modal dialog lives in the top layer, so
                it is not a region of this page the button expands — the
                reasoning `DisclosureBand` records for its own triggers.
                Announced only on the row that will actually open something.
              */}
              <PopupButton
                label={row.label}
                open={openIndex === index}
                aria-haspopup={row.content ? "dialog" : undefined}
                onClick={(next) => setOpenIndex(next ? index : null)}
              />
              <p className="mt-4 text-center text-h3 font-bold text-popup-caption">{row.label}</p>
            </div>
          </Fragment>
        ))}
      </div>

      {/*
        Mounted unconditionally: the effect that calls `showModal()` needs the
        element already in the DOM, and the children it wraps are `undefined`
        while closed, so nothing renders early.

        `open` stays gated on the content existing rather than on a row being
        selected. All three rows now carry a card, so the two conditions agree
        today — but `Row.content` is optional precisely because a §7.7 target can
        land ahead of its artboard, and this is what keeps that row's `+` from
        summoning an empty card if one ever does again.
      */}
      <Popup
        open={open?.content !== undefined}
        title={open?.title ?? open?.label ?? ""}
        subtitle={open?.subtitle}
        onClose={() => setOpenIndex(null)}
      >
        {open?.content}
      </Popup>
    </section>
  );
}

/**
 * A `benefitsChallenges` pair as the §7.4 pop-up draws it: the two lists stacked
 * in a column, with a decorative figure beside them.
 *
 * A local function rather than a shared component, the shape `SeverityTable`
 * takes at the bottom of `DiseaseBackground` — both callers are `ROWS` entries
 * in this same file, and `benefitsChallenges` is authored on exactly two topics
 * in the data module, so a third is not coming and this has no reason to become
 * an import.
 *
 * Type is raw design values under §8's precedent: 20px body copy is off the
 * scale's `text-body` step, and `text-h4` is 20px but carries weight 600. The
 * headings do land on `text-h2` — they measure ~36px on the artboard, but that
 * number came off a raster rather than out of Figma, and a guessed raw value
 * reads to the next person as an authority it never had.
 */
function BenefitsChallengesCard({
  data,
  image,
}: {
  data: BenefitsChallenges;
  /**
   * The ornament beside the lists — `alt=""`, and the only §7 figure that gets
   * one. Every other is image-borne content where the description is the sole
   * route to what the diagram says (CONTEXT.md §7.7); this one carries nothing
   * the two lists do not, and announcing it would drop an ornament into the
   * middle of the reading order between "Benefits" and "Challenges".
   */
  image: string;
}) {
  return (
    <div className="flex items-center gap-8 py-6">
      <div className="min-w-0 flex-1">
        {/* `<h3>`: `Popup`'s band heading is the card's `<h2>`. */}
        <h3 className="text-h2 font-bold text-black">Benefits</h3>
        <BulletList items={data.benefits} className="mt-4 text-[20px] leading-[1.6]" />

        <h3 className="mt-6 text-h2 font-bold text-black">Challenges</h3>
        <BulletList items={data.challenges} className="mt-4 text-[20px] leading-[1.6]" />
      </div>

      {/*
        186px is the artboard's drawn width — about a third of the 552×1020
        asset, not the half `PopupFigure` uses, because this is ornament rather
        than a figure meant to be read at native size.

        The `width`/`height` attributes are here and absent from `PopupFigure`
        for a reason that does not carry across: there the width is `auto`, so
        the attributes would make it definite and fight a `max-height`. Here
        `w-46.5` makes it definite anyway, so the attributes are free and they
        reserve the exact box before a single byte arrives.

        `hidden md:block`: a decorative 342px-tall drop above the fold on a
        375px phone costs the reader the whole first screen before the word
        "Benefits".
      */}
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

/**
 * The five column headings, as drawn. Literals rather than keys derived from
 * `TreatmentOptionRow` — the artboard's own casing is uneven ("Treatment
 * options" against "Mechanism of Action"), which a humanised field name would
 * quietly regularise, and "Route of Administration" is not `route` under any
 * transformation.
 */
const MATRIX_COLUMNS = [
  "Treatment options",
  "Mechanism of Action",
  "Population",
  "Indication",
  "Route of Administration",
] as const;

/**
 * The markers the table actually uses, in the order they first appear, deduped.
 *
 * Derived rather than written out as `["a", "b", "c"]`: this is what makes a
 * marker with no footnote — or a footnote nothing points at — impossible to
 * ship. The keys and the rows are two halves of one fact, and only one of them
 * is allowed to state it.
 */
const USED_FOOTNOTES: readonly FootnoteKey[] = [
  ...new Set(
    TREATMENT_OPTIONS_MATRIX.map((row) => row.footnote).filter((key) => key !== undefined),
  ),
];

/**
 * Shared by the body's five cells. `align-middle` is the `<td>` default but not
 * the `<th>` one, and column 1 is a row header — without it the option name
 * would sit at the top of a four-line row while everything beside it centres.
 */
const MATRIX_CELL = "px-2 py-1.5 align-middle";

/**
 * The hairline between cells. Inferred, like `SeverityTable`'s: the export draws
 * a flat #A0A0A0 rule the palette has no token for, and `black/30` over the
 * body gradient resolves within a point of it — close enough that reproducing
 * the grey exactly would only buy a raw hex in a file that has none.
 */
const MATRIX_RULE = "border-black/30";

/**
 * `TREATMENT_OPTIONS_MATRIX` as the §7.7 "Table 1" pop-up draws it: five classes
 * against mechanism / population / indication / route, under one pale header
 * pill, with the markers resolved beneath.
 *
 * A local function beside `BenefitsChallengesCard`, the shape `SeverityTable`
 * takes in `disease-background` — one caller, one `ROWS` entry in this same
 * file, and a second is not coming.
 *
 * **A real `<table>`, and column 1 is a `<th scope="row">`.** Unlike the
 * severity card — whose pale bars read as pills and had to be argued back into a
 * table — this is a matrix on its face. What is worth stating is the row header:
 * "SC" in isolation means nothing, and `scope="row"` is what lets a screen
 * reader announce it as "Rebalancing: siRNA, Route of Administration, SC".
 *
 * `border-separate` with zero spacing, again as `SeverityTable`: it is what lets
 * the five header cells touch and share one `bg-white/50` bar while only the
 * outer two round, so the row paints as a single pill.
 *
 * Type is raw design values under §8's precedent, and the three sizes are
 * measured off the export rather than guessed: 20px headings, 16px in the three
 * middle columns, and 24px in the two outer ones — the drawing genuinely sets
 * the option name and the route larger than the prose between them. None of the
 * three lands on a scale step at the weight drawn (`text-h4` and `text-h3` both
 * carry 600 where this is 400), which is why they are stated raw.
 */
function TreatmentOptionsTable() {
  return (
    // `-mt-2` cancels `Popup`'s own `py-2` so the header pill meets the crimson
    // band, which is how the export draws it — flush at the top, inset at the
    // sides, so the pill reads as tucked under the band rather than floating
    // below it.
    <div>
      <table className="w-full table-fixed border-separate border-spacing-0 text-center text-black">
        <thead>
          <tr>
            {MATRIX_COLUMNS.map((column, index) => (
              <th
                key={column}
                scope="col"
                className={cn(
                  "bg-white/50 px-2 py-3 text-[22px] leading-tight font-normal",
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
            // Every cell of every row but the first carries the rule above it,
            // rather than the row below carrying one beneath: `border-separate`
            // does not collapse adjacent borders, so stating it on one side is
            // what keeps a single hairline between rows and none under the last.
            const rule = index > 0 && cn("border-t", MATRIX_RULE);
            const column = cn("border-l", MATRIX_RULE);

            return (
              <tr key={row.option}>
                <th
                  scope="row"
                  className={cn(MATRIX_CELL, "text-[22px] leading-tight font-normal", rule)}
                >
                  {row.option}
                  {row.footnote && <sup>{row.footnote}</sup>}
                </th>
                <td className={cn(MATRIX_CELL, "text-[16px] leading-tight", column, rule)}>
                  {row.moa}
                </td>
                <td className={cn(MATRIX_CELL, "text-[16px] leading-tight", column, rule)}>
                  {row.population}
                </td>
                <td className={cn(MATRIX_CELL, "text-[16px] leading-tight", column, rule)}>
                  {/* Stacked, not joined: the two indications on the first row
                      are separate statements in the export, which is why
                      `indication` is a list. `<span className="block">` rather
                      than a `<ul>` — a single-entry list on the other four rows
                      would announce "list of 1 item" four times over. */}
                  {row.indication.map((line) => (
                    <span key={line} className="block">
                      {line}
                    </span>
                  ))}
                </td>
                <td className={cn(MATRIX_CELL, "text-[22px] leading-tight", column, rule)}>
                  {row.route}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* `list-none` with the marker in the text: the letters are the join to
          the `<sup>`s above, so they are content, not a counter. An `<ol
          type="a">` would draw the same glyphs and let them drift from the keys
          the rows actually name.

          14px/300 is the export's, and so is `leading-none` — the block is set
          solid there. Both are raw for the usual reason: the scale's smallest
          step is 12px, and it carries weight 500. */}
      <ul className="mt-4 list-none text-[14px] leading-none font-light text-black">
        {USED_FOOTNOTES.map((key) => {
          const note = TREATMENT_OPTIONS_FOOTNOTES[key];

          return (
            <li key={key}>
              {key}. {typeof note === "string" ? note : note.text}
              {typeof note !== "string" && (
                <ul className="list-disc pl-10">
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
