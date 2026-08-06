import { Fragment, type ReactNode, useState } from "react";
import { PopupButton } from "mlg-components";

import bloodDropUrl from "../../assets/images/blood_drop.webp";
import BulletList from "../../components/BulletList";
import Popup, { type PopupWidth } from "../../components/Popup";
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
   * Which step of `Popup`'s width scale this row's card wears. Per-row rather
   * than per-page because the three rows share one `Popup` — the width is a
   * property of what is open, so it travels with the row like `title` does.
   * Absent means `Popup`'s own `default`.
   */
  width?: PopupWidth;
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
    width: "narrow",
    content: <BenefitsChallengesCard data={NFT.benefitsChallenges!} image={bloodDropUrl} />,
  },
  {
    heading: "Personalized therapy for HA/HB:",
    bullets: PERSONALIZED.body,
    label: "Novel Therapies for HA/HB",
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
        // `text-5xl` from `lg` only, app-wide (docs/styling.md §2). This is the
        // one chapter whose longest word (`HEMOPHILIA`, 234px) clears a 320px
        // column at 52px; it steps down with the rest so the four chapters do
        // not disagree about their own heading size.
        className="font-display text-3xl font-bold tracking-wide text-brand-crimson-50 uppercase lg:text-5xl"
      >
        {LANDSCAPE.title}
      </h1>

      {/*
        Three rows of [prose | figure | disclosure], one grid rather than a
        prose column beside an independently-spaced rail: each block is paired
        with its own figure and its own `+`, and a shared grid is what keeps
        that pairing when a bullet is added or the viewport narrows.

        Track widths are the artboard's, measured at its 1440 canvas and stated
        as the residue of the content column: 1168 − 24 − 200 − 24 − 300 leaves
        the prose 620px, which puts the figure at x=768 and the caption's right
        edge on the column's own at x=1280.

        **Three tracks from `xl`, not `lg`, since 2026-08-04**, which is the fix
        `disease-background` took the same day for the same cliff (§12): the
        gutter steps 48 → 112 at 1024, so the pixel that turns the fixed tracks
        on is the pixel that takes 175px away, and the prose column landed at
        752 − 48 − 500 = **204px**. It does not recover until 1280. The split now
        waits for the column that can hold it, and between 1024 and 1279 the
        chapter is a single 752px column — wider than the grid ever gave the
        prose there, so the stack is the better composition and not a fallback.

        **Two tracks in between**, which is what stops that stack running nine
        blocks deep to 1279: the prose spans the full width and the figure sits
        beside its own `+` underneath. Implicit placement does all of it — a
        `col-span-2` item takes a row of its own, so the next two fill the row
        below without a single explicit line number. Still one grid, so the
        pairing above is as true at 640 as at 1440.

        `sm` is invented, and stated as such per §12's rule: no canvas exists
        below 1440. It is where the arithmetic clears — 544 − 24 − 200 leaves the
        caption cell 320px, which holds a 65px `+` and three lines of `text-xl`
        with room over. Below it everything stacks, which is right for a phone.

        `items-center` from `xl`: all three cells centre on their row's own
        height, so whichever of prose / figure / caption is tallest sets the
        row and the other two sit level with its middle. The artboard's own
        alignment is inconsistent — the first figure sits ~30px above its
        heading, the other two level with theirs — and one rule across three
        rows beats reproducing that as a per-row nudge.

        The row gap ramps because the two-up gives it a second job. At `xl` it
        separates three rows and nothing else; below, it separates a row's prose
        from a row's own figure *as well as* row from row, so at one value the
        three blocks stop reading as three. 40/20 is this page's own, not part of
        §11's eight — those are 1440 gaps deliberately left unramped pending one
        one-screen rule, and this one does not exist at 1440.
      */}
      {/* 12.5rem / 18.75rem === the drawn 200px / 300px at a 16px root, so the
          canvas is unchanged; as px these tracks held still while the `1fr` grew
          above 1440 and the three-column ratio drifted (docs/styling.md §19). */}
      <div className="mt-8 grid gap-y-10 sm:grid-cols-[12.5rem_1fr] sm:gap-x-6 xl:grid-cols-[1fr_12.5rem_18.75rem] xl:items-center xl:gap-y-5">
        {ROWS.map((row, index) => (
          <Fragment key={row.heading}>
            {/*
              Full width wherever the grid has two tracks, its own track at
              `xl`. `col-span-2` is what puts the figure and the `+` on the row
              beneath rather than beside the prose — see the grid's comment.
            */}
            <div className="sm:col-span-2 xl:col-span-1">
              {/* One step down below `lg`, the ramp §11 records for every
                  chapter's sub-headings. At 30px in a 311px phone column the
                  hierarchy collapses onto the 16px body size; one step
                  restores it. `lg`, not `xl` — this is §2's app-wide type
                  ramp, which is a different question from where the grid
                  turns on and is answered at a different breakpoint. */}
              <h2 className="text-2xl font-bold tracking-wide text-black lg:text-3xl">
                {row.heading}
              </h2>
              {/* Body copy is the one thing that does not ramp: 16px is a
                  legibility floor and open item 9 records the reference as
                  ~18px, so there is nowhere down to go. */}
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

              **Neither dimension ramps.** The box exists to hold the track open
              at the drawn size so dropping in a real asset does not re-cut the
              grid, and a smaller reserved box reserves the wrong thing. 200px
              is 64% of a 311px phone column, which is wide but not crowding.

              `mx-auto` needs no variant: from `sm` up the box's track is
              exactly 200px, so the auto margins resolve to zero and the class
              is inert. It does its whole job in the phone stack, where
              `max-w-50` would otherwise leave 111px of dead column beside it —
              the same left-flush problem §11 records for `disease-background`'s
              figure, which needs `xl:mx-0` only because its own track is wider
              than the box.
            */}
            {/* `border-[0.25rem]` not `border-4`: the numeric utility is px and
                would pin the outline while the box scales (§19). Editors will
                offer to "canonicalise" it — decline. */}
            <div className="mx-auto h-41.5 w-full max-w-50 border-[0.25rem] border-black" />

            {/*
              Horizontal centring only — the row's `items-center` already
              places this block vertically, so the height floor and
              `justify-center` this carried under `items-start` would now both
              be inert.

              The `+` itself does not ramp. `PopupButton` ships one fixed 65px
              scale and it is the drawn one; `CLOSE_BUTTON_SIZE` exists for the
              ✕ that *closes* a modal, whose ramp was driven by crowding inside
              a 345px band (§13). Nothing crowds this one — it has a 320px cell
              at 640 and a whole 311px column on a phone — and 65px is a
              generous touch target for the page's primary affordance.
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
              {/* One step down below `lg`, matching `DisclosureBand`'s own
                  caption ramp so the four chapters agree (§11). */}
              <p className="mt-4 text-center text-xl font-bold text-popup-caption lg:text-2xl">
                {row.label}
              </p>
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
        width={open?.width}
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
 * scale's `text-base` step, and `text-xl` is 20px but carries weight 600. The
 * headings do land on `text-3xl` — they measure ~36px on the artboard, but that
 * number came off a raster rather than out of Figma, and a guessed raw value
 * reads to the next person as an authority it never had.
 *
 * **Both sizes step down below `lg`, and the bullets' step is derived rather
 * than picked.** `Popup`'s card is `min(1140px, 92vw)` inside a `border-5` with
 * `px-4 sm:px-8 lg:px-16`, so at 375 the body is 345 − 10 − 32 = **303px** —
 * eight pixels *narrower* than the page's own 311px column, which sets 16px
 * bullets. A card cannot set larger body type than the page that opened it in a
 * narrower measure, which lands `text-base` exactly. The headings take the
 * page's own sub-heading ramp (§11).
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
        <h3 className="text-2xl font-bold text-black lg:text-3xl">Benefits</h3>
        <BulletList items={data.benefits} className="mt-4 text-base leading-[1.6] lg:text-xl" />

        <h3 className="mt-6 text-2xl font-bold text-black lg:text-3xl">Challenges</h3>
        <BulletList items={data.challenges} className="mt-4 text-base leading-[1.6] lg:text-xl" />
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
  "Treatment Options",
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
 * The two type ramps the table's five columns divide between — the outer pair
 * (option name, route) and the column headings take `MATRIX_LEAD`, the three
 * prose columns take `MATRIX_PROSE`.
 *
 * The export draws **22 / 16 / 22**: one larger size on the headings and both
 * outer columns, one smaller in the middle. So the drawing genuinely sets the
 * option name and the route larger than the prose between them, and the
 * distinction the ramp has to preserve is that one, not a three-way split.
 * (`769a354` rounded all three 22s onto the scale at `text-xl`, a 2px round
 * down; docs/styling.md §11 recorded this as "20 headings / 24 outer, no
 * rounding in any of them", which was wrong on both counts and is corrected
 * there.)
 *
 * One step down below `lg` for the reason `SeverityTable` steps: it is what
 * drops the per-column floor far enough for `min-w-165` to be the guard rather
 * than the common case. See the wrapper below.
 */
const MATRIX_LEAD = "text-base leading-tight lg:text-xl";
const MATRIX_PROSE = "text-sm leading-tight lg:text-base";

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
 * Type is `MATRIX_LEAD` and `MATRIX_PROSE` above, which is where the export's
 * two measured sizes and their ramp are recorded.
 *
 * **It scrolls sideways rather than reflowing**, which is `SeverityTable`'s
 * answer applied unchanged — open item 27 already calls that a precedent rather
 * than a one-off. `table-fixed` divides the body into five equal columns, so the
 * widest unbreakable token in *any* column sets the floor for all five, and here
 * that token is the heading "Administration" rather than anything in the data:
 * `/` and `-` are UAX-14 break opportunities, so "prophylaxis/treatment" and
 * "Long-term" both split, while "Administration" cannot.
 *
 * At 1440 the card body is 1002px = 200px a column and it fits outright. At 375
 * it is 303px = 60px a column and the words shred. The type step drops the
 * per-column floor from ~148px to ~132px, and `min-w-165` (660 = 5 × 132) holds
 * it when the card is narrower still.
 *
 * **The 660 is arithmetic off character counts, not a measurement**, and it is
 * the weakest number on this chapter — see open item 36. If the real advance is
 * wider, the words still break at 375; if narrower, the card scrolls further
 * than it needs to.
 *
 * The wrapper is a plain `div` and it holds the `<table>` alone. `overflow-x-auto`
 * on a table box does nothing — a table is not a scroll container — and the
 * footnotes below are prose that wraps fine, so dragging them sideways with the
 * grid would be a scroll region doing a job nobody asked for.
 *
 * Restacking into five labelled blocks on a phone was the alternative and is
 * rejected for §11's reason: it flattens the column association at exactly the
 * width where it matters most, and that association — `scope="row"` letting a
 * screen reader announce "Rebalancing: siRNA, Route of Administration, SC" — is
 * why this is a real `<table>` at all.
 */
function TreatmentOptionsTable() {
  return (
    // `-mt-2` cancels `Popup`'s own `py-2` so the header pill meets the crimson
    // band, which is how the export draws it — flush at the top, inset at the
    // sides, so the pill reads as tucked under the band rather than floating
    // below it.
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
              // Every cell of every row but the first carries the rule above it,
              // rather than the row below carrying one beneath: `border-separate`
              // does not collapse adjacent borders, so stating it on one side is
              // what keeps a single hairline between rows and none under the last.
              const rule = index > 0 && cn("border-t", MATRIX_RULE);
              const column = cn("border-l", MATRIX_RULE);

              return (
                <tr key={row.option}>
                  <th scope="row" className={cn(MATRIX_CELL, MATRIX_LEAD, "font-normal", rule)}>
                    {row.option}
                    {row.footnote && <sup>{row.footnote}</sup>}
                  </th>
                  <td className={cn(MATRIX_CELL, MATRIX_PROSE, column, rule)}>{row.moa}</td>
                  <td className={cn(MATRIX_CELL, MATRIX_PROSE, column, rule)}>{row.population}</td>
                  <td className={cn(MATRIX_CELL, MATRIX_PROSE, column, rule)}>
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
                  <td className={cn(MATRIX_CELL, MATRIX_LEAD, column, rule)}>{row.route}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* `list-none` with the marker in the text: the letters are the join to
          the `<sup>`s above, so they are content, not a counter. An `<ol
          type="a">` would draw the same glyphs and let them drift from the keys
          the rows actually name.

          14px/300 is the export's, and so is `leading-none` — the block is set
          solid there. Both are raw for the usual reason: the scale's smallest
          step is 12px, and it carries weight 500.

          **Deliberately not ramped, and it is the one thing on this chapter the
          2026-08-04 responsive pass left broken.** `leading-none` is only
          defensible for a line that never wraps, and footnote (a) is ~150
          characters — roughly 1100px at 14px against a 1002px body — so it
          already wraps to two touching lines *at 1440*, before any of this. That
          makes it a transcription question rather than a responsive one, and
          fixing it here would change the drawn composition at the drawn width
          without the designer. Raised as open item 37 instead; at 375 it sets
          about nine solid lines, which is the cost of holding that line. */}
      <ul className="mt-4 list-none text-sm leading-none font-light text-black">
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
