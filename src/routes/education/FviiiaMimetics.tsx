import { type ReactNode, useState } from "react";
import { PopupButton } from "mlg-components";

import denecimigUrl from "../../assets/images/denecimig.webp";
import emicizumabUrl from "../../assets/images/emicizumab.webp";
import inno8Url from "../../assets/images/inno8.webp";
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
const INNO8_OVERVIEW = topicById("inno8-overview")!;

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
 * The Inno8 panel's heading — a **literal**, and the only one of the four this
 * chapter has to state itself.
 *
 * The other three read a topic's `title`, because each of those cards splits a
 * figure topic off its overview to hold the prose drawn under the diagram. This
 * card draws no such prose (see `inno8-overview`), so there is no second topic
 * and the caption lives in `inno8-overview.figures[0]`. Stated rather than read
 * from that array for the reason `rebalancing-agents` records: a figure's title
 * is stated in this codebase, not derived — `figures` is the source's index of
 * what a topic illustrates, and indexing into it to title a control couples the
 * card to an array position.
 *
 * **The source's caption, not the one painted in the raster.** The asset carries
 * "Inno8: Novel Factor VIII Mimetic Bispecific Binder Engineered for Oral
 * Administration" in its own pixels — thirteen words, which as "Expand …" is a
 * control name nobody wants read to them. The painted line is reached through
 * `alt` instead, exactly as on the other two baked-heading panels.
 */
const INNO8_FIGURE_TITLE = "Inno8 Mechanism of Action";

/**
 * The Inno8 panel's description — and, like Denecimig's and NXT007's, it opens
 * with the panel's own painted heading (CONTEXT.md §7.7). Here that matters more
 * than on either of those: this heading is the one line of the card that says
 * what Inno8 *is* mechanistically, and `INNO8_FIGURE_TITLE` above deliberately
 * does not repeat it.
 *
 * **Three panels, described as three**, where the other two diagrams are one
 * picture each. The drawing is a left-to-right sequence — the binder and what its
 * two arms do, then the bridge it forms on the membrane, then the cleavage that
 * releases FXa — and its annotations are the whole content: this is the card's
 * only account of the mechanism, since the two bullets beside it cover the route
 * of administration and the trial instead.
 *
 * The second annotation reads "Anti-FIXa VHH" against the FX arm, where the arm
 * it labels is the anti-FX one. That is **as drawn**, and it is not repaired
 * here: this description transcribes the picture, and a reader comparing the two
 * should find them the same. Recorded in CONTEXT.md §7.5 as a source defect.
 */
const INNO8_FIGURE_ALT =
  "Diagram titled “Inno8: Novel Factor VIII Mimetic Bispecific Binder Engineered for Oral " +
  "Administration”, in three panels. At the left, Inno8 — two linked heavy-chain-only VHH " +
  "domains — sits between factor IX and factor X with a double-headed arrow to each: one VHH " +
  "binds the serum FIXa serine protease domain, the other binds the FX activation peptide so " +
  "that FXa is released upon activation, and Inno8 itself is about five times smaller than an " +
  "IgG antibody, with conjugated fatty acids that bind serum albumin to extend its half-life. " +
  "In the centre, those two domains bridge FIXa and FX on a membrane surface. At the right, an " +
  "arrow leads to FIXa cleaving FX: FXa is freed, and a crossed reverse arrow marks the released " +
  "FX activation peptide (FX AP) as not rebinding.";

/**
 * The panel's drawn size, and its aspect ratio.
 *
 * Half of `inno8.webp`'s 5224 × 2012, per the rule `PopupFigure` states — and, as
 * with the other two baked-heading assets, this file is not the 2× export that
 * rule was written for: the panel is drawn at ~886px in the card, so it is nearer
 * 6×. Half is still the right number to pass, because it is the widest this
 * raster can be painted at 2× density; here neither cap binds and it is the
 * card's own width that settles the picture.
 */
