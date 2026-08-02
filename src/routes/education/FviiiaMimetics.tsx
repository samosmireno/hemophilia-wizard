import { type ReactNode, useState } from "react";
import { PopupButton } from "mlg-components";

import emicizumabUrl from "../../assets/images/emicizumab.webp";
import BulletList from "../../components/BulletList";
import ExpandableFigure from "../../components/ExpandableFigure";
import Popup from "../../components/Popup";
import PopupFigure from "../../components/PopupFigure";
import { topicById } from "../../data/education";
import { usePreloadImage } from "../../lib/preloadImage";
import { preserveCase } from "../../lib/preserveCase";

/**
 * `/education/fviiia-mimetics` — CONTEXT.md §7.5. A wizard cross-link target
 * (issue 08), so this slug is contractual.
 *
 * Non-null for the reason the other chapters record: the ids are literals in
 * this repo's own data module, and the chapter test asserts they resolve.
 *
 * The chapter now also carries §7.6's two investigational agents. That is the
 * artboard's filing, not a transcription slip: it draws NXT007 and Inno8 in its
 * own corner panel, and the data module was split per-agent to match (see
 * `nxt007-overview`/`inno8-overview` there). CONTEXT.md §7.5 records the move.
 */
const CHAPTER = topicById("fviiia-mimetics")!;
const EMICIZUMAB = topicById("emicizumab-overview")!;
const EMICIZUMAB_MOA = topicById("emicizumab-moa")!;
const DENECIMIG = topicById("denecimig-overview")!;

/**
 * The Emicizumab card's heading — a **literal**, because the band draws
 * "EMICIZUMAB" alone where the topic's title carries "(FDA-approved)" as well.
 *
 * That is the caption-vs-title split `rebalancing-agents` records: the caption
 * on the page names the §7.7 target and states the regulatory status, and the
 * card behind it wears the agent's own name. A reader hears "Expand Emicizumab
 * (FDA-approved)" on the `+` and "Emicizumab" on the dialog, which is the right
 * pair — the status is what the button is *for*, not what the card is about.
 */
const CARD_TITLE = "Emicizumab";

/**
 * The MOA diagram is image-borne (CONTEXT.md §7.7) — its four factor labels
 * exist in no text layer — so this is the only route to what it shows.
 *
 * **Structural where `rebalancing-agents`' is mechanistic**, and deliberately
 * so: this describes what is drawn rather than what it means. The mechanism is
 * carried in words already, by `EMICIZUMAB_MOA.body` rendered directly beneath
 * the picture in the same card, and restating it here would announce it twice.
 * Do not "fix" this into the longer house style without moving that prose.
 */
const MOA_FIGURE_ALT =
  "Diagram of emicizumab, a Y-shaped bispecific antibody, with double-headed arrows to " +
  "factor Xa, factor X, factor IXa, and factor IX on a phospholipid membrane.";

/**
 * The diagram's drawn size in the enlarged card, and its aspect ratio.
 *
 * Half of `emicizumab.webp`'s 1408 × 1468, per docs/styling.md §13 — the assets
 * are stored at 2× for retina and nothing wider, so half the file IS the drawn
 * width, and upscaling past it only softens the raster. `PopupFigure` takes both
 * numbers because it reserves the box from them before the image decodes.
 */
const MOA_FIGURE = { width: 704, height: 734 } as const;

/**
 * The corner panel's heading — a **literal**, because no topic holds it any
 * more: it was `emerging-mimetics`' title, and splitting that topic per agent
 * left the group name with nothing to hang on. Stated here the way every other
 * group caption in this codebase is (`rebalancing-agents`' `BOXES_CAPTION`).
 *
 * The artboard draws "in early- stage development:" — the same PDF soft-hyphen
 * artifact the data module's header says it strips, so it is one word here. The
 * trailing colon IS drawn and is kept: the panel's two buttons are what it
 * introduces.
 */
const PANEL_HEADING = "Investigational FVIIIa-mimetic therapies in early-stage development:";

/** The two panel captions, flat where the cards behind them carry longer titles. */
const NXT007 = "NXT007";
const INNO8 = "Inno8";

