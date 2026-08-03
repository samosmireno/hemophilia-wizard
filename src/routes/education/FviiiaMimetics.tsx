import { type ReactNode, useState } from "react";
import { PopupButton } from "mlg-components";

import denecimigUrl from "../../assets/images/denecimig.webp";
import emicizumabUrl from "../../assets/images/emicizumab.webp";
import nxt007Url from "../../assets/images/nxt007.webp";
import BulletList from "../../components/BulletList";
import ExpandableFigure from "../../components/ExpandableFigure";
import Popup from "../../components/Popup";
import PopupFigure from "../../components/PopupFigure";
import { topicById } from "../../data/education";
import { usePreloadImages } from "../../lib/preloadImage";
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
const DENECIMIG_MOA = topicById("denecimig-moa")!;
const NXT007_OVERVIEW = topicById("nxt007-overview")!;
const NXT007_STRUCTURE = topicById("nxt007-structure")!;

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
 * The Denecimig card's heading, and a literal for exactly the reason above: the
 * band draws "DENECIMIG (MIM8)" where the topic's title carries "Investigational;
 * currently under FDA review" as well. Same pair on the way in — "Expand Denecimig
 * (Mim8): Investigational; currently under FDA review" on the `+`, "Denecimig
 * (Mim8)" on the dialog.
 *
 * **No `preserveCase` term is needed for `Mim8`.** The band's `uppercase` renders
 * it "MIM8", which is what the artboard draws — unlike `FVIIIa` or `BsAb`, the 8
 * is not a case distinction that carries meaning.
 */
const DENECIMIG_CARD_TITLE = "Denecimig (Mim8)";

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
 * The Denecimig panel's description — and it opens with the panel's **heading**,
 * which the other figure's does not have to.
 *
 * `denecimig.webp` carries its crimson title in the pixels, so that line is
 * image-borne exactly as the factor labels are (CONTEXT.md §7.7) and `alt` is the
 * only route to it. Stating it here is what stops the chapter drawing it twice:
 * `denecimig-moa.title` names the figure for the trigger and the enlargement's
 * accessible name, and nothing paints it.
 *
 * The rest is the **pathway**, not the structure — the drawing is a left-to-right
 * sequence ending in a clot, where the emicizumab diagram is a static set of
 * bindings. Neither is a house style the other should be edited into; each says
 * what its own picture shows.
 */
const DENECIMIG_FIGURE_ALT =
  "Diagram titled “Mechanism of Action for Denecimig (Mim8): FVIIIa-mimetic BsAb”. " +
  "Mim8, a Y-shaped bispecific antibody, binds factor IXa and factor X on an activated " +
  "platelet surface and bridges them, converting factor X to factor Xa. Factor Xa with " +
  "factor Va then converts factor II to factor IIa, which forms a blood clot.";

/**
 * The panel's drawn size, and its aspect ratio.
 *
 * Half of `denecimig.webp`'s 3852 × 2464, per the rule `PopupFigure` states —
 * but note this asset is **not** the 2× export the rule was written for: the
 * panel is drawn at ~450px in the card, so the file is nearer 8×. Half is still
 * the right number to pass, because it is the widest this raster can be painted
 * at 2× density; it simply never binds here, and the height cap is what settles
 * the enlargement. The ratio is what the reservation actually needs.
 */
const DENECIMIG_FIGURE = { width: 1926, height: 1232 } as const;

/**
 * The NXT007 panel's description — and, like Denecimig's, it opens with the
 * panel's **heading**, because `nxt007.webp` carries that crimson line in its own
 * pixels (CONTEXT.md §7.7). Stating it here is what stops the card drawing it
 * twice: `nxt007-structure.title` names the figure for the trigger and the
 * enlargement's accessible name, and nothing paints it.
 *
 * **A structure, where the other two describe a mechanism.** This drawing is not
 * a pathway and not a set of bindings — it is one antibody taken apart and
 * labelled, so the description walks the molecule (arms, then light chains, then
 * the Fc stem) rather than following a reaction. The charge glyphs at the chain
 * interfaces are named because they are the whole point of the sentence drawn
 * under the panel: the "charged-residue mutations" are these.
 */
