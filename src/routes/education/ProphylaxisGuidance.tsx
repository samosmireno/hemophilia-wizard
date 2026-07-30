import backdropUrl from "../../assets/images/bg_image.webp";
import BulletList from "../../components/BulletList";
import { topicById } from "../../data/education";

/**
 * `/education/prophylaxis-guidance` — CONTEXT.md §7.4's prophylaxis guidance,
 * the last chapter of the walkthrough's education run.
 *
 * The slug is not a wizard cross-link target, so it is not contractual the way
 * `rebalancing-agents` and `fviiia-mimetics` are — but it is the repo's own
 * existing name for this content: `TreatmentLandscape` slices bullets 2–4 off
 * `clotting-factor-replacement` and calls them "§7.4 prophylaxis guidance that
 * belong to a different chapter". This is that chapter, so the two agree.
 *
 * Non-null for the reason the other chapters record: the id is a literal in this
 * repo's own data module, and the chapter test asserts it resolves.
 */
const CLOTTING = topicById("clotting-factor-replacement")!;

/**
 * The three bullets `treatment-landscape` leaves behind (it renders
 * `body.slice(0, 1)`): the artboard sets the first of them as this chapter's
 * heading and the remaining two as its body.
 *
 * Destructured rather than sliced twice, so the split is stated once and the
 * two halves cannot drift apart. Reading them positionally is what the data
 * module's own comment asks for — the bullets are one verbatim §7.4 passage,
 * kept whole on the topic they belong to rather than duplicated across two —
 * and the chapter test pins the heading string, so a reorder there fails as a
 * test rather than as a chapter with the wrong title.
 */
const [, HEADING_BULLET, ...BODY] = CLOTTING.body;

/**
 * The heading as a string.
 *
 * `body` is `Bullet[]`, so index 1 is a `NestedBullet` as far as the type
 * system is concerned; narrowing it here rather than reaching for `.text` is
 * what keeps a nested bullet's children from being silently dropped if the
 * source ever grows one. Bound to a const first because that is what makes the
 * `typeof` guard narrow at all.
 */
const HEADING = typeof HEADING_BULLET === "string" ? HEADING_BULLET : HEADING_BULLET.text;

export default function ProphylaxisGuidance() {
  return (
    <>
      <ChapterBackdrop />

      {/*
        The artboard centres this chapter's one block of ink on its 1440 × 800
        canvas — the heading's cap top and the last bullet's descender sit
        equidistant from the edges to within ~8px — which is what `flex-1` plus
        `justify-center` buys here. `AppShell` mounts every page inside a
        `flex flex-1 flex-col` wrapper on a `min-h-dvh` column precisely so a
        page can opt into this; `Landing` is the other caller.

        It centres within the shell's padded box rather than the viewport, so
        the crimson rule's clearance above and the sidebar bar's below are
        already off the top and bottom — which is the behaviour the artboard
        draws, where the block sits a little under the true centre line.
      */}
      <section aria-labelledby="chapter-heading" className="flex flex-1 flex-col justify-center">
        {/*
          Uppercase is CSS, not copy — the accessible name stays sentence case,
          as on every other chapter. A data read rather than a literal: this is
          §7.4's own bullet, which the artboard reproduces exactly.

          `text-h1` only from `lg`, which no other chapter needs: this heading is
          a 17-word sentence where the other four are two to six words, and at
          52px it takes eleven lines on a 390px phone — the whole screen before
          the first bullet. Below the design canvas it steps down one scale step,
          the same call `AppShell` makes for the gutters it cannot honour down
          there (docs/styling.md §11): the artboard is 1440 and nobody has drawn
          a phone, so this is an invented comfort value, stated as a step rather
          than as a raw size so the two are visibly one scale.
        */}
        <h1
          id="chapter-heading"
          className="font-display text-h2 tracking-wide text-brand-crimson-50 uppercase lg:text-h1"
        >
          {HEADING}
        </h1>

        {/*
          `mt-8` is the designer's 32px h1 gap, the value every other chapter
          uses; ink-to-ink on the artboard measures 35px, which is the same gap
          once a line box's leading is taken off (docs/styling.md §11).

          26px/1.25 is measured off the export — the two bullets are set far
          larger than `text-body` here, this being a chapter with one block of
          copy on it. Raw under §8's precedent: the scale's nearest step is
          `text-h3`, which is 26px at weight 600 where this is 400.
          `rebalancing-agents` sets its bullets at the same 26px for the same
          reason.
        */}
        <BulletList items={BODY} className="mt-8 text-[26px] leading-tight" />
      </section>
    </>
  );
}

/**
 * The chapter's own backdrop: the cell wash under the page gradient's mint.
 *
 * Structurally a sibling of `AppShell`'s default backdrop rather than a
 * replacement for it — same `fixed inset-0 -z-10`, later in DOM order, so it
 * paints over `bg-page` while the gradient still shows through at 15%. That is
 * the arrangement `Landing` records, and it is the one the artboard composites:
 * sampling the reference against this asset and the §6 gradient, `0.15 * image
 * over bg-page` reproduces the drawn background to within a few units of 255
 * across the whole canvas.
 *
 * **The 15% is here rather than baked into the asset**, though it arrived baked
 * — the delivered file carried a uniform alpha of 38/255 and full-strength RGB
 * beneath it. Flattening that to an opaque image and stating the opacity in CSS
 * puts the design value where it can be read and changed, and composites
 * identically (mean difference 0.2/255, measured). See docs/styling.md §11.
 *
 * `object-cover` on a square asset against a landscape viewport crops top and
 * bottom, centred, which is the crop the artboard draws.
 *
 * `alt=""` rather than a description: this is wallpaper, and the chapter's two
 * bullets are the content. A decorative `<img>` takes the `presentation` role,
 * so it is not announced and `aria-hidden` on the wrapper is belt-and-braces
 * for the box, not for the picture.
 *
 * `width`/`height` are the stored size, as everywhere else in this codebase —
 * here they only settle the aspect ratio, since `size-full` makes both
 * dimensions definite.
 */
function ChapterBackdrop() {
  return (
    <div aria-hidden="true" data-page-backdrop="prophylaxis" className="fixed inset-0 -z-10">
      <img
        src={backdropUrl}
        alt=""
        width={1920}
        height={1921}
        className="size-full object-cover opacity-15"
      />
    </div>
  );
}
