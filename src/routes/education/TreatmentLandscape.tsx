import { Fragment } from "react";
import { PopupButton } from "mlg-components";

import BulletList from "../../components/BulletList";
import { type Bullet, topicById } from "../../data/education";

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
  },
  {
    heading: "Non-factor therapies:",
    bullets: NFT.body,
    label: "Benefits and challenges of NFTs",
  },
  {
    heading: "Personalized therapy for HA/HB:",
    bullets: PERSONALIZED.body,
    label: "Novel therapy classes for HA/HB",
  },
];

export default function TreatmentLandscape() {
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
        {ROWS.map((row) => (
          <Fragment key={row.heading}>
            <div>
              <h2 className="text-h2 font-bold tracking-wide text-black">{row.heading}</h2>
              <BulletList items={row.bullets} className="mt-4" />
            </div>

            {/*
              The figure that is not here yet. CONTEXT.md §7.7 marks all 24
              §7 figures image-borne and these three have no asset, so the
              artboard's own "PLACEHOLDER" box ships as a reserved box: it
              holds the track open at the drawn 202×166 so dropping in an
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
                Uncontrolled — `PopupButton` manages its own toggle, and there
                is nothing yet for the chapter to control it against. No
                `aria-haspopup="dialog"` for the same reason `DisclosureBand`
                makes it conditional: it is announced only where something will
                actually open. Both become the chapter's business when the
                pop-up content lands.
              */}
              <PopupButton label={row.label} />
              <p className="mt-4 text-center text-h3 font-bold text-popup-caption">{row.label}</p>
            </div>
          </Fragment>
        ))}
      </div>
    </section>
  );
}
