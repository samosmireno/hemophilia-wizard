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
import { EDUCATION_TOPICS } from "../../data/education";
import { usePreloadImages } from "../../lib/preloadImage";
import { preserveCase } from "../../lib/preserveCase";

const CHAPTER = EDUCATION_TOPICS["fviii-mimetics"];
const EMICIZUMAB = EDUCATION_TOPICS["emicizumab-overview"];
const EMICIZUMAB_MOA = EDUCATION_TOPICS["emicizumab-moa"];
const DENECIMIG = EDUCATION_TOPICS["denecimig-overview"];
const DENECIMIG_MOA = EDUCATION_TOPICS["denecimig-moa"];
const NXT007_OVERVIEW = EDUCATION_TOPICS["nxt007-overview"];
const NXT007_STRUCTURE = EDUCATION_TOPICS["nxt007-structure"];
const INNO8_OVERVIEW = EDUCATION_TOPICS["inno8-overview"];

/** The card band's heading, where the topic's title carries "(FDA-approved)" too. */
const CARD_TITLE = "Emicizumab";

/** The card band's heading, where the topic's title carries the review status too. */
const DENECIMIG_CARD_TITLE = "Denecimig (Mim8)";

/**
 * Structural rather than mechanistic: `EMICIZUMAB_MOA.body` carries the mechanism
 * in words directly beneath the picture. Do not "fix" this into the longer house
 * style without moving that prose.
 */
const MOA_FIGURE_ALT =
  "Diagram of emicizumab, a Y-shaped bispecific antibody, with double-headed arrows to " +
  "factor Xa, factor X, factor IXa, and factor IX on a phospholipid membrane.";

/** Half of `emicizumab.webp`'s 1408 × 1468 — the drawn size, and the reserved ratio. */
const MOA_FIGURE = { width: 704, height: 734 } as const;

/** Opens with the panel's own heading, which `denecimig.webp` paints in its pixels. */
const DENECIMIG_FIGURE_ALT =
  "Diagram titled “Mechanism of Action for Denecimig (Mim8): FVIII mimetic BsAb”. " +
  "Denecimig (Mim8), a Y-shaped bispecific antibody, binds factor IXa and factor X on an activated " +
  "platelet surface and bridges them, converting factor X to factor Xa. Factor Xa with " +
  "factor Va then converts factor II to factor IIa, which forms a blood clot.";

// Not half of the current 2176 × 1392 file: the width is a cap, and the ratio —
// which is what the reservation needs — still matches.
const DENECIMIG_FIGURE = { width: 1926, height: 1232 } as const;

/**
 * The heading `nxt007.webp` paints, which is not `nxt007-structure.title` — the
 * data module transcribes the source's bare code name, this names what a reader
 * can see. Sentence case on "structure" is transcription, not a slip.
 */
const NXT007_FIGURE_TITLE = "Zemocimig (NXT007) BsAb structure";

/** Opens with the panel's own heading, which `nxt007.webp` paints in its pixels. */
const NXT007_FIGURE_ALT =
  "Diagram titled “Zemocimig (NXT007) BsAb structure”, subtitled “Emicizumab-derived heavy " +
  "chains”. NXT007 is a Y-shaped bispecific antibody whose two arms are labelled anti-FIXa " +
  "and anti-FX. Each arm pairs a heavy chain with its own novel light chain, and plus and " +
  "minus symbols mark the charged residues at the two interfaces. The paired stem below is " +
  "labelled as having increased binding activity against FcRn.";

// Half of `nxt007.webp`'s 2176 × 1500. The ratio must match the file — `PopupFigure`
// writes the pair straight into `aspect-ratio`.
const NXT007_FIGURE = { width: 1088, height: 750 } as const;

/** The source's caption, not the thirteen-word one painted in the raster. */
const INNO8_FIGURE_TITLE = "Inno8 Mechanism of Action";

