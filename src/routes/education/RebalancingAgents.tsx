import { type ReactNode, useState } from "react";
import { Button, NavArrowButton, PopupButton } from "mlg-components";

import mechanismUrl from "../../assets/images/hemostatic_mechanisms_diagram.webp";
import BulletList from "../../components/BulletList";
import Popup from "../../components/Popup";
import PopupFigure from "../../components/PopupFigure";
import {
  type RebalancingMechanism,
  REBALANCING_AGENTS,
  rebalancingAgentLabel,
  topicById,
} from "../../data/education";
import { cn } from "../../lib/cn";
import { usePreloadImage } from "../../lib/preloadImage";

/**
 * `/education/rebalancing-agents` — CONTEXT.md §7.6, and a wizard cross-link
 * target (issue 08), so this slug is contractual.
 *
 * Non-null for the reason the other two chapters record: the ids are literals in
 * this repo's own data module, and the chapter test asserts they resolve.
 *
 * **The `<h1>` used to be a literal beside these**, because the topic's title
 * carried a scope qualifier the artboard drops. It no longer does: §7.6 sets
 * "Hemostatic rebalancing agents in treatment of HA/HB" over the *mechanism*
 * prose, and the split that created these two topics left it on the wrong one.
 * Moving it (see both topics' comments) makes `AGENTS.title` the string the
 * chapter actually shows, and the literal's only job disappears with it —
 * leaving this chapter reading its heading the way `treatment-landscape` does,
 * for the same reason: the artboard reproduces it exactly.
 */
const AGENTS = topicById("rebalancing-agents")!;
const MECHANISMS = topicById("rebalancing-mechanisms")!;

/**
 * The line under the three boxes.
 *
 * Sentence case here and shouted in CSS, as everywhere else in this codebase —
 * the accessible name stays readable.
 */
const BOXES_CAPTION = "Click on the boxes to learn more about hemostatic rebalancing agents";

/**
 * The one §7.7 click-through target on this chapter: the caption beside the
 * `+`, and the button's accessible name — `PopupButton` prefixes it with
 * "Expand"/"Close".
 *
 * §7.7's spelling, not the artboard's: the drawing reads "homeostatic
 * rebalancing agents", which is a different word — homeostasis is not
 * hemostasis — and CONTEXT.md §7.6/§7.7 both write "hemostatic", as does every
 * other mention in this repo. Not reproduced, the same call
 * `disease-background` makes for the export's "FACOTOR".
 */
const MECHANISMS_LABEL =
  "Mechanisms of hemostatic rebalancing agents within the coagulation cascade";

/**
 * The second card's heading — the diagram's own title, which is neither the
 * caption above nor either topic's `title`.
 *
 * A **literal**, which is how every figure card in this codebase states its
 * heading (`disease-background`'s three, and `CASCADE_TITLE` beside them): a
 * figure's title is stated rather than derived. `MECHANISMS.figures[0]` holds
 * this string followed by the abbreviation gloss in parentheses, and splitting a
 * caption to recover half of it is exactly the brittle derivation the data
 * module argues against elsewhere.
 *
 * Note the preposition: "in the coagulation cascade" here against the caption's
 * "within". Both are as drawn — the caption-vs-title split `Disclosure`
 * documents, where the caption names the §7.7 target and the card wears the
 * figure's own name.
 */
const MECHANISM_FIGURE_TITLE =
  "Mechanisms of Hemostatic Rebalancing Agents in the Coagulation Cascade";

/** The figure card's footnote, as drawn. */
const FIGURE_ABBREVIATION = "TFPI = tissue factor pathway inhibitor.";

/**
 * The diagram is image-borne (CONTEXT.md §7.7) — its labels exist in no text
 * layer, so this is the only route to what it says, which is why it runs as long
 * as `disease-background`'s two.
 *
 * It describes the *pathway*, not the picture: which factor activates which,
 * which two brakes restrain the cascade, and where the three agents cut in. A
 * reader who cannot see it needs the mechanism, not the arrows.
 */
