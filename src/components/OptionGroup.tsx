import { cn } from "../lib/cn";

export interface Option<T extends string> {
  id: T;
  label: string;
}

interface OptionGroupProps<T extends string> {
  /** The question, rendered as the group's `<legend>`. Sentence case; shouted in CSS. */
  legend: string;
  /** The radio `name`. Must be unique on the page — it is what groups the inputs. */
  name: string;
  options: Option<T>[];
  /** The chosen option, or `null` when the group is unanswered. */
  value: T | null;
  /** Fires with the chosen id, or with `null` when the choice is cleared. */
  onChange: (value: T | null) => void;
  /** Extra classes for the option labels — the wizard shouts YES/NO with it. */
  optionClassName?: string;
  className?: string;
}

/**
 * One wizard question: a legend over a 2-column grid of wide pills, exactly one
 * of which can be chosen — and can be un-chosen by picking it again.
 *
 * This is issue 03's `RadioCard`, built skinned rather than headless and renamed
 * for what it is. Both departures follow `Popup`'s precedent (issue 03's own
 * comment): the design arrived before the primitive did, so there is nothing to
 * defer, and splitting a skin with one consumer off its behaviour buys a seam
 * and no reuse. "Card" describes nothing about a 425 × 56 pill.
 *
 * **Real `<input type="radio">`, visually hidden behind their labels.** The
 * platform then owns arrow-key navigation inside the group, the
 * one-selection-per-`name` rule, and the "radio button, 2 of 4, selected"
 * announcement — none of which we write or test. What it does not own is
 * clearing: a checked radio cannot be unchecked by the user, so the `onClick`
 * below adds it.
 *
 * The skin mirrors `mlg-components`' `Button` by referencing its tokens rather
 * than copying its colours, so the buttons on this page cannot drift from the
 * ones beside them (docs/styling.md §14).
 */