/**
 * A title as the artboard tones it: a lead in one colour, a tail in another.
 *
 * The chapter two-tones three strings — the `<h1>`, and both left-hand captions
 * — and each splits at its own punctuation, so the boundary is read off the copy
 * rather than stored beside it.
 *
 * **This is a paint boundary, not a content split.** The two halves concatenate
 * back to the source string (bar the one separating space), so the accessible
 * name and the rendered text are unchanged by it; a title that grew neither
 * marker renders whole in the lead's colour rather than losing its tail. That is
 * what makes this a different animal from the derivation `rebalancing-agents`
 * argues against — that one would drop copy on the floor.
 *
 * Colon FIRST, then paren, and the order is load-bearing: "Denecimig (Mim8):
 * Investigational; …" contains both, and the paren comes earlier in the string
 * while the colon is the one the design breaks on. The punctuation stays on the
 * side the artboard puts it — a colon closes the lead, a paren opens the tail.
 */
function splitTitle(title: string): [lead: string, tail: string] {
  const colon = title.indexOf(": ");
  if (colon !== -1) return [title.slice(0, colon + 1), title.slice(colon + 2)];

  const paren = title.indexOf(" (");
  if (paren !== -1) return [title.slice(0, paren), title.slice(paren + 1)];

  return [title, ""];
}

const [HEADING_LEAD, HEADING_TAIL] = splitTitle(CHAPTER.title);

/**
 * Which disclosure is showing its ✕. `null` is all four closed.
 *
 * One id rather than four booleans, which is `DisclosureBand`'s move for
 * `DisclosureBand`'s reason: two open at once is not a state worth being able to
 * represent, and opening one closes the others by construction.
 *
 * **Only `emicizumab` opens a card so far.** The designer has drawn one behind
 * each of these four (Pop ups 10–13) and has delivered this one; the other three
 * assets are here but their layouts are not — denecimig and Inno8 are landscape
 * rasters where this one is near-square, so they are almost certainly not this
 * drawing and are not guessed at. Those three buttons therefore still toggle and
 * nothing more, which is the content-less case `DisclosureBand` already models.
 *
 * `aria-haspopup` follows the same split, for the reason it is conditional
 * there: announcing a dialog that will not appear is worse than announcing
 * nothing. Hence `hasCard` on `Disclosure` below rather than the attribute
 * hard-coded on all four.
 */
type OpenId = "emicizumab" | "denecimig" | "nxt007" | "inno8";