const MECHANISM_FIGURE_ALT =
  "Coagulation cascade showing where hemostatic rebalancing agents act. FXI activates FIX; " +
  "FIX and FVIIa converge on FX, which with FV generates thrombin, and thrombin converts " +
  "fibrinogen to fibrin. Two endogenous anticoagulants restrain the cascade: TFPI inhibits " +
  "FVIIa and FX, and antithrombin inhibits FX and thrombin. Concizumab and marstacimab " +
  "inhibit TFPI; fitusiran inhibits antithrombin — removing those brakes restores thrombin " +
  "generation.";

/**
 * Colour by mechanism class, which is what the artboard draws: the two
 * anti-TFPI mABs in blue, the AT-directed siRNA in crimson.
 *
 * A `Record` over the union, so it is **exhaustive by construction** — a third
 * mechanism added to `RebalancingMechanism` fails to compile here rather than
 * rendering an agent in no colour at all. That is the whole reason the data
 * module models `mechanism` as a union instead of a string.
 *
 * The two tokens are a pair; see `tokens.css`, where the blue is transcribed
 * verbatim because it derives from no step of any brand ramp.
 */
const MECHANISM_TONE: Record<RebalancingMechanism, string> = {
  "anti-TFPI mAB": "text-agent-mab",
  "AT-directed siRNA": "text-agent-sirna",
};

/**
 * Composed bullet → its tone, keyed by the exact string the data module puts in
 * the topic's `children`.
 *
 * Both sides call `rebalancingAgentLabel`, which is why this is a safe join
 * rather than a string match that quietly stops matching: there is one
 * composition, and if it changes, both keys and children change with it.
 */
const AGENT_TONE: ReadonlyMap<string, string> = new Map(
  REBALANCING_AGENTS.map((agent) => [
    rebalancingAgentLabel(agent),
    MECHANISM_TONE[agent.mechanism],
  ]),
);

/**
 * The width of the three-box group — 3 × 227 + 2 × 141, off the artboard below.
 *
 * Named because three things are measured against it and must agree: the boxes
 * themselves, and the bottom row, whose caption starts on the group's left edge
 * rather than the content column's.
 */
const GROUP = "mx-auto w-full max-w-240.5";

/**
 * The §7.7 target opens **two** cards in sequence: the mechanism prose, and the
 * diagram behind its "View mechanism" button.
 *
 * A union rather than two booleans, for `DisclosureBand`'s stated reason turned
 * inward: "both cards open" is not a state the top layer should be asked to
 * represent, and a union is what makes it unrepresentable.
 */
type Step = "prose" | "figure";