const NXT007_FIGURE_ALT =
  "Diagram titled “NXT007 BsAb Structure”, subtitled “Further optimized Hch (heavy chain) of " +
  "emicizumab”. NXT007 is a Y-shaped bispecific antibody whose two arms are labelled anti-FIXa " +
  "and anti-FX. Each arm pairs a heavy chain with its own non-common light chain, and plus and " +
  "minus symbols mark the charged residues at the two interfaces. The paired stem below is " +
  "labelled as having increased binding activity against FcRn.";

/**
 * The panel's drawn size, and its aspect ratio.
 *
 * Half of `nxt007.webp`'s 2176 × 1392, per the rule `PopupFigure` states — and,
 * as with `denecimig.webp`, this asset is not the 2× export that rule was written
 * for: the panel is drawn at ~450px in the card, so the file is nearer 5×. Half
 * is still the right number to pass, because it is the widest this raster can be
 * painted at 2× density; the height cap is what settles the enlargement.
 */
const NXT007_FIGURE = { width: 1088, height: 696 } as const;

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

/**
 * The two panel captions, flat where the cards behind them carry longer titles.
 *
 * `NXT007` is the one place in this chapter where the caption and the card's
 * heading agree — Pop up 12's band draws the agent's name and it has no status
 * to shed, so the `+` promises "Expand NXT007" and the dialog is named NXT007.
 * Still two strings: this one is the panel's word for the button, and the card
 * reads `nxt007-overview.title`, which is the split the other three record.
 */
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
 * **Three of the four open a card.** The designer has drawn one behind each of
 * these four (Pop ups 10–13) and has delivered three; Inno8's asset is here but
 * its layout is not, and is not guessed at. That one button therefore still
 * toggles and nothing more, which is the content-less case `DisclosureBand`
 * already models.
 *
 * `aria-haspopup` follows the same split, for the reason it is conditional
 * there: announcing a dialog that will not appear is worse than announcing
 * nothing. Hence `hasCard` on `Disclosure` below rather than the attribute
 * hard-coded on all four — one `false` left is still one promise not made.
 */
type OpenId = "emicizumab" | "denecimig" | "nxt007" | "inno8";

export default function FviiiaMimetics() {
  const [openId, setOpenId] = useState<OpenId | null>(null);

  /** Curried so each call site reads as the one disclosure it belongs to. */
  const toggle = (id: OpenId) => (next: boolean) => setOpenId(next ? id : null);

  /**
   * Both MOA diagrams are **two cards deep** — each lives inside its agent
   * card's `ExpandableFigure`, and those cards' children do not exist until the
   * `+` is clicked — so nothing requests them during the chapter's own load and
   * a cold figure opens to an empty box that jumps once the picture lands (see
   * `PopupFigure`). Warmed from here, the nearest scope that stays mounted,
   * exactly as the other chapters warm theirs.
   *
   * One URL per card, not two: each card's in-card thumbnail and its
   * enlargement are the same file, so both uses are warm on the same call.
   */
  usePreloadImages([emicizumabUrl, denecimigUrl, nxt007Url]);

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
            hasCard
          />
        </ul>

        <EmergingPanel>
          <Disclosure
            caption={<PanelCaption>{NXT007}</PanelCaption>}
            label={NXT007}
            open={openId === "nxt007"}
            onToggle={toggle("nxt007")}
            hasCard
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

        Sibling mounts rather than one `Popup` reading a `Record` keyed by
        `OpenId` — the exhaustive shape `rebalancing-agents` uses for its steps.
        A `Record` here would demand an entry nobody has drawn, and at three
        cards the indirection would only move each card's title a hop away from
        the card it belongs to. Only one can ever be up: `showModal()` makes the
        rest of the document inert, so the other triggers are unreachable.
      */}
      <Popup open={openId === "emicizumab"} title={CARD_TITLE} onClose={() => setOpenId(null)}>
        {openId === "emicizumab" && <EmicizumabCard />}
      </Popup>

      <Popup
        open={openId === "denecimig"}
        title={DENECIMIG_CARD_TITLE}
        onClose={() => setOpenId(null)}
      >
        {openId === "denecimig" && <DenecimigCard />}
      </Popup>

      {/* The band draws the agent's name, which for this one agent is also the
          panel's caption for it — see `NXT007`. Read off the topic rather than
          the caption const, so the card is titled by its own content. */}
      <Popup
        open={openId === "nxt007"}
        title={NXT007_OVERVIEW.title}
        onClose={() => setOpenId(null)}
      >
        {openId === "nxt007" && <Nxt007Card />}
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
 * Pop up 11: the four drawn bullets at the left, the MOA panel and its two
 * sentences at the right.
 *
 * **`items-start`, where `EmicizumabCard` centres.** That card is a short bullet
 * stack against a near-square picture with no shared baseline; this one has two
 * columns of nearly equal height whose first lines the artboard aligns, so
 * centring would only introduce a drift that grows with the measure.
 *
 * Below `lg` it stacks prose-first, for `EmicizumabCard`'s reason: at 375px the
 * drawn split leaves the figure column narrower than the `+` that opened the
 * card, and a diagram unreadable at phone width is answered by enlarging rather
 * than by a wider column.
 *
 * 20px bullets — the established pop-up body value, shared with `EmicizumabCard`,
 * `MechanismsCard` and `BenefitsChallengesCard`. This card is denser than any of
 * them (four bullets and a nested three beside a panel) and will scroll sooner on
 * a short viewport; that is `Popup`'s scroll region doing its job, and reusing
 * the value is what keeps two cards a reader opens in sequence one size.
 */
