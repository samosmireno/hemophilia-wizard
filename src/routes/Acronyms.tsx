import DefinitionList from "../components/DefinitionList";
import { ACRONYMS } from "../data/glossary";

// `{ abbr, full }` is the source shape; the list speaks term↔definition.
const PAIRS = ACRONYMS.map(({ abbr, full }) => ({ term: abbr, definition: full }));

export default function Acronyms() {
  return (
    // The app's one always-scrolling page, so it pads its own bottom: `AppShell`
    // sets `lg:pb-0` (docs/styling.md §9 item 53).
    <section aria-labelledby="acronyms-heading" className="flex flex-1 flex-col lg:pb-16">
      <h1
        id="acronyms-heading"
        className="font-display text-3xl font-bold tracking-wide text-brand-crimson-50 uppercase lg:text-5xl"
      >
        Acronyms
      </h1>

      <DefinitionList
        items={PAIRS}
        // `max-content` aligns every expansion on the widest term (VERITAS-Pro)
        // without pinning a width. Below `sm` the pair stacks — that track plus
        // a 41-character expansion does not survive 320px side by side.
        className="mt-5 sm:grid sm:grid-cols-[max-content_1fr] sm:gap-x-8 sm:gap-y-2"
        termClassName="mt-4 first:mt-0 sm:mt-0"
      />
    </section>
  );
}