/**
 * Opens with the panel's own painted heading. The second annotation reads
 * "Anti-FIXa VHH" against the FX arm — as drawn, and not repaired here; CONTEXT.md
 * §7.5 records it as a source defect.
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

// Not half of the current 4352 × 1676 file: the width is a cap, and the ratio still matches.
const INNO8_FIGURE = { width: 2612, height: 1006 } as const;

// The artboard's "in early- stage development:" is a PDF soft-hyphen artifact, so it
// is one word here. The trailing colon IS drawn and is kept.
const PANEL_HEADING = "Investigational FVIII mimetic therapies in earlier-stage development:";

// The client's display name (CONTEXT.md §7.5); `nxt007-overview.title` keeps the
// source's bare "NXT007" — the data module transcribes, this is presentation.
const NXT007 = "Zemocimig (NXT007)";
const INNO8 = "Inno8";

/**
 * A title as the artboard tones it: a lead in one colour, a tail in another.
 *
 * Colon FIRST, then paren — the order is load-bearing.
 */
function splitTitle(title: string): [lead: string, tail: string] {
  const colon = title.indexOf(": ");
  if (colon !== -1) return [title.slice(0, colon + 1), title.slice(colon + 2)];

  const paren = title.indexOf(" (");
  if (paren !== -1) return [title.slice(0, paren), title.slice(paren + 1)];

  return [title, ""];
}

const [HEADING_LEAD, HEADING_TAIL] = splitTitle(CHAPTER.title);

/** Which disclosure is showing its ✕. `null` is all four closed. */
type OpenId = "emicizumab" | "denecimig" | "nxt007" | "inno8";

export default function FviiiMimetics() {
  const [openId, setOpenId] = useState<OpenId | null>(null);

  /** Curried so each call site reads as the one disclosure it belongs to. */
  const toggle = (id: OpenId) => (next: boolean) => setOpenId(next ? id : null);

  usePreloadImages([emicizumabUrl, denecimigUrl, nxt007Url, inno8Url]);

  return (
    <section aria-labelledby="chapter-heading" className="flex flex-1 flex-col">
      {/* Uppercase is CSS, not copy — the accessible name stays title case.
          `aria-label` is required, not belt-and-braces: the two-tone split makes
          the name algorithm announce "FVIII Mimetic BsAbs : Approved…". The `{" "}`
          keeps `textContent` equal to the source title. */}
      <h1
        id="chapter-heading"
        aria-label={CHAPTER.title}
        className="font-display text-3xl font-bold tracking-wide text-brand-crimson-50 uppercase lg:text-5xl"
      >
        <span className="block">{preserveCase(HEADING_LEAD)}</span>{" "}
        <span className="block text-brand-slate-100">{preserveCase(HEADING_TAIL)}</span>
      </h1>

      {/* Four bullets, not the export's five: its last two are one sentence Figma
          broke across lines, which is why this reads the topic's `body`. */}
      <BulletList items={CHAPTER.body} className="mt-8 text-xl leading-normal lg:text-2xl" />

      <div className="mt-14 flex grow flex-col gap-10 xl:flex-row xl:gap-4">
        {/* `xl:ps-19.5` is the artboard's 78px indent; `basis-112.5` is the group's
            own drawn width (450 = 78 + 288 + 16 + 65). */}
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

      {/* Four `Popup`s rather than one keyed off `openId`, which is what the
          payload would now allow: `FviiiMimetics.test.tsx` addresses dialogs by
          position (`dialogs()[2]`, `[3]`) and its helpers spell out how many
          empty ones precede each open card. Collapsing these is its own change,
          with that test rewrite as its own diff. */}
      <Popup
        card={openId === "emicizumab" ? { title: CARD_TITLE, content: <EmicizumabCard /> } : null}
        onClose={() => setOpenId(null)}
      />

      {/* The one card in this chapter off `default`: the densest of the four, and
          `wide` spends the extra width entirely on its left column. */}
      <Popup
        card={
          openId === "denecimig"
            ? { title: DENECIMIG_CARD_TITLE, width: "wide", content: <DenecimigCard /> }
            : null
        }
        onClose={() => setOpenId(null)}
      />

      {/* The caption const, not `nxt007-overview.title` — see `NXT007`. */}
      <Popup
        card={openId === "nxt007" ? { title: NXT007, content: <Nxt007Card /> } : null}
        onClose={() => setOpenId(null)}
      />

      <Popup
        card={openId === "inno8" ? { title: INNO8_OVERVIEW.title, content: <Inno8Card /> } : null}
        onClose={() => setOpenId(null)}
      />
    </section>
  );
}

