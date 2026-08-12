import DefinitionList from "../components/DefinitionList";
import PageSection from "../components/PageSection";
import { GLOSSARY } from "../data/glossary";

export default function Glossary() {
  return (
    // Twelve sentence-length definitions overrun the viewport at some heights.
    <PageSection title="Glossary" padsOwnBottom className="flex flex-1 flex-col">
      <DefinitionList
        items={GLOSSARY}
        // A fixed 20rem track, not `/acronyms`' `max-content`: the widest term
        // ("Factor VIII mimetic bispecific antibody") is a phrase, and letting
        // it set the column would spend ~400px on it and forbid it wrapping.
        // The pair stacks below `xl`, not `sm` — 1024 leaves only 400px beside
        // that track, and a sentence set to ~38 characters is not a column.
        className="mt-5 xl:grid xl:grid-cols-[20rem_1fr] xl:gap-x-8 xl:gap-y-6"
        termClassName="mt-6 first:mt-0 xl:mt-0"
      />
    </PageSection>
  );
}
