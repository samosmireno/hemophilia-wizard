/**
 * `/wizard/therapies` — placeholder.
 *
 * The wizard's leaf: `recommend(type, hasInhibitors, reason)`'s curated agent
 * list plus that (scenario, reason)'s Considerations and Strategies pair
 * (CONTEXT.md §4.1–4.2), with each agent opening its drug sheet as a `?drug=<id>`
 * overlay on this route rather than navigating away (issue 10).
 *
 * Reachable only with all three answers: `WizardGate` sends an incomplete
 * session back to `/wizard`.
 */
export default function Therapies() {
  return (
    <section aria-labelledby="wizard-therapies-heading">
      <h1
        id="wizard-therapies-heading"
        className="font-display text-h1 tracking-wide text-brand-crimson-50 uppercase"
      >
        Novel therapies to consider
      </h1>
      <p className="mt-8 text-body">Therapies placeholder.</p>
    </section>
  );
}