export default function RebalancingAgents() {
  /**
   * `null` is closed. **One `Popup` for both cards, not one each** — the dialog
   * is never closed and reopened as the reader steps between them, so the
   * platform's focus restoration fires exactly once, on the way out, and lands
   * back on the `+` that opened it.
   *
   * It follows that ✕, ESC and a backdrop click all mean *closed*, from either
   * card: `onClose` is the one route out and it goes straight to `null`. Back is
   * a separate control precisely because those three are not it. Reopening
   * therefore starts at `"prose"` again, which is the only sensible reading of a
   * `+` that names the target as a whole.
   */
  const [step, setStep] = useState<Step | null>(null);

  /**
   * A `Record` over the union, exhaustive by construction like `MECHANISM_TONE`
   * above: a third step fails to compile here rather than opening a nameless
   * card. Both entries are built every render, which costs nothing — a React
   * element is a descriptor, and only the selected one is ever mounted, so the
   * diagram's `<img>` still does not exist until the reader asks for it.
   */
  const CARDS: Record<Step, { title: string; content: ReactNode }> = {
    prose: {
      title: MECHANISMS.title,
      content: <MechanismsCard onViewMechanism={() => setStep("figure")} />,
    },
    figure: {
      title: MECHANISM_FIGURE_TITLE,
      content: <MechanismFigureCard onBack={() => setStep("prose")} />,
    },
  };
  const card = step === null ? undefined : CARDS[step];

  /**
   * The diagram is two cards deep, so nothing requests it during the chapter's
   * own load and a cold figure card opens empty then jumps once the picture
   * lands (see `PopupFigure`). Warmed from here, the nearest scope that stays
   * mounted — exactly as the other two chapters warm theirs.
   */
  usePreloadImage(mechanismUrl);

  return (
    <section aria-labelledby="chapter-heading">
      {/* Uppercase is CSS, not copy — the accessible name stays title-case, as
          on every other chapter. A data read now that §7.6's scope qualifier has
          moved to the topic whose prose it actually heads. */}
      <h1
        id="chapter-heading"
        // `text-5xl` from `lg` only, app-wide (docs/styling.md §2).
        // `REBALANCING` sets 272px at 52px, which clears a 375px column and
        // overflows a 320px one.
        className="font-display text-3xl font-bold tracking-wide text-brand-crimson-50 uppercase lg:text-5xl"
      >
        {AGENTS.title}
      </h1>

      {/*
        Two bullets, the second carrying the three agents — the topic's whole
        `body`, with no slicing, because the mechanism prose the artboard does
        not draw was split into `rebalancing-mechanisms` rather than left here
        to be cut off by an index.

        `mt-8` is the designer's 32px h1 gap, the same value both other
        chapters use.
      */}
      <BulletList
        items={AGENTS.body}
        // One step down below `lg`, the ramp §11 records for every chapter.
        // **This chapter and `prophylaxis-guidance` are the two where body copy
        // has anywhere down to go**: §11's table pins the other three at 16px
        // because that is a legibility floor, and these two transcribe their
        // body at 24 off the same measurement (open item 9). 20 is a step, not a
        // collapse onto the other chapters' value — it leaves the divergence
        // item 9 is holding open exactly where it was.
        className="mt-8 text-xl lg:text-2xl"
        // `font-bold` for every child, tone for the class it belongs to: the
        // weight is the same on all three, so it is stated once here rather
        // than folded into both entries of MECHANISM_TONE.
        childClassName={(child) => cn("font-semibold", AGENT_TONE.get(child))}
      />

      <div className="mt-14">
        {/*
          The three figures that are not here yet. CONTEXT.md §7.7 marks all 24
          §7 figures image-borne and these three have no asset — the artboard
          draws its own "PLACEHOLDER" in them, so the designer has not placed
          them either — and they ship as reserved boxes at the drawn 227×185,
          holding the group open so real thumbnails do not re-cut the row.

          Empty `<div>`s rather than `<img>`s without a `src`, and rather than
          buttons: a broken image announces itself and takes an `alt` it has
          nothing to say in, and a button here would be a control that does
          nothing. An empty div is already invisible to assistive tech, so it
          needs no `aria-hidden`.

          **The caption beneath them is therefore an instruction that does not
          yet work.** It ships as drawn because this pass is the layout; wiring
          it needs the designer to say what a box opens, which §7.7 does not.
          Unaffected by the `+` below now opening: these boxes are not that
          target.

          **The gap ramps, and the boxes never do (2026-08-04).** `lg:gap-x-35.25`
          used to put the drawn gap into a column that had just lost 175px to
          the gutter step (§12), so the pixel that turned the row on was the
          pixel that made it too wide: 3 × 224 + 2 × 141 = 954 against a 752px
          column, and the boxes shrank to **157 × 192** — 30% under the drawn
          width, and portrait where the artboard draws landscape.

          The fix is a middle step in the gap alone. **40 is derived**: it is the
          largest gap that lets three drawn-width boxes fill the `lg` column
          exactly (3 × 224 + 2 × 40 = 752). So the row turns on precisely where
          the boxes fit it at full size, and the drawn 141 returns at `xl`, where
          the drawn 962 group does. The box is 224 × 192 at every width the row
          exists at, and at every width it does not.

          Below `lg` it stacks, at the same size. That is three 192px boxes and
          two 32px gaps — 640px of empty bordered rectangle on a phone, between
          the prose and a caption that says "click on the boxes" — and it is the
          accepted cost of not reserving the wrong size, which is
          `treatment-landscape`'s own rule for the same object. It is bounded by
          open item 16: these boxes are placeholders for assets §7.7 has not
          named, and the answer to that question is the answer to this one.
        */}
        <div
          className={cn(
            GROUP,
            "flex flex-col items-center gap-8 lg:flex-row lg:gap-x-10 xl:gap-x-35.25",
          )}
        >
          {REBALANCING_AGENTS.map((agent) => (
            <div
              key={agent.name}
              // `shrink-0` in the stack keeps the height off the main axis;
              // `lg:shrink` in the row is what brings a `w-full` basis down to
              // the track, and at `lg` it lands on exactly 224 — the gap above
              // is chosen so that `max-w-56` never has to clamp it.
              // `border-[0.25rem]` not `border-4`: the numeric utility is px and
              // would pin the outline while the box scales (§19). Editors will
              // offer to "canonicalise" it — decline.
              className="h-48 w-full max-w-56 shrink-0 border-[0.25rem] border-black lg:shrink"
            />
          ))}
        </div>

        {/*
          Centred on the content column rather than on the group: the caption is
          1082px of ink against the group's 963, so it overhangs both sides on
          the artboard, and the two share a centre line.
        */}
        <p className="mt-4 text-center text-xl font-bold text-popup-caption uppercase lg:text-2xl">
          {BOXES_CAPTION}
        </p>

        {/*
          The §7.7 disclosure. Caption to the LEFT of the button, which no other
          chapter does — `DisclosureBand` and `treatment-landscape` both stack
          it underneath — and left-aligned to the group's left edge rather than
          to the content column's.

          `flex-wrap` rather than an `lg:` switch: the only thing that has to
          give below the canvas is the button dropping under the caption, and
          the row does that on its own. It does not, in the event — at 375 the
          caption shrinks to 311 − 24 − 65 = 222px and the two still share the
          line, which is well clear of its 150px min-content ("rebalancing" at
          20px bold). The wrap is the guard, not the shipped behaviour.

          `mt-20` does not ramp. It is one of §11's eight vertical gaps, which
          are deliberately left unramped pending one one-screen rule across all
          four chapters (open item 10) rather than answered per page.
        */}
        <div className={cn(GROUP, "mt-20 flex flex-wrap items-start gap-x-6 gap-y-4")}>
          {/* One step down below `lg`, which lands this on the same
              `text-xl lg:text-2xl` the other three chapters' disclosure
              captions take — so all four now agree on caption size as well as
              on colour (`--color-popup-caption`, open item 15). */}
          <p className="max-w-135 text-xl font-bold text-popup-caption lg:text-2xl">
            {MECHANISMS_LABEL}
          </p>

          {/*
            **Controlled**, where this was uncontrolled while it opened nothing.
            A `PopupButton` left to toggle itself would keep showing ✕ after the
            card was closed by ESC or by its own ✕, with the two disagreeing
            about what is open — `treatment-landscape` records the same move for
            the same reason.

            `next` is the button's resulting state, so a click that opens lands
            on the first card and a click that closes goes all the way out,
            whichever card is showing.
          */}
          <PopupButton
            label={MECHANISMS_LABEL}
            open={step !== null}
            // Not `aria-controls`: a modal dialog lives in the top layer, so it
            // is not a region of this page the button expands.
            aria-haspopup="dialog"
            onClick={(next) => setStep(next ? "prose" : null)}
          />
        </div>
      </div>

      {/*
        Mounted unconditionally: the effect that calls `showModal()` needs the
        element already in the DOM, and the children it wraps are `undefined`
        while closed, so nothing renders early — which is also what keeps the
        prose card's title out of the document until it is opened.
      */}
      <Popup open={card !== undefined} title={card?.title ?? ""} onClose={() => setStep(null)}>
        {card?.content}
      </Popup>
    </section>
  );
}