export default function FviiiaMimetics() {
  const [openId, setOpenId] = useState<OpenId | null>(null);

  /** Curried so each call site reads as the one disclosure it belongs to. */
  const toggle = (id: OpenId) => (next: boolean) => setOpenId(next ? id : null);

  /**
   * The MOA diagram is **two cards deep** — it lives inside the Emicizumab
   * card's `ExpandableFigure`, and that card's children do not exist until the
   * `+` is clicked — so nothing requests it during the chapter's own load and a
   * cold figure opens to an empty box that jumps once the picture lands (see
   * `PopupFigure`). Warmed from here, the nearest scope that stays mounted,
   * exactly as the other chapters warm theirs.
   *
   * One URL for both uses: the in-card thumbnail and the enlargement are the
   * same file, so the thumbnail is warm on the same call.
   */
  usePreloadImage(emicizumabUrl);

  return (
    <section aria-labelledby="chapter-heading" className="flex flex-1 flex-col">
      {/*
        Two-tone, which no other chapter's heading is: the artboard sets the
        class name in crimson and the scope qualifier under it in slate. Both
        are exact palette steps off the export (#d63a52, #111d2e).

        Uppercase is CSS, not copy — the accessible name stays title case, as on
        every other chapter — and the two spans are `block` so the colour change
        lands on a line break, as drawn, instead of wherever the measure happens
        to wrap.

        The `{" "}` between them is what keeps `textContent` equal to the source
        title rather than running the two halves together. It costs nothing
        visually: whitespace-only content between two block boxes is discarded,
        so it never paints.

        **`aria-label` is what repairs the accessible name**, and it is required
        rather than belt-and-braces. Between the two-tone split and the cased
        terms this heading is five elements deep, and the accessible-name
        algorithm concatenates each element's contribution with a separating
        space — announcing "FVIIIa -Mimetic BsAbs : Approved…". Labelling from
        `CHAPTER.title` states the one string the fragments are made of, so the
        name cannot drift from them: both come from the same const. `textContent`
        is unaffected by all this and stays exact, which is what the router test
        reads.
      */}
      <h1
        id="chapter-heading"
        aria-label={CHAPTER.title}
        // `text-h1` only from `lg`, which is `prophylaxis-guidance`'s call for
        // its own reason: at 52px this nine-word title takes six lines and 328px
        // of a 390 × 780 phone — 42% of the screen before the first bullet
        // (measured in Chrome). The other three chapters are two to six words
        // and do not need it. An invented comfort value, stated as a scale step
        // so the two sizes read as one scale (docs/styling.md §11).
        className="font-display text-h2 tracking-wide text-brand-crimson-50 uppercase lg:text-h1"
      >
        <span className="block">{preserveCase(HEADING_LEAD)}</span>{" "}
        <span className="block text-brand-slate-100">{preserveCase(HEADING_TAIL)}</span>
      </h1>

      {/* `mt-8` is the designer's 32px h1 gap, the value every chapter uses.
          26px is measured off the artboard and raw under §8's precedent — the
          nearest step, `text-h3`, is 26px at weight 600 where this is 400.
          Four bullets, not the export's five: its last two are one sentence
          Figma broke across lines, which is why this reads the topic's `body`
          rather than the drawing. */}
      <BulletList items={CHAPTER.body} className="mt-8 text-[26px] leading-tight" />

      {/*
        The bottom half: two disclosures at the left, the corner panel at the
        right.

        `grow` is what carries the panel to the bottom edge of the content box —
        `AppShell` is `lg:pb-0` with a `flex flex-1 flex-col` wrapper precisely
        so a page can do this, and at the 1440 × 800 canvas that lands the panel
        flush with the bottom of the page exactly as drawn.

        A flex ROW rather than a grid: the panel is a fixed 675 (its drawn
        width), the left column takes what is left, and `items-stretch` — the
        default — is what makes the panel fill the row's height. Below `lg` the
        row becomes a column and the panel keeps `grow`, so it still ends the
        page; there it stops above the sidebar's bottom bar, which is
        `AppShell`'s `pb-bar` doing its job rather than a deviation.
      */}
      <div className="mt-14 flex grow flex-col gap-10 lg:flex-row lg:gap-0">
        {/*
          78px in from the content column's left edge — the artboard indents
          this group rather than aligning it to the gutter the heading and
          bullets use.
        */}
        <ul className="flex flex-col justify-center gap-20 lg:flex-1 lg:ps-19.5">
          <Disclosure
            caption={<AgentCaption title={EMICIZUMAB.title} />}
            label={EMICIZUMAB.title}
            open={openId === "emicizumab"}
            onToggle={toggle("emicizumab")}
            hasCard
          />
          <Disclosure
            caption={<AgentCaption title={DENECIMIG.title} />}
            label={DENECIMIG.title}
            open={openId === "denecimig"}
            onToggle={toggle("denecimig")}
          />
        </ul>

        <EmergingPanel>
          <Disclosure
            caption={<PanelCaption>{NXT007}</PanelCaption>}
            label={NXT007}
            open={openId === "nxt007"}
            onToggle={toggle("nxt007")}
          />
          <Disclosure
            caption={<PanelCaption>{INNO8}</PanelCaption>}
            label={INNO8}
            open={openId === "inno8"}
            onToggle={toggle("inno8")}
          />
        </EmergingPanel>
      </div>

      {/*
        Mounted unconditionally, as `rebalancing-agents` mounts its own: the
        effect that calls `showModal()` needs the element already in the DOM. The
        children are `undefined` while closed, so the diagram's `<img>` and the
        nested figure dialog do not exist until the reader asks for them — which
        is exactly why the preload above is needed.

        Only one of the four ids has a card, so this is a conditional rather than
        the exhaustive `Record` `rebalancing-agents` keys by step. A `Record` over
        `OpenId` would demand three entries nobody has drawn.
      */}
      <Popup open={openId === "emicizumab"} title={CARD_TITLE} onClose={() => setOpenId(null)}>
        {openId === "emicizumab" && <EmicizumabCard />}
      </Popup>
    </section>
  );
}

/**
 * Pop up 10: the three drawn bullets at the left, the MOA diagram at the right.
 *
 * A flex ROW above `lg` and a column below. The card is `w-[min(1024px,92vw)]`
 * and the app runs to 375px, where the drawn split would leave the figure column
 * narrower than the `+` that opened the card — so it stacks, prose first. That
 * keeps the reading order the artboard's own left-to-right order, and puts the
 * source content ahead of a diagram that is unreadable at phone width anyway.
 * Enlarging is what answers that, not a bigger column.
 *
 * `items-center` because the two sides have no shared baseline to align on: the
 * bullets are a short stack against a near-square picture, and the artboard
 * centres them against each other rather than hanging both from the top.
 *
 * 20px bullets — the established pop-up body value, shared with
 * `MechanismsCard` and `BenefitsChallengesCard`, reused here because it is the
 * same fact rather than re-measured off this PNG.
 */
