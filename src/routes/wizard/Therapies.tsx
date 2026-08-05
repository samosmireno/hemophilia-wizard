import { useId, useState } from "react";
import { PopupButton } from "mlg-components";

import ArchBand from "../../components/ArchBand";
import BulletList from "../../components/BulletList";
import DrugSheetPopup from "../../components/DrugSheetPopup";
import { SWITCH_REASONS, recommend, type NoteBlock } from "../../data/wizard";
import { cn } from "../../lib/cn";
import { isComplete, useWizardAnswers } from "../../state/wizardAnswers";

/**
 * `/wizard/therapies` — the wizard's leaf (CONTEXT.md §4.1–4.2).
 *
 * Everything on it is `recommend(type, hasInhibitors, reason)`: the reason as the
 * heading, this (scenario, reason)'s Considerations and Strategies note pair as a
 * two-header accordion, and the scenario's curated agent list in the arch below.
 * Nothing is composed beyond that call — the notes are scenario-specific, not
 * shared per reason, which is the correction CONTEXT.md §4.2 records.
 *
 * **Each `+` opens that agent's §6 information sheet** — `DrugSheetPopup`, which
 * owns the card and is handed the agent name this page already has. All six
 * recommendable agents have a sheet, so every button on every one of the sixteen
 * leaves opens one and every button says so with `aria-haspopup`.
 *
 * That settles the routing question this file used to defer: issue 10 specified a
 * `?drug=<id>` overlay, and `docs/adr/0006-component-state-drug-sheets.md` records
 * why it is component state instead — the short version being that `WizardGate`
 * would bounce a refreshed deep link off this very page.
 *
 * Reachable only with all three answers: `WizardGate` sends an incomplete
 * session back to `/wizard`.
 */

/**
 * The two blocks, in the order the artboard stacks them. A tuple of literals
 * rather than a boolean, because the open one is named in the state below and
 * `"strategies"` reads at the call site where `true` would not.
 */
type BlockId = "considerations" | "strategies";