/**
 * `rebalancing-mechanisms`' prose as the first card draws it: a lead paragraph,
 * then a crimson heading over each mechanism class's bullets.
 *
 * A local function beside its sibling below, the shape `BenefitsChallengesCard`
 * and `SeverityTable` take in the other two chapters — one caller, in this same
 * file, and a second is not coming.
 *
 * **It dispatches on the `Bullet` union, not on an index.** A `string` is the
 * lead paragraph; a `NestedBullet` is a section. That is the whole reason the
 * data module was restructured rather than left flat with the card splitting on
 * the lead-ins' colons: the shape carries the fact, so inserting a bullet cannot
 * silently reassign what is a heading and what is prose.
 *
 * The headings are `<h3>` — `Popup`'s band is the card's `<h2>`.
 *
 * Type is measured off the 2000px export and, being a raster rather than Figma,
 * is approximate: the lead reads ~26px set tight and the bullets ~20px, against
 * 32px bold for the two headings. The first is raw under §8's precedent (the
 * `text-2xl` step is 26px at weight 600, where this is 400) and so is the second
 * — it is `BenefitsChallengesCard`'s own pop-up body value, reused because it is
 * the same fact. The headings land on `text-3xl` exactly.
 *
 * **All three step down below `lg`, and the bullets' step is derived rather than
 * picked** — the derivation `BenefitsChallengesCard` records, which lands on the
 * same value here because it is the same card. `Popup` is `min(1140px, 92vw)`
 * inside a `border-5` with `px-4 sm:px-8 lg:px-16`, so at 375 the body is
 * 345 − 10 − 32 = **303px**, eight pixels narrower than the page's own 311px
 * column. A card cannot set larger body type than the page that opened it in a
 * narrower measure, so the bullets land on `text-base` and the lead lands on
 * exactly the 20px the page bullets ramp to — not a step below them, and not a
 * step above.
 */
