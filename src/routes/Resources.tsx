import BulletList from "../components/BulletList";
import PageSection from "../components/PageSection";
import { RESOURCES, type ResourceItem } from "../data/references";
import { formatCitation } from "../lib/formatCitation";

/**
 * `[PDF-V]` draws the URL inline at the tail of the citation; the data model
 * splits it out. Putting it back is what makes this page paint what the panel
 * paints — including the sentence period, which `formatCitation` then lifts
 * back out of the `href` (docs/styling.md §25).
 */
function compose({ text, url }: ResourceItem): string {
  return url ? `${text} ${url}.` : text;
}

export default function Resources() {
  return (
    // On the walkthrough spine, so Prev/Next come from `AppSidebar` — nothing to
    // do here. Pads its own bottom like the three off-line pages.
    <PageSection title="Resources" padsOwnBottom className="flex flex-1 flex-col">
      {RESOURCES.map(({ category, items }) => (
        <div key={category} className="mt-10 first:mt-8">
          {/* The chapter `<h2>` ramp, which is also what the panel draws: bold,
              black, sentence case. The source's run-in colon is not carried —
              it binds a label to a list across a shared line, and vertical
              space does that job here (docs/styling.md §25). */}
          <h2 className="text-2xl font-bold tracking-wide text-black lg:text-3xl">{category}</h2>

          {/* Bulleted because the source is bulleted — both this panel and the
              `/references` block draw discs, which `out_raw.txt` flattens away
              (ADR 0009). `break-words` is inherited caution from §24 rather
              than a need here: no URL on this page is unbreakable. */}
          <BulletList
            items={items.map(compose)}
            format={formatCitation}
            className="mt-4 space-y-4 text-base/[1.6] break-words text-black lg:text-xl/[1.6] [&_a]:text-brand-lagoon-50 [&_a]:underline"
          />
        </div>
      ))}
    </PageSection>
  );
}