export default function Therapies() {
  const { answers } = useWizardAnswers();

  /**
   * Which block is open. **Exactly one always is** — see
   * `docs/adr/0005-one-open-leaf-accordion.md`: the source annotation calls these
   * "2 buttons or tabs", both artboards draw one open, and a both-closed state
   * would leave the learner able to hide the whole leaf's clinical copy with one
   * click on a page whose other half is a list of drug names.
   *
   * Component-local, so it resets to Considerations on remount. The session
   * store holds the three answers and deliberately nothing derived from them
   * (ADR 0003), and which of two blocks was last open is not a patient
   * characteristic.
   *
   * Declared before the completeness guard below: hooks cannot sit after an
   * early return.
   */
  const [open, setOpen] = useState<BlockId>("considerations");

  /**
   * Which agent's sheet is open, and therefore which `+` is showing its ✕. One
   * agent name rather than a boolean per button, which is `DisclosureBand`'s move
   * for its stated reason: two open at once is not a state worth being able to
   * represent, and one dialog is all the top layer should be asked to hold.
   *
   * The name itself is the key — `DrugSheetPopup` looks the sheet up by it — so
   * there is no id scheme between this page and `DRUG_SHEETS`, the same join
   * `Treatment.agent` and `AGENTS` already share.
   */
  const [openAgent, setOpenAgent] = useState<string | null>(null);

  /**
   * The guard is `WizardGate`'s, not this component's — but the compiler cannot
   * see through a layout route, so the narrowing has to be restated where the
   * three answers are read. Unreachable in the app: reaching this render at all
   * means the gate already let the session past.
   */
  if (!isComplete(answers)) return null;

  const { note, recommendations } = recommend(answers.type, answers.hasInhibitors, answers.reason);

  /**
   * Non-null because `answers.reason` is a `SwitchReason`, and `SWITCH_REASONS`
   * is that union's own enumeration — the lookup is total by construction.
   *
   * The page needs BOTH of its labels, which is the whole reason they are two
   * fields: the `<h1>` is the artboard's imperative `label` ("Improve bleeding
   * control"), and the arch's sentence is the blueprint's gerund `sourceLabel`
   * ("…if Improving bleeding control is the primary reason…"), because that
   * sentence is the source's and is written against the source's phrasing.
   */
  const reason = SWITCH_REASONS.find((r) => r.id === answers.reason)!;

  return (
    <section aria-labelledby="wizard-therapies-heading" className="flex flex-1 flex-col lg:-mr-16">
      {/*
        Uppercase is CSS, not copy — the accessible name stays the sentence case
        the artboard was written in, as on every chapter and on the two wizard
        screens before this one.
      */}
      <h1
        id="wizard-therapies-heading"
        // `text-5xl` from `lg` only, app-wide (docs/styling.md §2). `REQUIREMENT`
        // — from the fourth switch reason — sets 272px at 52px, which clears a
        // 375px column and overflows a 320px one.
        className="font-display text-3xl font-bold tracking-wide text-brand-crimson-50 uppercase lg:text-5xl"
      >
        {reason.label}
      </h1>

      {/*
        `mt-3` (12px), where every education chapter and `/wizard/scenario` use
        `mt-8` (32px) after their `<h1>`. Measured, not inherited: the artboard
        puts the first band's top edge at y=120 against an `<h1>` whose line box
        bottoms out around 108. This screen packs its heading onto the accordion
        in a way the prose screens do not, and the 32px gap they share is a fact
        about a heading over prose rather than about headings.
      */}
      <div className="mt-3">
        <NoteDisclosure
          block={note.considerations}
          open={open === "considerations"}
          onOpen={() => setOpen("considerations")}
        />
        <NoteDisclosure
          block={note.strategies}
          open={open === "strategies"}
          onOpen={() => setOpen("strategies")}
          last
        />
      </div>

      {/*
        `max-w-215` (860px) is a LINE-BREAK cap, not styling. The artboard breaks
        this sentence after "…IS" — line 1 measures 809px of ink — and the
        content column is 1168px, wide enough to pull "THE" up and break it
        somewhere else entirely. 860 is inside the window that reproduces the
        drawn break (≥809 to hold line 1, under ~895 before "THE" fits beside it)
        and is the nearest scale step in it. `mx-auto` because a capped block
        inside a centred heading would otherwise sit left.

        `leading-none` because the artboard sets this heading's two lines at a
        32px pitch, where `text-3xl`'s own step is 1.1 (35.2px). Measured off the
        export's ink twice — cap tops at y=594 and y=626 — and it only shows up
        here because `DisclosureBand`'s titles are phrases that never reach a
        second line.

        **It survives `ArchBand`'s new 24 → 30 step at `lg` without being
        restated**, which was worth checking rather than assuming: a Tailwind v4
        `leading-*` sets `--tw-leading` and every `text-<size>` resolves its
        line-height through that property, so the step reads the 1.0 rather than
        replacing it — and a custom property is not scoped to the media query
        the step arrives in. Verified in the built CSS. It is a slash modifier
        that would need restating at each step; see `Popup`'s title.

        The sentence itself is the blueprint's, verbatim from CONTEXT.md §4.2,
        with the reason interpolated in its `sourceLabel` form.

        `mt-auto grow-0` is what pins the arch to the bottom of the column — see
        `ArchBand`'s `className`, and the two artboards that put its top edge at
        the same y with panels of very different heights above it.
      */}
      <ArchBand
        title={`Novel therapies to consider if ${reason.sourceLabel} is the primary reason for switching therapies:`}
        titleClassName="mx-auto max-w-215 leading-none"
        className="mt-auto grow-0"
      >
        {/*
          Equal-width items at an equal gap, which is what makes the BUTTON
          centres evenly spaced — the thing the artboard actually draws. Its
          three land at 427 / 720 / 1015 on a band running 112→1328, i.e. a pitch
          of 294 on 1216, or 0.2415 of the band. On this page's 1168 column that
          is 282, and `w-40` + `gap-x-30` gives 280.

          The equal width is load-bearing, not decoration: the three captions
          measure 137 / 143 / 95px, so a row of content-width items would space
          their buttons 322 and 301 apart rather than 293 and 295. It also makes
          `gap-x-30` the same value `/wizard/scenario` uses between its boxes.

          **Five agents do not fit at the drawn pitch** — 5 × 160 + 4 × 120 is
          1280 against a 1232 band — and the designer drew no such leaf, so the
          GAP gives rather than the item. That direction matters: the item is what
          carries the caption, and letting it collapse instead is what clipped
          "Emicizumab" and "Fitusiran" against the arch wall. Measured, before:
          five items fell to 150px at 1440, 118px at 1280 and 67px at 1024 while
          the gap sat at its drawn 120 throughout, so the captions overflowed
          their own boxes by up to 38px a side and the outermost ones ran past the
          arch into its `overflow-hidden`.

          Three things now stop that, and none of them touches the drawn case:

          - **`gap-x-20` above three agents**, `gap-x-30` at or below. The 120px
            pitch is measured off a THREE-agent artboard, so it stays exactly that
            wherever the designer drew it; the fuller rows the designer never drew
            close up to 80 instead. 5 × 160 + 4 × 80 = 1120 fits 1232 with no
            compression at all.
          - **No `min-w-0`.** It was there to let items shrink past their content,
            which is precisely the licence that produced the clipping. Without it
            an item's automatic minimum size is its min-content — and every caption
            is a single word, so the floor IS the caption. An item can still give
            from 160 down to its own text and not one pixel further.
          - **`xl:` rather than `lg:` for nowrap**, because below 1280 even the
            closed-up row cannot hold five captions on one line. There the wrap
            takes over, which is legible where a clipped word is not.

          `px-4` keeps the row off the arch wall in the wrapped case. Together
          that is still `/wizard/scenario`'s `shrink-0` / `shrink` split, just
          hinged one breakpoint later.
        */}
        <ul
          className={cn(
            "mt-5 flex flex-wrap justify-center gap-y-10 px-4 pb-6 xl:flex-nowrap",
            recommendations.length > 3 ? "gap-x-20" : "gap-x-30",
          )}
        >
          {recommendations.map((treatment) => (
            <li
              key={treatment.agent}
              className="flex w-40 shrink-0 flex-col items-center xl:shrink"
            >
              <PopupButton
                label={treatment.agent}
                // Not `aria-controls`: a modal dialog lives in the top layer, so
                // it is not a region of this page the button expands, and the
                // pattern for a control that summons one is `aria-haspopup`.
                // Unconditional here where the chapters make it conditional —
                // every agent `recommend()` can name has a sheet, which
                // `content.test.ts` asserts rather than assumes.
                aria-haspopup="dialog"
                open={openAgent === treatment.agent}
                onClick={(next) => setOpenAgent(next ? treatment.agent : null)}
              />
              {/*
                `brand-slate-100`, NOT `--color-popup-caption` — and this is a
                measurement, not a preference. The drawn caption's darkest pixel
                is (17,29,46), which is slate-100 exactly; the education
                chapters' captions sample (7,70,85), which is what
                `--color-popup-caption` was derived to hit. The two bands wear
                different caption colours, and `education/fviiia-mimetics`
                already records slate-100 arriving "new and exact" on a fourth
                artboard. Transcribed, per the §3/§4 rule.

                22px against the chapters' 26px, and both are the designer's:
                the drawn caption inks 16px tall, and the rendered string
                measures 133/139/92px against the export's 137/143/95 — inside
                the ~4px this font runs narrower than the export, which is the
                same discrepancy `OptionGroup`'s pill labels record.

                `mt-3` (12px), not `DisclosureBand`'s `mt-4`: the drawn caption
                inks 21px below the button, and 16px puts it at 24.

                **It is the one thing on this page that does not take §2's step,
                and that is a decision rather than an omission.** Every other
                element here steps because the viewport moves something about it;
                nothing about this one moves. The item is `w-40` at every width
                and fits even the 224px a 320px phone leaves inside the row's
                `px-4`, `PopupButton` is a fixed 65px `shrink-0` from the
                package, and the captions are single words that never wrap and
                never touch a measure. So there is no fit argument and no
                hierarchy argument — its neighbour is a button, not body copy —
                and 20 already sits 2px under the drawn 22.
              */}
              <p className="mt-3 text-center text-xl font-bold text-brand-slate-100">
                {treatment.agent}
              </p>
            </li>
          ))}
        </ul>
      </ArchBand>

      {/*
        One card for the whole row, not one per agent: only one can be up, and
        `showModal()` makes the rest of the document inert anyway, so the other
        `+`s are unreachable while it is. Mounted unconditionally — the effect
        that calls `showModal()` needs its element already in the DOM — and it
        renders nothing at all while `openAgent` is `null`.

        Outside the `ArchBand`, though the buttons are inside it: the arch is
        `overflow-hidden` (that is what clips its 300px radius), and a dialog is
        not a thing to put in a clipping box even when the top layer would save it.
      */}
      <DrugSheetPopup agent={openAgent} onClose={() => setOpenAgent(null)} />
    </section>
  );
}