function MechanismsCard({ onViewMechanism }: { onViewMechanism: () => void }) {
  return (
    <div className="py-6">
      {MECHANISMS.body.map((item) =>
        typeof item === "string" ? (
          <p key={item} className="text-xl leading-tight text-black lg:text-2xl">
            {item}
          </p>
        ) : (
          <section key={item.text} className="mt-6">
            <h3 className="text-2xl font-bold text-brand-crimson-50 lg:text-3xl">{item.text}</h3>
            {/*
              One `leading-[1.6]` covers both steps: a Tailwind v4 `leading-*`
              sets `--tw-leading`, and every `text-<size>` resolves its
              line-height through that property, so the ramp reads it rather
              than replacing it. See `SeverityTable`'s manifestation lists.
            */}
            <BulletList items={item.children} className="mt-4 text-base leading-[1.6] lg:text-xl" />
          </section>
        ),
      )}

      {/*
        **No footnote on this card (2026-08-05).** It carried the gloss of all
        three abbreviations its copy introduces — a divergence from an export
        that glosses only AT, raised for the designer as open item 17 — and the
        answer is that the row goes. The footnote is dropped, not moved: the
        figure card behind this one keeps its own.

        The CTA stays exactly where it was drawn, which is why `CardFooter`
        still wraps it rather than being replaced by a bare right-aligned div.
        `ms-auto` is what put the button on the right edge, and it does that
        with or without a `<p>` beside it; `mt-8` and `items-end` are unchanged,
        so on any width where the two shared a line the button's box does not
        move by a pixel. Below that width it rises by the height of the line it
        no longer has to clear, which is the only thing deleting a footnote can
        mean.
      */}
      <CardFooter>
        {/*
          The package CTA, whose doc invites the override: "`cn` is
          tailwind-merge, so your classes win."

          **It was the one thing on this chapter that did not fit its own card.**
          The package ships `px-16` (128px of inset) around `text-[26px]`, which
          computes ~358px wide — against a card body of 345 − 10 − 32 = **303px**
          at 375. It never overflowed, because the component carries `max-w-full`
          and `break-words`, but it survived by wrapping "VIEW MECHANISM" into
          the 175px left over inside a 303px box. A CTA that is 92% inset is not
          a CTA.

          So it takes the ramp `Landing`'s hero CTA already puts on this same
          component (§8), reusing its first three inset steps rather than
          inventing a scale for one button. At 375 that is 64 + ~177 = **241px**,
          which leaves 62px of the card body over.

          | Viewport | Card body | Inset | Type |  Button |
          | -------- | --------: | ----: | ---: | ------: |
          | 375      |       303 |    64 |   20 |  ~241px |
          | 640      |       515 |    96 |   20 |  ~273px |
          | 1024     |       804 |   128 |   24 |  ~340px |
          | 1440     |      1002 |   128 |   24 |  ~340px |

          **`lg:text-2xl` moves the canvas, and it is the only thing in the
          2026-08-04 responsive passes that does.** The package's `text-[26px]`
          is the last 26 on this chapter — §11 records the prose moving 26 → 24
          on the §2 migration the same day, and this survived only because it is
          the package's default rather than a value this file chose. The cost is
          the one item 31 names for `/explore`'s `<h1>`: the button renders ~340
          against the drawn 353, where the package's own 358 was within 5. The
          alternative — ramping the inset alone — leaves 26px type over 16px
          bullets on a phone, which is the disproportion §2's ramp exists to fix.

          `py-2.5` replaces `py-2`, and it is what holds the drawn height across
          that type step: 10 + 10 + 24 × 1.25 = **50px** against the export's 49,
          where `py-2` would have given 46. Below `lg` the same value gives 45px,
          which clears the 44px the ✕'s own ramp lands on (§13).

          Sentence case with `uppercase` in CSS, as the component's doc requires
          ("casing is the caller's copy decision") and as every other shouted
          string in this codebase does, so the accessible name stays readable.
        */}
        <Button
          className="px-8 py-2.5 text-xl uppercase sm:px-12 lg:px-16 lg:text-2xl"
          onClick={onViewMechanism}
        >
          View mechanism
        </Button>
      </CardFooter>
    </div>
  );
}

