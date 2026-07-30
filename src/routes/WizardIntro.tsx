/**
 * `/wizard-intro` — the step that hands the learner off from the last education
 * chapter into the wizard. Its own spine step (between
 * `/education/prophylaxis-guidance` and `/wizard`), not an education chapter and
 * not part of `/wizard` itself.
 *
 * Placeholder until its design lands.
 */
export default function WizardIntro() {
  return (
    <section aria-labelledby="wizard-intro-heading">
      <h1 id="wizard-intro-heading">Treatment Wizard — Introduction</h1>
      <p>Wizard intro placeholder.</p>
    </section>
  );
}