const INNO8_FIGURE = { width: 2612, height: 1006 } as const;

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
 * **All four open a card** as of Pop up 13 — the designer drew one behind each
 * of these (Pop ups 10–13) and all four are now built.
 *
 * `hasCard` on `Disclosure` below is therefore `true` at every call site today,
 * and it stays a prop rather than being inlined: what it gates is
 * `aria-haspopup`, and that attribute is a promise a disclosure can only make
 * once its card exists. This chapter spent three commits with one of the four
 * unable to keep it. A fifth agent arrives the same way.
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
  usePreloadImages([emicizumabUrl, denecimigUrl, nxt007Url, inno8Url]);

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
        // `text-5xl` only from `lg`, now the app-wide rule (docs/styling.md §2)
        // rather than this chapter's own call. The reason here came first and
        // still holds: at 52px this nine-word title takes six lines and 328px of
        // a 390 × 780 phone — 42% of the screen before the first bullet
        // (measured in Chrome). The other chapters were left bare on the
        // reasoning that two-to-six-word titles do not need it, which measuring
        // disproved — 52px overflows the column on a single long word, so all
        // six now step down too.
        className="font-display text-3xl font-bold tracking-wide text-brand-crimson-50 uppercase lg:text-5xl"
      >
        <span className="block">{preserveCase(HEADING_LEAD)}</span>{" "}
        <span className="block text-brand-slate-100">{preserveCase(HEADING_TAIL)}</span>
      </h1>

      {/* `mt-8` is the designer's 32px h1 gap, the value every chapter uses.
          26px is measured off the artboard and raw under §8's precedent — the
          nearest step, `text-2xl`, is 26px at weight 600 where this is 400.
          Four bullets, not the export's five: its last two are one sentence
          Figma broke across lines, which is why this reads the topic's `body`
          rather than the drawing.

          The size steps down one below `lg` — this chapter is the fourth case of
          §2's body-copy exception, with `rebalancing-agents`,
          `prophylaxis-guidance` and `/wizard/scenario`: those four transcribe
          their body at the artboards' 26px, so they have exactly one step to
          give, where the other chapters sit on the 16px legibility floor.
          `leading-tight` is a ratio and is stated once for both steps. */}
      <BulletList items={CHAPTER.body} className="mt-8 text-xl leading-tight lg:text-2xl" />

      {/*
        The bottom half: two disclosures at the left, the corner panel at the
        right.

        `grow` is what carries the panel to the bottom edge of the content box —
        `AppShell` is `lg:pb-0` with a `flex flex-1 flex-col` wrapper precisely
        so a page can do this, and at the 1440 × 800 canvas that lands the panel
        flush with the bottom of the page exactly as drawn.

        A flex ROW rather than a grid: the panel is the drawn 675, the left
        column takes what is left, and `items-stretch` — the default — is what
        makes the panel fill the row's height. Below the breakpoint the row
        becomes a column and the panel keeps `grow`, so it still ends the page;
        there it stops above the sidebar's bottom bar, which is `AppShell`'s
        `pb-bar` doing its job rather than a deviation.

        **`xl`, not `lg` — the row as drawn needs a 1394px viewport.** The left
        group is 447px (78 of indent + a 288px caption + `gap-4` + the 65px
        `PopupButton`, which is `shrink-0` in the package) and the panel is 675,
        so the row is 1122 against a content column of 752 at `lg` and 1008 at
        `xl` (§12). It was `lg:`, which is `rebalancing-agents`' failure on the
        same pixel: the width that turned the row on was the width that made it
        too wide, and the overflow ran ~285px past the column at 1024.

        The panel is the axis allowed to give — see `EmergingPanel` — so the
        captions keep the measure that produces their drawn line breaks at every
        width the row exists at.
      */}
      <div className="mt-14 flex grow flex-col gap-10 xl:flex-row xl:gap-0">
        {/*
          78px in from the content column's left edge — the artboard indents
          this group rather than aligning it to the gutter the heading and
          bullets use.

          `basis-112.5` states that group's own width: 450 = 78 + 288 + 16 + 65,
          rounded up off the scale's quarter step, with `shrink-0` so the whole
          of any deficit lands on the panel instead. `grow` still takes the
          slack at 1440, where 1168 − 675 leaves the column 493.

          **Centred below `xl`**, where the indent is gone and the pairs sit
          under full-width prose: the block beneath them is the panel, which
          centres its own heading and buttons, and a 369px group hugging the left
          of a 752px column reads as an accident rather than as the artboard's
          indent. Invented, like the panel's small-screen radius — no canvas
          exists below 1440.
        */}
        <ul className="flex flex-col items-center justify-center gap-20 xl:shrink-0 xl:grow xl:basis-112.5 xl:items-start xl:ps-19.5">
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
            hasCard
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

      {/* The one card in this chapter off `default`. It is the densest of the
          four — four bullets and a nested three in the left column, beside a
          panel and its own two sentences — and at `default` the left column is
          the drawn 424, where those bullets wrap far past the artboard's line
          count and the card scrolls on the design canvas itself. `wide` spends
          the extra 336px entirely on that column (the panel is fixed, at
          `xl:w-145`), which is the dimension the overflow is in. See
          docs/styling.md §13.

          `wide` is `96vw`, which is what made this the card the 2026-08-05 pass
          argued from: the extra width does not exist below ~1417px, so at 1024
          the fixed panel took 580 of an 845px body and left the prose 241.
          `DenecimigCard` carries that arithmetic. */}
      <Popup
        open={openId === "denecimig"}
        title={DENECIMIG_CARD_TITLE}
        width="wide"
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

      {/* The longest band in the chapter, and the one that keeps a cased term the
          designer did not shout: `preserveCase` carries "Inno8" through the
          band's `uppercase` because the artboard draws it that way — see the
          term list, where this is the one entry that is transcription rather than
          repair. */}
      <Popup open={openId === "inno8"} title={INNO8_OVERVIEW.title} onClose={() => setOpenId(null)}>
        {openId === "inno8" && <Inno8Card />}
      </Popup>
    </section>
  );
}