function EmicizumabCard() {
  return (
    <div className="flex flex-col items-center gap-8 py-6 lg:flex-row lg:gap-12">
      <BulletList items={EMICIZUMAB.body} className="flex-1 text-[20px] leading-[1.6]" />

      {/*
        **The white panel is load-bearing, not decoration.** `emicizumab.webp`
        carries a white background of its own, so dropped straight onto the
        card's mint gradient it reads as a white rectangle floating in tinted
        space — the problem `Popup`'s `surface="white"` exists to solve, here
        solved for one region instead of the whole card because the bullets
        beside it do want the gradient.

        Geometry is measured off the supplied PNG, which is the 1066px card at
        0.875 scale rather than a Figma node — so the radius and padding are
        approximations, the same caveat `MechanismsCard` records for its type.
        `basis-112` states the drawn ~450px column while leaving the figure free
        to shrink; `lg:` only, so the panel goes full width once stacked.

        The classes reach `ExpandableFigure`'s BUTTON, which is what makes the
        whole panel — padding included — the click target and the surface its
        hover wash covers. They win over the component's own `rounded-xl` by
        tailwind-merge, as its doc invites.
      */}
      <ExpandableFigure
        thumbSrc={emicizumabUrl}
        title={EMICIZUMAB_MOA.title}
        // **Bare**, not the §7.7 card. This expansion is the same picture the
        // reader just clicked, larger — a band and a border would announce a new
        // destination for a gesture that went nowhere, and the trigger is
        // already inside a card whose own band and ✕ would then be stacked
        // under a second pair. See `ExpandableFigure`'s `variant`.
        variant="bare"
        className="max-w-112 rounded-3xl bg-white p-4 lg:flex-1 lg:basis-112"
      >
        {/*
          `reserve` is 9rem against the 10rem default, and the two are not the
          same 9-ish: the default subtracts `Popup`'s crimson band, which is not
          here, while this subtracts what IS — 32px of the layer's `p-4`, 16px of
          `mt-4`, and ~64px for the sentence at two lines. Rounded up from ~7rem
          so a third line still fits without re-measuring.
        */}
        <PopupFigure
          src={emicizumabUrl}
          alt={MOA_FIGURE_ALT}
          width={MOA_FIGURE.width}
          height={MOA_FIGURE.height}
          reserve="9rem"
        />

        {/*
          The sentence this figure is a picture of — `emicizumab-moa`'s whole
          body, read rather than sliced.

          **White, where the card's copy is black.** It sits on the scrim now
          rather than on a card, and `ModalLayer`'s backdrop is `black/50` over a
          page that is itself mid-tone. `drop-shadow` rather than a panel behind
          it: the diagram's own white background runs to the edge above, so a
          second surface here would read as a torn one.

          `w-0 min-w-full` is `Lightbox`'s contract for prose, not a hack of its
          own: this sentence's max-content is ~1100px against the diagram's ~680,
          so left to contribute its natural width it stretches the whole column
          and the caption stops being centred *on the picture*. Zero intrinsic
          width, then fill what the picture settled on.
        */}
        <p className="mt-4 w-0 min-w-full text-center text-[20px] leading-[1.6] text-white drop-shadow-md">
          {EMICIZUMAB_MOA.body[0] as string}
        </p>
      </ExpandableFigure>
    </div>
  );
}

/**
 * One disclosure: its caption, then the `+`.
 *
 * **Caption to the LEFT of the button** on all four, which is `RebalancingAgents`'
 * arrangement rather than `DisclosureBand`'s stacked one — and the reason this is
 * a local component rather than a `DisclosureBand` call. That component is a
 * 3-tuple by type, drawn as an arch over three centred columns; this chapter has
 * four disclosures in two groups of two, so it is a different drawing, not a
 * fourth item.
 *
 * `caption` is a node rather than a string because the two groups tone
 * themselves differently — slate over lagoon at the left, flat lagoon in the
 * panel — and a component that took a string would have to be told which.
 *
 * `label` is the accessible name only; `PopupButton` prefixes it with
 * "Expand"/"Close" and renders nothing visible. It is passed the caption's own
 * words so the accessible name contains the visible label (WCAG 2.5.3), which is
 * the same contract `DisclosureBand` keeps by passing `label` to both.
 */
