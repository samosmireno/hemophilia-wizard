/**
 * `/wizard` — the Treatment Wizard (build is issue 08). Single route: all wizard
 * state (type → inhibitor → reason → recommendation) is computed in-page, with
 * no per-step subroutes.
 */
export default function Wizard() {
  return (
    <section aria-labelledby="wizard-heading">
      <h1 id="wizard-heading">Treatment Wizard</h1>
      <p>Wizard placeholder.</p>
    </section>
  );
}