/**
 * One of the two blocks: its header band, and the panel that opens under it.
 *
 * Both panels stay mounted in fixed DOM order — Considerations, then Strategies
 * — and only their row size differs, which is exactly what the two artboards
 * are: one draws the open panel BETWEEN the two headers, the other draws both
 * headers stacked with the panel below. Neither is a different layout; they are
 * the same four elements with the sizes swapped. Keeping both mounted is also
 * what lets one collapse while the other expands, on the same curve.
 *
 * **The animation is `grid-template-rows: 0fr → 1fr`**, not a `max-height`.
 * These panels run from 152px (HB +inhibitors, Considerations) to well past
 * 330px, and every one of the sixteen leaves is a different height, so there is
 * no ceiling to pick that is not either a clip or a wrong easing. The grid form
 * animates to the true content height with no measurement. It needs the inner
 * element to be `overflow-hidden` AND `min-h-0` — a grid item's automatic
 * minimum size is its content, which would pin the row open.
 *
 * Under `prefers-reduced-motion: reduce` both transitions are dropped and the
 * swap is instant, the call `BrandLoop` makes for the footage.
 */
function NoteDisclosure({
  block,
  open,
  onOpen,
  last = false,
}: {
  block: NoteBlock;
  open: boolean;
  /** Open this one. Not a toggle: closing is not a state this accordion has. */
  onOpen: () => void;
  /**
   * Nothing follows this block, so its panel's bottom edge is exposed and it
   * draws one. The first block's panel opens between the two headers and runs
   * into the next band instead — see the panel's own comment below.
   */
  last?: boolean;
}) {
  const headerId = useId();
  const panelId = useId();

  return (
    <>
      {/*
        `<h2>` around the button, not on it: the accordion's headers are the
        page's second-level structure, so they belong in the document outline —
        and a screen reader's heading list is how a learner skips between the two
        blocks without tabbing. The page owns the `<h1>`; the arch below owns the
        other `<h2>`.
      */}
      <h2>
        <button
          type="button"
          id={headerId}
          aria-expanded={open}
          aria-controls={panelId}
          /*
            `aria-disabled` on the OPEN one, which is APG's own prescription for
            an accordion that will not let its last panel collapse. It is not
            `disabled`: the header is the panel's label and has to stay focusable
            and readable. The click handler is what actually refuses, so the
            attribute is a description of the behaviour rather than the cause of
            it.
          */
          aria-disabled={open || undefined}
          onClick={() => {
            if (!open) onOpen();
          }}
          className={cn(
            /*
              44px is the drawn band height, and `min-h` rather than `h` so a
              title that wraps on a narrow viewport grows the band instead of
              overflowing it — the call `OptionGroup` records for its pills. It
              is the floor at every width: all six titles already wrap past it
              on a phone, and 44px is a touch target as well as a drawing.

              **The type takes §2's one step down below `lg`** — 20px against
              the drawn 24. It buys no line (the longest title, "Considerations
              for Reducing Treatment Burden and Improving QoL", sets in three
              either way against the 279px this button gets at 375), so the
              argument is the ratio rather than fit: with the panel's bullets
              stepping 20 → 16 below the same breakpoint, a flat 24 would leave
              the header 1.5x its own body where the artboard draws 1.2x.
              `text-xl lg:text-2xl` is the pair every disclosure caption and
              `/wizard/scenario` already use.

              The 24 at the top of that step, and `rounded-lg` and
              `font-semibold` beside it, come from the VECTOR export, which
              overrules the raster measurements §15 first recorded (6px, weight
              700). An antialiased 8px corner measures as 6 on a flat PNG, and ink
              height tells you font size rather than weight — neither original
              reading could have caught either. The same export agrees with the
              44px already shipped here, which is what makes it the better witness.
            */
            "flex min-h-11 w-full items-center justify-center rounded-lg px-4",
            "text-center text-xl font-semibold text-white lg:text-2xl",
            "transition-[background-color,box-shadow,color] duration-120 ease-out",
            /*
              State is carried twice: by the ground and by the shadow. Open is
              crimson and recessed (a black inset), closed is lagoon and lifted (a
              white one); all four values are named in tokens.css §15, because
              "open is crimson and pressed in, closed is lagoon and raised" is one
              design fact.

              Hover and press exist on the CLOSED header only — the open one
              takes none, because `aria-disabled` says it does nothing and a lift
              under the cursor would say otherwise. On the closed one both are
              `PopupButton`'s and `Button`'s drawn answers rather than
              derivations: the ground holds and the LABEL lifts on hover
              (docs/styling.md §4.4), and press recesses to the open band's own
              inset — so touching a closed header previews the state it is about
              to enter, the move `--color-ui-popup-bg-active` already makes below
              it.
            */
            open
              ? "cursor-default bg-note-open shadow-note-open"
              : cn(
                  "cursor-pointer bg-note-closed shadow-note-closed",
                  "hover:text-ui-popup-fg-hover hover:shadow-note-closed-hover",
                  "active:bg-ui-popup-bg-active active:text-ui-popup-fg-active",
                  "active:shadow-note-closed-active",
                ),
            /*
              The app's ring, inset for the reason the package records: drawn
              outside, a ring tinted `--color-ui-btn-ring` disappears against a
              dark ground, and both of this button's grounds are saturated.
            */
            "focus-visible:outline-[3px] focus-visible:outline-offset-[-3px] focus-visible:outline-ui-btn-ring",
          )}
        >
          {block.title}
        </button>
      </h2>

      {/*
        The collapsing wrapper carries NO padding, border or background — all of
        that is on the panel two levels in. A wrapper with its own box would keep
        drawing it at `0fr`, which is a 1px sliver of border under a closed
        header.
      */}
      <div
        className={cn(
          "grid transition-[grid-template-rows] duration-220 ease-out motion-reduce:transition-none",
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            id={panelId}
            role="region"
            aria-labelledby={headerId}
            /*
              Both panels are always in the DOM, so the closed one has to be
              taken out of the accessibility tree explicitly — `overflow: hidden`
              hides it from the eye and from nobody else, and a screen reader
              would otherwise read both lists back to back. `inert` also takes
              its links and its own scroll container out of the tab order.
            */
            aria-hidden={!open}
            inert={!open}
            className={cn(
              /*
                **The panel draws an edge only where one is exposed.** Its top
                never is — it tucks flush under its own header band with no gap —
                so it has no top corners and no top stroke. Its bottom is exposed
                only on the LAST block: the Considerations panel opens BETWEEN the
                two headers and runs straight into the Strategies band beneath it,
                with no stroke and no radius where they meet. So the bottom edge
                belongs to `last`, and the first block's side strokes simply run
                down to the next band and stop.

                Measured on the Strategies-open export, the one where the bottom
                IS exposed: the stroke runs straight down x=121 from the band's
                bottom edge and turns through ~12px at y≈528.

                Inset 12px per side from the band. `bg-brand-teal-25/30` is
                TRANSLUCENT, which is why
                the page's radial gradient still brightens the panel toward its
                centre: a least-squares fit over 85k panel pixels against the
                composited page background puts the free optimum at α=0.265 on
                (112,187,171) with RMSE 5.79, and teal-25 at α=0.305 lands at
                5.83 — indistinguishable, and an exact palette step at an exact
                opacity step, so it is the scale's answer rather than a literal.
              */
              "mx-3 border-x border-note-panel-border bg-brand-teal-25/30",
              last && "rounded-b-xl border-b",
              /*
                **The horizontal padding ramps; the 12px inset does not.** Three
                insets stack inside this panel — `mx-3` (12 a side), this
                padding, and `BulletList`'s own `pl-6` — and at the drawn 36 that
                is 120px of chrome inside a 311px column, leaving the clinical
                copy 191px of measure. ~19 characters a line, and 163px on the
                nested bullets. It is the narrowest measure in the app and the
                one thing on this screen that was wrong rather than undrawn.

                36 is also the only number in this block no artboard is recorded
                as supplying — §15's geometry table lists the 12px inset and not
                this — which is what makes it the one to give. It recovers 40px
                at 375 (231px of measure) and 24 at `sm`, and `lg` restores the
                drawn value untouched. Same three-step shape as `Popup`'s own
                `px-4 sm:px-8 lg:px-16`.

                `mx-3` stays at every width because it is drawn AND positional:
                it is where the `border-x` stroke and `last`'s bottom corners
                land, so at `mx-0` the panel's sides would run flush into the
                band above and the radius would sit on the column edge.

                `pt-2 pb-3` do not ramp — 8px and 12px are already under
                everything else on the page.
              */
              "px-4 pt-2 pb-3 sm:px-6 lg:px-9",
              /*
                Contents fade with the height rather than being sliced by the
                clip. Shorter than the 220ms wipe so the text has settled before
                the panel stops moving.
              */
              "transition-opacity duration-150 ease-out motion-reduce:transition-none",
              open ? "opacity-100" : "opacity-0",
            )}
          >
            {/*
              20px/28px, measured: the panel's lines sit at a 28px pitch and a
              line carrying both an ascender and a descender inks 19px, which is
              ~20px of DM Sans at weight 400. Both land on the scale exactly —
              `text-xl` and `leading-7`.

              **This is §2's body-copy exception's fifth page**, and the first
              whose step lands ON the app's 16px floor rather than above it. The
              other four transcribe 26 and step to 20; this one is drawn at 20,
              so one step is 16 — the size every education chapter's body already
              ships at, and the floor open item 9 says there is nothing below.
              The argument is the one `/wizard/scenario` made: the `<h1>` drops
              48 → 30 under §2 while the body sat at 20, rendering the page's
              clinical copy at 0.67x its heading on a phone where the artboard
              draws 0.42x. The measure agrees — ~23 characters a line at 375
              becomes ~29 — but the padding ramp above is what actually fixed
              that, so this is proportion rather than fit.

              **`leading-[1.4]`, not `leading-7`.** 28px is absolute and would
              render 1.75 against a 16px step — the step loosening what it was
              meant to tighten. 1.4 is the ratio 20/28 already renders at, so one
              class covers both sizes and the 1440 canvas is unchanged. That is
              §2's own lesson from `fviiia-mimetics`: a `leading-*` on the scale
              does not survive a size ramp, a ratio does. (`ArchBand`'s title is
              the other half of it — a caller's ratio survives a size step there
              for the same reason, because both set `--tw-leading`.)

              `text-black` is `BulletList`'s default and is the off-palette black
              docs/styling.md §11 records for the education chapters.
            */}
            <BulletList items={block.points} className="text-base leading-[1.4] lg:text-xl" />
          </div>
        </div>
      </div>
    </>
  );
}
