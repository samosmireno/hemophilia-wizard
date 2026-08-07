import BulletList from "../components/BulletList";
import { REFERENCES } from "../data/references";
import { formatCitation } from "../lib/formatCitation";

export default function References() {
  return (
    // The app's longest scroll, so it pads its own bottom like `/acronyms` and
    // `/glossary` — `AppShell` is `lg:pb-0` (docs/styling.md §9 item 53).
    <section aria-labelledby="references-heading" className="flex flex-1 flex-col lg:pb-16">
      <h1
        id="references-heading"
        className="font-display text-3xl font-bold tracking-wide text-brand-crimson-50 uppercase lg:text-5xl"
      >
        References
      </h1>

      {/*
        Unnumbered but bulleted, as the source draws it: nothing in the app cites
        a reference, so numbers would be markers pointing at nothing (CONTEXT.md
        §9) — but the board does draw discs, which the text dump this list was
        transcribed from flattens away. This page shipped with a hanging indent
        invented to replace a marker the source turned out to have (ADR 0009).

        `break-words` is correctness, not taste: `r8`'s HEMLIBRA URL is ~300
        unbreakable characters and would otherwise push the page sideways.
      */}
      <BulletList
        items={REFERENCES.map(({ text }) => text)}
        format={formatCitation}
        className="mt-5 space-y-4 text-base/[1.6] break-words text-black lg:text-xl/[1.6] [&_a]:text-brand-lagoon-50 [&_a]:underline"
      />
    </section>
  );
}