export default function OptionGroup<T extends string>({
  legend,
  name,
  options,
  value,
  onChange,
  optionClassName,
  className,
}: OptionGroupProps<T>) {
  /**
   * Once this group is answered, its unchosen options recede. Scoped to the
   * group, not the page: an unanswered question below stays bright, which is
   * what marks it as still to do. Both artboard frames are consistent with this
   * — one has nothing chosen anywhere, the other has all three answered.
   */
  const answered = value !== null;

  return (
    /*
      Capped near the pill block's own width and centred, rather than left to
      fill the content column: the artboard's third question breaks across two
      lines ("WHAT IS THE PRIMARY REASON FOR / CONSIDERING A TREATMENT OPTION?"),
      which only happens if the legend is measured against the buttons under it.
      At the column's full 1168px it sets on one line and the block loses the
      shape the design draws.

      `max-w-225` is 900px against the artboard's drawn 870 — a whole spacing
      step in place of the measured value, taken when the arbitrary values in
      this file were moved onto the scale. The 30px is spent on the pills (see
      the grid below); the line break this cap exists to protect is governed by
      the legend's own narrower cap and is unaffected.

      **`max-w-110` below `lg` is that same block with one column in it, and it
      is the drawn pill rather than a new number**: 440px is exactly what
      `(900 − 20) / 2` gives, i.e. what a pill measures at the canvas. So below
      the breakpoint the block is not a shrunken artboard — it is one column of
      full-size pills, centred (docs/styling.md §14). Uncapped it would stretch a
      153px label across a 752px pill at `lg`; capped, an element that leaves a
      grid keeps its drawn width and takes `mx-auto`, which is what §11's
      `disease-background` figure does for the same reason.

      `min-w-0` because a `<fieldset>` carries `min-inline-size: min-content` in
      the UA stylesheet, which Tailwind's preflight does not reset — without it
      the grid inside refuses to shrink below its widest label and the page
      scrolls sideways on a phone.
    */
    <fieldset className={cn("mx-auto max-w-110 min-w-0 lg:max-w-225", className)}>
      {/*
        32px bold uppercase in teal-75, measured off the artboard (cap height 23
        on the 1440 canvas ÷ DM Sans' 0.70 cap ratio = 33px, i.e. `text-3xl`).
        `w-full text-center` because a legend is inline-ish by default and the
        artboard centres each question over its buttons.

        `max-w-[700px]` is what reproduces the third question's drawn line break
        — "WHAT IS THE PRIMARY REASON FOR / CONSIDERING A TREATMENT OPTION?" —
        without hard-coding it into the copy, the same device `WizardIntro` uses
        on its hero. The drawn first line measures 589px and adding the next word
        would run to ~809px, so any cap between those two breaks where the
        designer did; 700 is the midpoint of that window, i.e. the setting least
        likely to flip a line if the font rounds differently than measured. The
        other two questions are far shorter and unaffected.

        **The type steps down one size below `lg`, which is §2's app-wide rule,
        and the cap needs no ramp to follow it** — 700px is inert down there,
        because the fieldset above is 440px wide and clamps it. That window
        scales with the type: at 20px it is 368–506px, whose midpoint is 437 —
        i.e. the block's own 440 lands 3px off the setting that reproduces the
        designer's break, without anything being chosen for it. Below `sm` the
        column is narrower than the window (311px at 375) and the question sets
        in three lines; nothing else can be done from here, and nothing overflows
        — the longest word, CONSIDERING, is ~137px at 20px against a 256px column
        at 320.

        `mb-2.5` is the 10px the artboard leaves between the legend's baseline
        and the pills: ink-to-ink measures 15px, which is that gap once the line
        box's descender space is taken off (docs/styling.md §11).
      */}
      <legend className="mx-auto mb-2.5 w-full max-w-175 text-center font-sans text-xl font-bold text-brand-teal-75 uppercase lg:text-3xl">
        {legend}
      </legend>

      {/*
        The artboard draws two 425px columns 20px apart, rows 16px apart, in a
        870px block. Fluid rather than fixed: that width only fits at the design
        canvas (at 1024px the shell's content box is 752px wide), so the grid
        takes what the fieldset gives it and shrinks below that.

        Which means the pills are **440 × 56 at 1440, not the drawn 425 × 56** —
        the fieldset's cap rounded up to 900 and the two columns split the extra
        30px between them. The row is still two equal pills 20px apart, which is
        what the design is saying; it is 15px wider per pill than it was drawn.

        **Two columns from `lg`, where it was `md` until 2026-08-04.** The split
        is not a comfort call — it is where a two-column row can hold the label
        the design sized the pill around. At `md` the content column is 672px, so
        two pills are 326 wide and 278 inside their padding, against a longest
        label of 369px at the drawn type: the reason grid shipped with one pill
        set in two lines and its whole row 84px tall rather than 56. `lg` gives
        752 / 366 / 318, which holds it at the stepped-down 20px (~308px) — and
        that is the same "move the split to where the composition fits" call §11
        records for `disease-background` and `treatment-landscape`, one
        breakpoint lower because this block pays for it in a wrap rather than in
        a 250px prose column.
      */}
      <div className="grid grid-cols-1 gap-x-5 gap-y-4 lg:grid-cols-2">
        {options.map((option) => {
          const selected = value === option.id;

          return (
            <label
              key={option.id}
              className={cn(
                /*
                  `min-h-14` (56px), not `h-14`: a label that wraps in a narrower
                  column has to grow the pill rather than overflow it.

                  It is also what holds the drawn 56px now that the padding is
                  `py-3`. 24px type in a 30px line box on the artboard's 13px of
                  padding came to exactly 56; on 12px it comes to 54, and the
                  minimum floors it back to 56. Same pill, arrived at by the
                  `min-h` rather than by the padding adding up.

                  The design's own line box is 20px, and it is deliberately NOT
                  used, for the reason the package's `Button` records about its
                  own: at this size a 20px box makes wrapped lines collide, and
                  wrapping is exactly what a narrow column does to these labels.
                  `leading-tight` (30px) costs nothing where the design applies —
                  the padding absorbs it and the pill is still 56px — and only
                  shows up in the case the artboard does not draw. `break-words`
                  is its companion, since a fixed-width design relies on `nowrap`
                  and this one does not. Stated once, it covers all three type
                  steps below: a Tailwind v4 `leading-*` sets `--tw-leading` and
                  each `text-<size>` reads it back, so the ratio holds and the
                  padding plus the minimum keep the pill 56px at every width.

                  **24px, where the package's `Button` is 26.** Cap height alone
                  cannot separate the two at this size, so it was settled by
                  matching rendered string widths against the export's ink:
                  "Hemophilia A" measures 153px drawn and renders at 153px here,
                  "Reduce monitoring requirement" 365 against 369 — where 26px
                  gives 166 and 400, i.e. a longest label that no longer fits the
                  425px pill on one line. Submit keeps the package's 26px, which
                  its own label measures at (173 drawn, 176 rendered).

                  Side padding is `px-6`, not the 30px the export measures. The
                  pill is fixed-width and the label centred, so the padding is
                  breathing room rather than geometry — and 30px would leave the
                  longest label exactly 365px of a 369px render, i.e. wrapping on
                  a 4px difference between this font's metrics and the export's.
                  24px keeps it on one line as drawn, with room to spare.

                  **The type ramps on three steps, and it follows the pill's own
                  width rather than the viewport's** — which is why it is not the
                  single step below `lg` that the legend above and every chapter
                  heading take. The pill is 440px wide below `lg` (one column at
                  the drawn width), 366 at `lg` (two share the 752px column) and
                  440 again from `xl`, so what the label has to fit is 392 / 318
                  / 392 inside the padding:

                    Viewport  Column  Cols  Pill  Inside  Type  Longest label
                    320          256     1   256     208    16   246 → 2 lines
                    375          311     1   311     263    16            246
                    640          544     1   440     392    16            246
                    1024         752     2   366     318    20           ~308
                    1280        1008     2   440     392    24            369
                    1440        1168     2   440     392    24            369

                  The base step is set by the phone rather than by the block, as
                  §2's `<h1>` rule is: 440px would hold the drawn 24px outright,
                  but 375 gives the pill 263px inside and only 16px keeps
                  "Reduce monitoring requirement" on one line there. 320 is
                  past what any step on the scale can hold — 246 against 208 —
                  and takes two lines, which is what `min-h-14` and the line box
                  above exist for.
                */
                "flex min-h-14 cursor-pointer items-center justify-center rounded-lg px-6 py-3",
                "text-center text-base leading-tight font-semibold wrap-break-word lg:text-xl xl:text-2xl",
                "shadow-ui-btn transition-[background-color,color] duration-120 ease-out",
                /*
                  Three resting skins, two of them the package's own:

                  - untouched group → `Button`'s resting skin (crimson-50/white);
                  - chosen → teal-75 on white, the one colour the artboard adds;
                  - passed over → `Button`'s PRESS skin (crimson-75 + #939393),
                    reused as a resting state. That is the artboard's own reading,
                    measured off both exports, not an approximation of it.

                  Hover and press are undrawn — the artboard has two frames, both
                  at rest — so they follow the model the Button skin states: the
                  ground LIFTS on hover and PUSHES one step darker on press. The
                  press moves the GROUND only; the label keeps its hover colour,
                  because every press here releases into the chosen skin's white,
                  and a 120ms dip to #939393 between two light frames reads as a
                  blink on each click.

                  Hover on a passed-over option lifts it back to the resting skin
                  ("you can pick me"), which is the one invented behaviour here.
                  Its press is then the same declaration as the untouched one's,
                  and lands on the ground it already rests at — i.e. pressing it
                  drops the hover lift, which is exactly the press it should be.
                */
                selected &&
                  "bg-choice-selected text-ui-btn-fg hover:bg-choice-selected-hover active:bg-choice-selected-active",
                !selected &&
                  answered &&
                  "bg-ui-btn-bg-active text-ui-btn-fg-active hover:bg-ui-btn-bg hover:text-ui-btn-fg",
                !selected &&
                  !answered &&
                  "bg-ui-btn-bg text-ui-btn-fg hover:bg-ui-btn-bg-hover hover:text-ui-btn-fg-hover",
                !selected && "active:bg-ui-btn-bg-active",
                /*
                  The focus ring is the input's, drawn on the label — the input
                  itself is `sr-only`, i.e. a 1px clip, so a ring on it would be
                  invisible. Inset (negative offset) and inside the pill, for the
                  reason the package records: drawn outside, a ring tinted
                  `--color-ui-btn-ring` disappears against a dark ground.

                  `has-[:focus-visible]` and NOT `peer-focus-visible`: the input
                  is a CHILD of this label, and Tailwind compiles `peer-*` to a
                  sibling combinator, so the peer form matches nothing at all. It
                  fails silently — the class is in the markup and the outline
                  simply never paints — which is why this is verified in a browser
                  (docs/styling.md §14) rather than by asserting the class.
                */
                "has-focus-visible:outline-[3px] has-focus-visible:outline-offset-[-3px] has-focus-visible:outline-ui-btn-ring",
                optionClassName,
              )}
            >
              <input
                type="radio"
                name={name}
                value={option.id}
                checked={selected}
                onChange={() => onChange(option.id)}
                /*
                  The deselect. `change` fires before `click`, and only when the
                  checked option actually moves — so on a fresh pick `selected`
                  is still the pre-click value here and this does nothing, while
                  a click on the already-chosen option fires no `change` at all
                  and lands here to clear it. Arrow-key moves also synthesise a
                  click, on the NEWLY selected input, so they cannot self-clear.

                  It rides `click` rather than `pointerdown` so the keyboard gets
                  it for free: Space on a focused radio dispatches a click.
                */
                onClick={() => {
                  if (selected) onChange(null);
                }}
                className="sr-only"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