/**
 * Pop up 10: the three drawn bullets at the left, the MOA diagram at the right.
 *
 * A flex ROW above `xl` and a column below. The card is viewport-bound at
 * `92vw` and the app runs to 375px, where the drawn split would leave the figure
 * column narrower than the `+` that opened the card — so it stacks, prose first.
 * That keeps the reading order the artboard's own left-to-right order, and puts
 * the source content ahead of a diagram that is unreadable at phone width
 * anyway. Enlarging is what answers that, not a bigger column.
 *
 * **`xl`, not `lg`, since 2026-08-05** — the same move the chapter's own row
 * took, for a related reason: at 1024 the `92vw` card is 942px and its body 804,
 * so the split turned on while the card was at its narrowest and left the prose
 * 804 − 48 − 448 = **308px**. Above `xl` the card reaches its full 1140 and the
 * prose column is 506. Between the two the card is one column, which costs
 * scrolling inside `Popup`'s scroll region and buys back 496px of measure.
 *
 * `items-center` because the two sides have no shared baseline to align on: the
 * bullets are a short stack against a near-square picture, and the artboard
 * centres them against each other rather than hanging both from the top.
 *
 * 20px bullets — the established pop-up body value, shared with
 * `MechanismsCard` and `BenefitsChallengesCard`, reused here because it is the
 * same fact rather than re-measured off this PNG. It steps to 16 below `lg` on
 * `BenefitsChallengesCard`'s rule: at 375 this card's body is 345 − 10 − 32 =
 * 303px against the page's own 311px column, and a card may not set larger body
 * type than the page that opened it in a narrower measure. `leading-[1.6]` is a
 * ratio and covers both steps.
 */