function DenecimigCard() {
  return (
    <div className="flex flex-col items-start gap-8 py-6 lg:flex-row lg:gap-6">
      <BulletList items={DENECIMIG.body} className="flex-1 text-[20px] leading-[1.6]" />

      {/*
        The right column: the panel, then the two sentences under it. `w-112` is
        the drawn ~450px, the same number `EmicizumabCard` lands on from a
        different artboard — 540 of the 1065px content column there, 448 of
        `Popup`'s 896 here, leaving the left column the 424 it is drawn at.

        **A fixed width with `shrink-0`, not `flex-1 basis-112`.** That pair is
        what `EmicizumabCard` writes, but it means "448 *plus a share of what is
        left*" — and both columns growing splits the free space between them, so
        the left one settles ~210px narrower than drawn and this card's four
        bullets wrap to twice their height. It is invisible there only because
        the figure carries a `max-w-112` that caps the overgrown column back
        down; here the panel would happily fill it.
      */}
      <div className="flex w-full flex-col gap-3 lg:w-112 lg:shrink-0">
        {/*
          **No white panel in markup**, which is the one structural difference
          from `EmicizumabCard`: `denecimig.webp` carries the white surface, the
          crimson heading and the rounded corners in its own pixels, with real
          alpha outside the radius. A `bg-white rounded-3xl p-4` wrapper here
          would paint a second, larger corner around the first.

          `rounded-2xl` is therefore about the BUTTON, not the picture — it is
          what clips the hover wash to the corner the asset already has, at the
          ~16px that radius comes to at the drawn width. It wins over the
          component's `rounded-xl` by tailwind-merge, as its doc invites.
        */}
        <ExpandableFigure
          thumbSrc={denecimigUrl}
          title={DENECIMIG_MOA.title}
          // **Bare**, and for `EmicizumabCard`'s reason plus one of its own: the
          // enlargement is the same picture, and this raster paints its own
          // heading, so a crimson band over it would state the title twice.
          variant="bare"
          className="rounded-2xl"
        >
          {/*
            The picture alone on the scrim — no caption, where the emicizumab
            enlargement carries one. That sentence renders nowhere else; these
            two do, in the card immediately behind this layer, so repeating them
            would shrink the diagram the reader clicked to see bigger.

            `reserve` is 5rem against the 10rem default, and it is a different
            subtraction: the default is `Popup`'s band and body padding, none of
            which is here. What IS here is `Lightbox`'s own `p-4 sm:p-8` — 64px
            at `sm` — rounded up so the ✕ in the corner keeps its clearance.
          */}
          <PopupFigure
            src={denecimigUrl}
            alt={DENECIMIG_FIGURE_ALT}
            width={DENECIMIG_FIGURE.width}
            height={DENECIMIG_FIGURE.height}
            reserve="5rem"
          />
        </ExpandableFigure>

        {/* `denecimig-moa`'s whole body, read rather than sliced — see the topic.
            Black on the card's gradient, as the left column is: this list is in
            the card, not on the scrim. */}
        <BulletList items={DENECIMIG_MOA.body} className="text-[20px] leading-[1.6]" />
      </div>
    </div>
  );
}

