import cascadeUrl from "../../assets/images/clotting-cascade-popup.webp";
import DisclosureBand, { type Disclosure } from "../../components/DisclosureBand";
import { type Bullet, topicById } from "../../data/education";
import { cn } from "../../lib/cn";

/**
 * `/education/disease-background` — CONTEXT.md §7.2, the first chapter of the
 * education module and step 1 of the walkthrough after `/`.
 *
 * Non-null: both ids are literals in this repo's own data module, and the
 * chapter test asserts they resolve. A fallback here would be a second,
 * unverified answer to a question the test already answers.
 */
const MECHANISM = topicById("disease-mechanism")!;
const DIAGNOSIS = topicById("diagnosis")!;

/**
 * The three "Click here:" disclosures under the severity heading (§7.7).
 *
 * Labels are literals rather than data reads: only the first has a matching
 * `EDUCATION_TOPICS` title, so it is also the only one that can open anything
 * today — the other two are §7.7 figures, and those 24 images are not yet
 * available as assets (CONTEXT.md). They render as buttons that toggle and show
 * nothing, which is issue 11's accepted placeholder state; give them `content`
 * when the assets land. Second pass reconciles all three with the data model.
 *
 * A 3-tuple, matching `DisclosureBand`'s prop: the band's grid and arch are
 * drawn around three columns, so a fourth is a design question, and the type is
 * what makes it get asked.
 */
const DISCLOSURES: readonly [Disclosure, Disclosure, Disclosure] = [
  { label: DIAGNOSIS.title, content: <BulletList items={DIAGNOSIS.body} /> },
  { label: "Disease severity and bleeding in HA/HB" },
  { label: "Typical bleeding manifestations in males and females with HA/HB" },
];

export default function DiseaseBackground() {
  // A growing flex column so the severity band below can take the leftover
  // height — the shell hands every page a `flex-1` wrapper inside a `min-h-dvh`
  // `<main>`, so `flex-1` here resolves against the viewport.
  return (
    <section aria-labelledby="chapter-heading" className="flex flex-1 flex-col">
      {/* Uppercase is CSS, not copy: the accessible name stays title-case, the
          way `Landing` keeps the activity title readable. */}
      <h1
        id="chapter-heading"
        className="font-display text-h1 tracking-wide text-brand-crimson-50 uppercase"
      >
        Hemophilia Disease Background
      </h1>
      {/* The figure sets the top of this block and the prose is nudged down
          under it — hence the per-column margins rather than one on the grid:
          in the comp the pop-up sits nearer the chapter title than the
          "Disease mechanism" heading does. */}
      <div className="mt-5 grid lg:grid-cols-[1fr_470px] lg:gap-x-8">
        <div className="lg:mt-3">
          <h2 className="text-h2 font-bold tracking-wide text-black">{MECHANISM.title}</h2>
          <BulletList items={MECHANISM.body} className="mt-4" />
          <h2 className="mt-4 text-h2 font-bold tracking-wide text-black">Diagnosis:</h2>
        </div>

        {/*
          Placeholder, deliberately: a static figure, not a disclosure. The
          close glyph in the top-right is part of the raster — this is the
          designer's export of the §7.7 "Disease mechanism for HA/HB" pop-up in
          its open state — so it currently paints a control that does nothing.
          Known and accepted for this pass; the second pass wires all four
          disclosures against issue 03's Modal primitive, at which point this
          becomes a real panel with a real close button.

          Everything in the image is image-borne (CONTEXT.md §7.7): the title,
          the annotations and the cascade itself exist in no text layer, so the
          alt text is the only route to this content and has to carry it.
        */}
        <figure className="mt-8 lg:mt-0">
          <img
            src={cascadeUrl}
            alt="Initiation and amplification of the clotting cascade. Vascular injury exposes tissue factor, which with FVIIa initiates coagulation; FVIIIa and FIXa amplify it through FXa, FVa, calcium and phospholipid to generate thrombin and form a fibrin clot. The amplification loop is critical for thrombin generation in tissues with limited expression of tissue factor, such as joints and muscles. Hemophilia reduces thrombin generation."
            className="max-h-64 w-full max-w-[470px] rounded-xl"
          />
        </figure>

        <BulletList items={DIAGNOSIS.body} className="mt-4 lg:col-span-2" />
      </div>

      {/*
        The band closes the page: `grow` takes whatever height is left under the
        disclosures on a short chapter, and is inert once the content itself
        passes the fold (`min-h-dvh` is a floor, so there is no free space to
        take) — which is why the `<section>` above is a flex column.

        The 44px above it was the band heading's own top margin collapsing out
        through the (padding-less) div. A flex item establishes its own
        formatting context, which stops that; the gap is stated directly as a
        margin instead, so nothing inside moved.
      */}
      <DisclosureBand title="Hemophilia Severity and Bleeding Patterns" disclosures={DISCLOSURES} />
    </section>
  );
}

function BulletList({ items, className }: { items: readonly Bullet[]; className?: string }) {
  return (
    <ul className={cn("list-disc pl-6 text-body text-black", className)}>
      {items.map((item) =>
        typeof item === "string" ? (
          <li key={item}>{item}</li>
        ) : (
          <li key={item.text}>
            {item.text}
            <ul className="list-disc ps-7">
              {item.children.map((child) => (
                <li key={child}>{child}</li>
              ))}
            </ul>
          </li>
        ),
      )}
    </ul>
  );
}