function Disclosure({
  caption,
  label,
  open,
  onToggle,
  hasCard = false,
}: {
  caption: ReactNode;
  label: string;
  open: boolean;
  onToggle: (next: boolean) => void;
  /**
   * Whether a card actually opens behind this `+`. Three of the four still open
   * nothing; see `OpenId`.
   *
   * Gates `aria-haspopup` only — the button toggles either way, because the ✕
   * is the whole of the open state on the three that have no card yet.
   */
  hasCard?: boolean;
}) {
  return (
    <li className="flex items-center gap-4">
      {caption}
      <PopupButton
        label={label}
        open={open}
        // Not `aria-controls`: a modal dialog lives in the top layer, so it is
        // not a region of this page the button expands. `undefined` rather than
        // `false` — the attribute has to be ABSENT on the three that open
        // nothing, and `aria-haspopup="false"` is a promise stated out loud.
        aria-haspopup={hasCard ? "dialog" : undefined}
        onClick={onToggle}
      />
    </li>
  );
}

/**
 * A left-hand caption: the agent's name over its regulatory status.
 *
 * `w-72` is the drawn 289px, and it is what produces the artboard's line breaks
 * — "Denecimig (Mim8):" fills the measure on its own, and its tail wraps to
 * three lines beneath. The two halves are `block` so the name keeps its own line
 * even where the tail would have fitted beside it.
 *
 * 26px at weights 900 and 500, which the scale has no step for (`text-h3` is 26
 * at 600) — raw under §8's precedent, as the chapter's bullets are. DM Sans is
 * loaded as a variable font, so both weights are real rather than synthesised.
 *
 * **The tail is `--color-popup-caption`, not the `lagoon-75` drawn here.** This
 * is the fourth artboard to disagree with the first two about the caption colour
 * (docs/styling.md §9 item 15), and the recorded call is that every chapter
 * renders the first value until the designer rules — so following the drawing
 * here would break the tie by accident rather than by decision. The lead's
 * `slate-100` is new and exact, and is transcribed.
 */
function AgentCaption({ title }: { title: string }) {
  const [lead, tail] = splitTitle(title);

  return (
    <p className="w-72 text-center text-[26px] leading-7.5 tracking-wide">
      <span className="block font-black text-brand-slate-100">{lead}</span>
      <span className="block font-medium text-popup-caption">{tail}</span>
    </p>
  );
}

/** A panel caption: one word, no status to tone against. Colour as above. */
function PanelCaption({ children }: { children: ReactNode }) {
  return (
    <p className="text-[26px] leading-6.5 font-black tracking-wide text-popup-caption">
      {children}
    </p>
  );
}

/**
 * The corner panel — the chapter's bottom-right block, carrying the two
 * investigational agents.
 *
 * Its gradient and shadow are a token pair (`tokens.css`, where the mint is
 * transcribed rather than derived and the measurements are recorded). The shadow
 * is cast up and left because those are the only two edges facing the page: the
 * other two sit in the corner.
 *
 * `overflow-hidden` is what clips the fill to the rounded corner — the artboard
 * sets `overflow: clip` on the frame for the same reason.
 *
 * **The radius steps down below `lg`.** 117px is drawn on a 675px panel, where
 * it reads as a corner; on a 320px phone it would eat a third of the width and
 * the heading would have to dodge it. 60px is an invented comfort value, stated
 * as one step of the same shape — the call `ProphylaxisGuidance` makes stepping
 * its `<h1>` down, and for the same reason: the canvas is 1440 and nobody has
 * drawn a phone.
 *
 * `grow lg:grow-0` is the two layouts in one: it ends the page below `lg`, and
 * above it holds the drawn 675 while `items-stretch` gives it the row's height.
 *
 * Vertically centred content — the artboard leaves 87px above the heading and
 * 87px below the buttons — so it stays centred as the panel grows past its drawn
 * 350px on a taller viewport.
 */
function EmergingPanel({ children }: { children: ReactNode }) {
  return (
    <section
      aria-labelledby="emerging-heading"
      className="grow overflow-hidden rounded-tl-[60px] bg-emerging-panel px-6 py-10 shadow-emerging-panel lg:w-168.75 lg:shrink-0 lg:grow-0 lg:rounded-tl-[117px]"
    >
      <div className="flex h-full flex-col items-center justify-center">
        {/* An `<h2>`: the chapter owns the `<h1>`. Sentence case as drawn —
            this one is NOT shouted, where the chapter heading is. */}
        <h2
          id="emerging-heading"
          className="max-w-148 text-center text-[26px] leading-6.5 font-black tracking-wide text-brand-crimson-50"
        >
          {PANEL_HEADING}
        </h2>

        {/* 56px between the two pairs, off the artboard; `flex-wrap` is for the
            phone, where they genuinely cannot share a line. */}
        <ul className="mt-14 flex flex-wrap items-center justify-center gap-x-14 gap-y-8">
          {children}
        </ul>
      </div>
    </section>
  );
}