/**
 * Pop up 12: the three drawn bullets at the left, the structure panel and its
 * one sentence at the right.
 *
 * The Denecimig card's shape rather than the Emicizumab one, and for its reasons:
 * `items-start` because the two columns are of comparable height and the artboard
 * aligns their first lines, a fixed `w-112 shrink-0` at the right because both
 * columns growing would leave the left one ~210px narrower than drawn, and a
 * stack below `lg` with the prose first because at 375px the drawn split leaves
 * the figure column narrower than the `+` that opened the card.
 *
 * 20px bullets — the established pop-up body value, shared with the other three
 * cards. The artboard sets this card's type a shade smaller (it is drawn on a
 * 1141px card against `Popup`'s 1024), which is not re-measured here for the
 * reason `DenecimigCard` records: two cards a reader opens in sequence should be
 * one size, and the value is the same fact rather than a per-PNG reading.
 */
function Nxt007Card() {
  return (
    <div className="flex flex-col items-start gap-8 py-6 lg:flex-row lg:gap-6">
      <BulletList items={NXT007_OVERVIEW.body} className="flex-1 text-[20px] leading-[1.6]" />

      {/* The right column: the panel, then the sentence under it. `w-112` is the
          drawn ~450px — 543 of the artboard's 1075px content column, which is
          448 of `Popup`'s 896 — leaving the left column the 424 it is drawn at. */}
      <div className="flex w-full flex-col gap-3 lg:w-112 lg:shrink-0">
        {/*
          **No white panel in markup**, as on the Denecimig card and unlike the
          Emicizumab one: `nxt007.webp` carries the white surface, the crimson
          heading and the rounded corners in its own pixels, with real alpha
          outside the radius. A `bg-white rounded-3xl p-4` wrapper here would
          paint a second, larger corner around the first — and the artboard's
          panel is this asset's own box, measured: 543 × 348 against the file's
          2176 × 1392, the same ratio to within a pixel.

          `rounded-3xl` is therefore about the BUTTON, not the picture — it clips
          the hover wash to the corner the asset already has. The baked radius is
          117px of 2176, which at the drawn 448 comes to ~24px; that is this step
          exactly, where Denecimig's shallower ratio lands a step below.
        */}
        <ExpandableFigure
          thumbSrc={nxt007Url}
          title={NXT007_STRUCTURE.title}
          // **Bare**, for the reasons both other cards record: the enlargement is
          // the same picture the reader just clicked, and this raster paints its
          // own heading, so a crimson band over it would state the title twice.
          variant="bare"
          className="rounded-3xl"
        >
          {/*
            The picture alone on the scrim — no caption, as on the Denecimig
            enlargement and for its reason: the sentence renders in the card
            immediately behind this layer, so repeating it would only shrink the
            diagram the reader clicked to see bigger.

            `reserve` is 5rem, the same subtraction Denecimig's makes: none of
            `Popup`'s chrome is here, and what is is `Lightbox`'s own `p-4 sm:p-8`
            — 64px at `sm` — rounded up so the ✕ keeps its corner clearance.
          */}
          <PopupFigure
            src={nxt007Url}
            alt={NXT007_FIGURE_ALT}
            width={NXT007_FIGURE.width}
            height={NXT007_FIGURE.height}
            reserve="5rem"
          />
        </ExpandableFigure>

        {/*
          `nxt007-structure`'s whole body, read rather than sliced — see the topic.

          **A centred paragraph, where the Denecimig card sets a `BulletList`.**
          That is the artboard's drawing, not a shortcut for a one-item list: it
          draws no marker and centres all four lines on the panel above, which is
          a caption for the picture rather than a list of one. Black on the card's
          gradient, as the left column is — this sits in the card, not on the
          scrim, so it needs none of the Emicizumab enlargement's white-on-black
          treatment.
        */}
        <p className="text-center text-[20px] leading-[1.6] text-black">
          {NXT007_STRUCTURE.body[0] as string}
        </p>
      </div>
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
   * Whether a card actually opens behind this `+`. One of the four still opens
   * nothing; see `OpenId`.
   *
   * Gates `aria-haspopup` only — the button toggles either way, because the ✕
   * is the whole of the open state on the one that has no card yet.
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