/** Pop up 10: the three drawn bullets at the left, the MOA diagram at the right. */
function EmicizumabCard() {
  return (
    <div className="flex flex-col items-center gap-8 py-6 xl:flex-row xl:gap-12">
      <BulletList items={EMICIZUMAB.body} className="flex-1 text-base leading-[1.6] lg:text-xl" />

      {/* The white panel is load-bearing: `emicizumab.webp` carries a white
          background of its own, which would otherwise float on the card's gradient.
          `basis-md` is the drawn ~450px column. */}
      <ExpandableFigure
        thumbSrc={emicizumabUrl}
        thumbWidth={1408}
        thumbHeight={1468}
        title={EMICIZUMAB_MOA.title}
        variant="bare"
        className="max-w-md rounded-3xl bg-white p-4 xl:flex-1 xl:basis-md"
      >
        <PopupFigure
          src={emicizumabUrl}
          alt={MOA_FIGURE_ALT}
          width={MOA_FIGURE.width}
          height={MOA_FIGURE.height}
          reserve="9rem"
        />

        {/* `w-0 min-w-full` is `Lightbox`'s contract for prose: zero intrinsic
            width, then fill what the picture settled on, so the caption stays
            centred on the picture rather than stretching the column. */}
        <p className="mt-4 w-0 min-w-full text-center text-base leading-[1.6] text-white drop-shadow-md lg:text-xl">
          {EMICIZUMAB_MOA.body[0]}
        </p>
      </ExpandableFigure>
    </div>
  );
}

/**
 * Pop up 11: the four drawn bullets at the left, the MOA panel and its two
 * sentences at the right. The chapter's one `wide` card.
 */
function DenecimigCard() {
  return (
    <div className="flex flex-col items-start gap-8 py-6 xl:flex-row xl:gap-6">
      <BulletList items={DENECIMIG.body} className="flex-1 text-base leading-[1.6] lg:text-xl" />

      {/* `w-145` is the drawn 580px, fixed with `shrink-0` so the whole of `wide`'s
          extra width lands in the left column instead. */}
      <div className="flex w-full flex-col gap-3 xl:w-145 xl:shrink-0">
        {/* No white panel in markup: `denecimig.webp` carries the white surface and
            the rounded corners in its own pixels, so a `bg-white rounded-3xl p-4`
            wrapper would paint a second corner around the first. `rounded-2xl` is
            about the BUTTON — it clips the hover wash to the asset's own corner. */}
        <ExpandableFigure
          thumbSrc={denecimigUrl}
          thumbWidth={2176}
          thumbHeight={1392}
          title={DENECIMIG_MOA.title}
          variant="bare"
          className="rounded-2xl"
        >
          <PopupFigure
            src={denecimigUrl}
            alt={DENECIMIG_FIGURE_ALT}
            width={DENECIMIG_FIGURE.width}
            height={DENECIMIG_FIGURE.height}
            reserve="5rem"
          />
        </ExpandableFigure>

        <BulletList items={DENECIMIG_MOA.body} className="text-base leading-[1.6] lg:text-xl" />
      </div>
    </div>
  );
}

/**
 * Pop up 12: the three drawn bullets at the left, the structure panel and its
 * one sentence at the right.
 */