/**
 * The second card: the §7.7 diagram, with the way back.
 *
 * `width`/`height` are the drawn 886 — the card body's own inner width, which is
 * `Popup`'s `min(1024px, 92vw)` less its `border-5` and its `px-16` — and the
 * asset is stored at 2× that, per docs/styling.md §13. It arrived at 3469×1683,
 * ~3.9× drawn, and was re-encoded on the precedent of the other three.
 *
 * **The 2026-08-04 responsive pass deliberately left it alone.** `PopupFigure`
 * caps at `min(886px, 100%)`, so on a 375px phone this paints at 303×147 — a
 * fourteen-label coagulation cascade at a third of drawn size, which is the
 * densest figure in the app and therefore the least legible there. That is a
 * `PopupFigure` question, not a chapter one: the same cap governs
 * `disease-background`'s two diagrams and all four of `fviiia-mimetics`', and
 * the scroll-region answer the tables took (§11) would have to be taken for all
 * seven at once or not at all. `MECHANISM_FIGURE_ALT` below is the route to what
 * the diagram says either way, which is why it is as long as it is. Raised as
 * open item 38 rather than answered here.
 */
function MechanismFigureCard({ onBack }: { onBack: () => void }) {
  return (
    <div className="py-6">
      <PopupFigure src={mechanismUrl} width={886} height={430} alt={MECHANISM_FIGURE_ALT} />

      <CardFooter note={FIGURE_ABBREVIATION}>
        {/*
          `aria-label` overrides `NavArrowButton`'s hardcoded "Previous", which
          means nothing inside a card — the component sets it before spreading
          props, so a caller's wins. It names where back goes, which is the only
          thing about this control that is not obvious from its arrow.

          No focus management on the way in or out. `ref` does not typecheck on
          this component or on `Button` — neither is a `forwardRef`, unlike
          `PopupButton` — so there is no handle to focus, and the browser's own
          behaviour ships instead: stepping unmounts the control the reader just
          used and focus drops to `<body>` (verified in Chrome, not the
          `<dialog>` one might expect). `showModal()` has made the rest of the
          document inert, so the next Tab still lands inside the card — degraded,
          not trapped. Logged as a package debt in `.scratch/mlg-reskin/`.
        */}
        <NavArrowButton
          direction="back"
          aria-label={`Back to ${MECHANISMS.title}`}
          onClick={onBack}
        />
      </CardFooter>
    </div>
  );
}

