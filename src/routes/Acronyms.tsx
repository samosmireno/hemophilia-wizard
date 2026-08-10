import DefinitionList from "../components/DefinitionList";
import PageSection from "../components/PageSection";
import { ACRONYMS } from "../data/glossary";

// `{ abbr, full }` is the source shape; the list speaks term↔definition.
const PAIRS = ACRONYMS.map(({ abbr, full }) => ({ term: abbr, definition: full }));

export default function Acronyms() {
  return (
    // The app's one always-scrolling page.
    <PageSection title="Acronyms" padsOwnBottom className="flex flex-1 flex-col">
      <DefinitionList
        items={PAIRS}
        // `max-content` aligns every expansion on the widest term (VERITAS-Pro)
        // without pinning a width. Below `sm` the pair stacks — that track plus
        // a 41-character expansion does not survive 320px side by side.
        className="mt-5 sm:grid sm:grid-cols-[max-content_1fr] sm:gap-x-8 sm:gap-y-2"
        termClassName="mt-4 first:mt-0 sm:mt-0"
      />
    </PageSection>
  );
}
