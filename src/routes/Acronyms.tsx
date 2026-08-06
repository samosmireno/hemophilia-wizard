import AcronymList from "../components/AcronymList";
import { ACRONYMS } from "../data/glossary";

export default function Acronyms() {
  return (
    // The app's one scrolling page, so it pads its own bottom: `AppShell` sets
    // `lg:pb-0` (docs/styling.md §9 item 53).
    <section aria-labelledby="acronyms-heading" className="flex flex-1 flex-col lg:pb-16">
      <h1
        id="acronyms-heading"
        className="font-display text-3xl font-bold tracking-wide text-brand-crimson-50 uppercase lg:text-5xl"
      >
        Acronyms
      </h1>

      <AcronymList items={ACRONYMS} className="mt-5" />
    </section>
  );
}