/**
 * The row both cards end on: the abbreviation footnote at the left, the one
 * control that moves you at the right.
 *
 * **`note` is optional as of 2026-08-05**, because the prose card's footnote was
 * deleted and its CTA was not. Omitting it renders no `<p>` at all rather than
 * an empty one — the row is then a single `ms-auto` item, which is the same
 * right edge the two-item row lands on.
 *
 * Inside the card's body rather than as a `Popup` region, which is what the
 * artboard draws — it sits after the prose, not pinned over it — and what keeps
 * `PopupFigure`'s height cap honest: that `10rem` is measured off `Popup`'s
 * chrome, so a footer band outside the scroll region would make it stale in the
 * direction of a scrollbar.
 *
 * 14px/300 is the export's, and the `TreatmentOptionsTable` footnotes' — raw for
 * the usual reason, the scale's smallest step being 12px at weight 500. Not set
 * solid like those, though: this is one run of prose rather than a stack of
 * `<li>`s, and it wraps (see below), where `leading-none` would close the two
 * lines up against each other.
 *
 * `items-end` puts the footnote on the button's bottom edge rather than its
 * centre, as drawn.
 *
 * **The three width classes on the footnote are what keep the button on the
 * right**, and they are not interchangeable. They were derived against the prose
 * card's ~530px gloss, which no longer exists: at its natural width it plus the
 * CTA overflowed an 886px body by ~25px, and a plain `flex-wrap` answered that
 * by breaking the line, which dropped the button to the *left* of the next row.
 * They stay because the figure card's own footnote sits in the same row and the
 * failure mode is the same one at a narrower viewport. `basis-80` states a hypothetical
 * width small enough that the two never trip that on a wide card; `flex-1` then
 * lets the footnote take the real leftover and wrap its own text instead; and
 * `min-w-0` is what permits that, a flex item's default `min-width:auto`
 * flooring it at its longest unbreakable run.
 *
 * Wrapping is still allowed, for the phone — at 390px the two genuinely cannot
 * share a line — and `ms-auto` on the action is what keeps it right-aligned when
 * they do.
 *
 * The action's wrapper takes no `shrink-0`, deliberately: it needs none on a wide
 * card (nothing is over-constrained once the footnote gives way), and on a phone
 * it is what lets the 357px CTA come down to the 220px body instead of hanging
 * off the side of it.
 */
function CardFooter({ note, children }: { note?: string; children: ReactNode }) {
  return (
    <div className="mt-8 flex flex-wrap items-end gap-x-6 gap-y-4">
      {note !== undefined && (
        <p className="min-w-0 flex-1 basis-80 text-sm leading-tight font-light text-black">
          {note}
        </p>
      )}
      <div className="ms-auto">{children}</div>
    </div>
  );
}