function Nxt007Card() {
  return (
    <div className="flex flex-col items-start gap-8 py-6 xl:flex-row xl:gap-6">
      <BulletList
        items={NXT007_OVERVIEW.body}
        className="flex-1 text-base leading-[1.6] lg:text-xl"
      />

      {/* `w-md` is the drawn ~450px, leaving the left column the 424 it is drawn at. */}
      <div className="flex w-full flex-col gap-3 xl:w-md xl:shrink-0">
        {/* No white panel in markup: `nxt007.webp` carries the white surface and the
            rounded corners in its own pixels, so a wrapper would paint a second
            corner around the first. `rounded-3xl` is about the BUTTON — it clips the
            hover wash to the asset's own corner. */}
        <ExpandableFigure
          thumbSrc={nxt007Url}
          thumbWidth={2176}
          thumbHeight={1500}
          // The chapter's literal, not `NXT007_STRUCTURE.title`: the raster's own
          // heading carries the INN and the data module's transcription does not.
          title={NXT007_FIGURE_TITLE}
          variant="bare"
          className="rounded-3xl"
        >
          <PopupFigure
            src={nxt007Url}
            alt={NXT007_FIGURE_ALT}
            width={NXT007_FIGURE.width}
            height={NXT007_FIGURE.height}
            reserve="5rem"
          />
        </ExpandableFigure>

        {/* A centred paragraph, where the Denecimig card sets a `BulletList` — the
            artboard draws no marker here. */}
        <p className="text-center text-base leading-[1.6] text-black lg:text-xl">
          {NXT007_STRUCTURE.body[0]}
        </p>
      </div>
    </div>
  );
}

/**
 * Pop up 13: the two drawn bullets across the top, the MOA panel beneath them —
 * a column, where the other three cards are two columns, as drawn.
 */
function Inno8Card() {
  return (
    <div className="flex flex-col gap-3 py-6">
      <BulletList items={INNO8_OVERVIEW.body} className="text-base leading-[1.6] lg:text-xl" />

      {/* No white panel in markup: `inno8.webp` carries the white surface and the
          rounded corners in its own pixels, so a wrapper would paint a second corner
          around the first. `rounded-3xl` is about the BUTTON — it clips the hover
          wash to the asset's own corner. */}
      <ExpandableFigure
        thumbSrc={inno8Url}
        thumbWidth={4352}
        thumbHeight={1676}
        title={INNO8_FIGURE_TITLE}
        variant="bare"
        className="rounded-3xl"
      >
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
 * `flex-col-reverse` puts the button above its caption on the phone while the DOM
 * keeps caption-then-button, which is the order a screen reader hears.
 *
 * `label` is the accessible name only, and it is passed the caption's own words so
 * the accessible name contains the visible label (WCAG 2.5.3).
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
  /** Whether a card actually opens behind this `+`. Gates `aria-haspopup` only. */
  hasCard?: boolean;
}) {
  return (
    <li className="flex flex-col-reverse items-center gap-4 sm:flex-row">
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
 * `w-72` is the drawn 289px, and it is what produces the artboard's line breaks.
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

/** A panel caption: one word, no status to tone against. */
function PanelCaption({ children }: { children: ReactNode }) {
  return (
    <p className="text-center text-xl leading-[1.08] font-black tracking-wide text-popup-caption sm:text-start lg:text-2xl">
      {children}
    </p>
  );
}

/**
 * The corner panel — the chapter's bottom-right block, carrying the two
 * investigational agents.
 *
 * The radius is the drawn 117px, stepped down to 60px below `lg`. No `shrink-0`:
 * this panel is the axis allowed to give, so the left group keeps its measure.
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

        {/* 56px between the two pairs, off the artboard. */}
        <ul className="mt-14 flex flex-wrap items-center justify-center gap-x-14 gap-y-8 sm:justify-end">
          {children}
        </ul>
      </div>
    </section>
  );
}
