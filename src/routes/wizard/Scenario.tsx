/**
 * `/wizard/scenario` — placeholder.
 *
 * Named for what the three answers resolve to, which is the word `wizard.ts`
 * already uses for (type × inhibitors): `ScenarioKey`, `scenarioKey()`,
 * `SCENARIO_NOTES`. When it is built it renders `CLASSES_TO_CONSIDER[scenario]`
 * — the blueprint's "Therapeutic classes to consider" box, plus the HB
 * +inhibitors caveat and the source's "Click on the box(es) below to learn more
 * about each type of therapy" annotation (CONTEXT.md §4).
 *
 * Reachable only with all three answers: `WizardGate` sends an incomplete
 * session back to `/wizard`.
 */
export default function Scenario() {
  return (
    <section aria-labelledby="wizard-scenario-heading">
      <h1
        id="wizard-scenario-heading"
        className="font-display text-h1 tracking-wide text-brand-crimson-50 uppercase"
      >
        Therapeutic classes to consider
      </h1>
      <p className="mt-8 text-body">Scenario placeholder.</p>
    </section>
  );
}