function EmicizumabCard() {
  return (
    <div className="flex flex-col items-center gap-8 py-6 xl:flex-row xl:gap-12">
      <BulletList items={EMICIZUMAB.body} className="flex-1 text-base leading-[1.6] lg:text-xl" />

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
        to shrink; `xl:` only, so the panel goes full width once stacked.

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
        className="max-w-112 rounded-3xl bg-white p-4 xl:flex-1 xl:basis-112"
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

          It takes the card's own type ramp rather than the scrim's measure:
          `Lightbox` is full-viewport, so at 375 this sentence has 343px against
          the card's 303 — but it is the same sentence a reader is one gesture
          away from the bullets of, and the two disagreeing by a step would be
          the disproportion the ramp exists to fix.
        */}
        <p className="mt-4 w-0 min-w-full text-center text-base leading-[1.6] text-white drop-shadow-md lg:text-xl">
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
 * **The chapter's one `wide` card** — see the `Popup` that mounts it. The extra
 * width is all left column, so the arithmetic below is against a 1222px body
 * rather than the 886 the other three cards get.
 *
 * **`items-start`, where `EmicizumabCard` centres.** That card is a short bullet
 * stack against a near-square picture with no shared baseline; this one has two
 * columns of nearly equal height whose first lines the artboard aligns, so
 * centring would only introduce a drift that grows with the measure.
 *
 * Below `xl` it stacks prose-first, for `EmicizumabCard`'s reason: at 375px the
 * drawn split leaves the figure column narrower than the `+` that opened the
 * card, and a diagram unreadable at phone width is answered by enlarging rather
 * than by a wider column.
 *
 * **The breakpoint moved `lg` → `xl` on 2026-08-05, and this card is why the
 * other two moved with it.** `wide` is `96vw`, so at 1024 the card is 983px and
 * its body 845 — the extra width the step is named for simply is not there yet —
 * while the panel beside it is a fixed 580. That left the prose **241px**, for
 * four bullets with a nested three: the narrowest column in the chapter, on the
 * card that was widened to avoid exactly that. Above `xl` the body is 1091 and
 * the prose 487, reaching the drawn 618 at the 1440 canvas.
 *
 * 20px bullets — the established pop-up body value, shared with `EmicizumabCard`,
 * `MechanismsCard` and `BenefitsChallengesCard`, stepping to 16 below `lg` with
 * them. This card is denser than any of them (four bullets and a nested three
 * beside a panel) and will scroll sooner on a short viewport; that is `Popup`'s
 * scroll region doing its job, and reusing the value is what keeps two cards a
 * reader opens in sequence one size.
 */
function DenecimigCard() {
  return (
    <div className="flex flex-col items-start gap-8 py-6 xl:flex-row xl:gap-6">
      <BulletList items={DENECIMIG.body} className="flex-1 text-base leading-[1.6] lg:text-xl" />

      {/*
        The right column: the panel, then the two sentences under it. `w-112` is
        the drawn ~450px, the same number `EmicizumabCard` lands on from a
        different artboard — 540 of the 1065px content column there, 448 here.

        **A fixed width with `shrink-0`, not `flex-1 basis-112`.** That pair is
        what `EmicizumabCard` writes, but it means "448 *plus a share of what is
        left*" — and this card is the chapter's `wide` one, so what is left is
        336px more than the artboard has: a growing panel would take most of it
        and paint `denecimig.webp` well past the size it was drawn at. Fixed, the
        whole of the extra width lands in the left column, which is where the
        four bullets that motivated `wide` actually are — 750px against the drawn
        424. (`EmicizumabCard` gets away with the growing pair only because its
        figure carries a `max-w-112` that caps the overgrown column back down.)
      */}
      <div className="flex w-full flex-col gap-3 xl:w-145 xl:shrink-0">
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
            the card, not on the scrim, so it takes the card's own type ramp. */}
        <BulletList items={DENECIMIG_MOA.body} className="text-base leading-[1.6] lg:text-xl" />
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
 * stack below `xl` with the prose first because at 375px the drawn split leaves
 * the figure column narrower than the `+` that opened the card.
 *
 * The breakpoint is `xl` since 2026-08-05, with the other two: at 1024 this
 * card's body is 804 and the split left the prose 332px. Not the chapter's worst
 * — that is `DenecimigCard`'s 241, which is where the argument was made — but
 * all four cards stacking at one width is what keeps the rule legible to a
 * reader opening them in sequence.
 *
 * 20px bullets — the established pop-up body value, shared with the other three
 * cards, stepping to 16 below `lg` with them. The artboard sets this card's type
 * a shade smaller (it is drawn on a 1141px card against `Popup`'s 1024), which is
 * not re-measured here for the reason `DenecimigCard` records: two cards a reader
 * opens in sequence should be one size, and the value is the same fact rather
 * than a per-PNG reading.
 */
function Nxt007Card() {
  return (
    <div className="flex flex-col items-start gap-8 py-6 xl:flex-row xl:gap-6">
      <BulletList
        items={NXT007_OVERVIEW.body}
        className="flex-1 text-base leading-[1.6] lg:text-xl"
      />

      {/* The right column: the panel, then the sentence under it. `w-112` is the
          drawn ~450px — 543 of the artboard's 1075px content column, which is
          448 of `Popup`'s 896 — leaving the left column the 424 it is drawn at. */}
      <div className="flex w-full flex-col gap-3 xl:w-112 xl:shrink-0">
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
        <p className="text-center text-base leading-[1.6] text-black lg:text-xl">
          {NXT007_STRUCTURE.body[0] as string}
        </p>
      </div>
    </div>
  );
}

/**
 * Pop up 13: the two drawn bullets across the top, the MOA panel beneath them.
 *
 * **A column, where the other three cards are two columns.** Not a simplification
 * of them — it is what the artboard draws, and the reason it can: this panel is
 * 2.6:1 where the other three diagrams are between 1:1 and 1.6:1, so a 448px
 * half-card would paint it 172px tall and its annotations unreadable. Given the
 * full 886 the picture gets its drawn height and the two bullets, which are one
 * line each at this measure, cost the 64px above it.
 *
 * That also means **no layout breakpoint anywhere here.** The other three cards
 * carry one because their drawn split has to become a stack on a phone; this one
 * is already stacked, and it narrows to 375px by doing exactly what it does at
 * 1440. It was untouched when those three moved `lg` → `xl` on 2026-08-05, for
 * the same reason it had nothing at `lg`.
 *
 * 20px bullets — the established pop-up body value, shared with the other three
 * cards, and stepping to 16 below `lg` with them: the type ramp is a question
 * about measure rather than about layout, so it reaches this card as it reaches
 * the rest. `leading-[1.6]` covers both steps, where the artboard sets these two
 * lines tighter at ~1.2: this card has the vertical room to spare (two bullets
 * against NXT007's three plus a nested pair), and two cards a reader opens in
 * sequence should be one size. The same call `DenecimigCard` records for the
 * size itself.
 */
function Inno8Card() {
  return (
    <div className="flex flex-col gap-3 py-6">
      <BulletList items={INNO8_OVERVIEW.body} className="text-base leading-[1.6] lg:text-xl" />

      {/*
        **No white panel in markup**, as on the Denecimig and NXT007 cards:
        `inno8.webp` carries the white surface, the crimson heading and the
        rounded corners in its own pixels, with real alpha outside the radius, so
        a `bg-white rounded-3xl p-4` wrapper would paint a second, larger corner
        around the first. Measured, the artboard's panel is 1086 × 417 against the
        file's 5224 × 2012 — the same ratio to within a pixel, so it IS the
        asset's own box.

        `rounded-3xl` is therefore about the BUTTON, not the picture — it clips
        the hover wash to the corner the asset already has. The baked radius is
        145px of 5224, which at the drawn 886 comes to ~25px; this step is 24.

        No width class at all, where the other two cards set `w-112` on a column:
        this panel is the card's full measure, which is what `ExpandableFigure`'s
        own `w-full` already gives it.
      */}
      <ExpandableFigure
        thumbSrc={inno8Url}
        title={INNO8_FIGURE_TITLE}
        // **Bare**, for the reasons all three other cards record: the enlargement
        // is the same picture the reader just clicked, and this raster paints its
        // own heading, so a crimson band over it would state a title twice.
        variant="bare"
        className="rounded-3xl"
      >
        {/*
          The picture alone on the scrim, with no caption — and here that is not
          a choice between two sentences the way it is on the other cards, since
          this one draws no prose under its panel at all.

          `reserve` is 5rem, the same subtraction the other two bare enlargements
          make: none of `Popup`'s chrome is here, and what is is `Lightbox`'s own
          `p-4 sm:p-8` — 64px at `sm` — rounded up so the ✕ keeps its corner
          clearance. At 2.6:1 it is the width that binds anyway.
        */}
        <PopupFigure
          src={inno8Url}
          alt={INNO8_FIGURE_ALT}
          width={INNO8_FIGURE.width}
          height={INNO8_FIGURE.height}
          reserve="5rem"
        />
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
 * **Below `sm` the pair becomes a column, centred.** Side by side, the widest
 * caption's drawn 288px measure plus `gap-4` and the package's 65px button need
 * 369, where a 375px phone gives the content column 311 — so the caption was
 * being squeezed to 230 and losing the line breaks its measure exists to
 * produce. Stacked it gets the full column, and `items-center` does both jobs
 * without a second class: it centres the two boxes in the column below `sm` and
 * centres the caption against the button above it.
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
    <li className="flex flex-col items-center gap-4 sm:flex-row">
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
 * 26px at weights 900 and 500, which the scale has no step for (`text-2xl` is 26
 * at 600) — raw under §8's precedent, as the chapter's bullets are. DM Sans is
 * loaded as a variable font, so both weights are real rather than synthesised.
 * It steps to 20px below `lg` with everything else on the page, which is what
 * the other four chapters' disclosure captions already take.
 *
 * **`leading-tight` where the drawn value was `leading-7.5`.** An absolute 30px
 * cannot survive a size step — held against 20px type it is a ratio of 1.5 — so
 * the leading is stated as the ratio it actually renders at today: 30 over the
 * shipped `text-2xl` is 1.25, which is `leading-tight` exactly, and one class
 * covers both steps the way the chapter's bullets already do. Nothing moves at
 * 1440. The drawn 30px/26px pair is recorded in docs/styling.md §11, which is
 * where the transcription now lives rather than in these class names.
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
    <p className="w-72 text-center text-xl leading-tight tracking-wide lg:text-2xl">
      <span className="block font-black text-brand-slate-100">{lead}</span>
      <span className="block font-medium text-popup-caption">{tail}</span>
    </p>
  );
}

/**
 * A panel caption: one word, no status to tone against. Colour as above, and the
 * same one-step ramp.
 *
 * `leading-[1.08]` is `AgentCaption`'s move on this section's other drawn value:
 * the artboard's 26px leading over the shipped `text-2xl` is 26/24, so the ratio
 * is stated once and renders exactly what the absolute `leading-6.5` did at
 * 1440. It is shared with the panel's own `<h2>`, which is the one place it has
 * more than one line to act on.
 */
function PanelCaption({ children }: { children: ReactNode }) {
  return (
    <p className="text-xl leading-[1.08] font-black tracking-wide text-popup-caption lg:text-2xl">
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
 * **The radius steps down below `lg`, and that is deliberately NOT the
 * breakpoint the layout moves on.** 117px is drawn on a 675px panel, where it
 * reads as a corner; on a 320px phone it would eat a third of the width and the
 * heading would have to dodge it. 60px is an invented comfort value, stated as
 * one step of the same shape — the call `ProphylaxisGuidance` makes stepping its
 * `<h1>` down, and for the same reason: the canvas is 1440 and nobody has drawn
 * a phone. It stays on `lg` because between 1024 and 1279 this panel is
 * full-width — 752 to 1008px, i.e. WIDER than the 675 the radius was drawn on —
 * so the drawn corner reads there as drawn or better. Two breakpoints, two
 * questions.
 *
 * `grow xl:grow-0` is the two layouts in one: it ends the page below `xl`, and
 * above it holds the drawn 675 while `items-stretch` gives it the row's height.
 *
 * **No `shrink-0`, and its absence is the pass.** The row as drawn needs a
 * 1394px viewport (see the row above), so between `xl` and there something has
 * to give, and this is it: the left group is `shrink-0`, so the whole deficit
 * lands here and the panel paints 558px at 1280 — 83% of drawn — reaching the
 * full 675 at 1397 and holding it to the 1440 canvas. It is the right axis
 * because this panel is a fluid container rather than a reserved box: it already
 * stretches past its drawn 350px height on a taller viewport, where
 * `rebalancing-agents`' placeholders may not resize at all.
 *
 * Vertically centred content — the artboard leaves 87px above the heading and
 * 87px below the buttons — so it stays centred as the panel grows past its drawn
 * 350px on a taller viewport.
 */
function EmergingPanel({ children }: { children: ReactNode }) {
  return (
    <section
      aria-labelledby="emerging-heading"
      className="-mr-6 -mb-4 grow overflow-hidden rounded-tl-[3.75rem] bg-emerging-panel px-6 py-10 shadow-emerging-panel sm:mr-0 lg:mb-0 lg:rounded-tl-[7.3125rem] xl:w-168.75 xl:grow-0"
    >
      <div className="flex h-full flex-col items-center justify-center">
        {/* An `<h2>`: the chapter owns the `<h1>`. Sentence case as drawn —
            this one is NOT shouted, where the chapter heading is. */}
        <h2
          id="emerging-heading"
          className="max-w-148 text-center text-xl leading-[1.08] font-black tracking-wide text-brand-crimson-50 lg:text-2xl"
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
