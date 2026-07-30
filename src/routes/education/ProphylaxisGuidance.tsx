/**
 * `/education/prophylaxis-guidance` — CONTEXT.md §7.4's prophylaxis guidance,
 * the last chapter of the walkthrough's education run.
 *
 * The slug is not a wizard cross-link target, so it is not contractual the way
 * `rebalancing-agents` and `fviiia-mimetics` are — but it is the repo's own
 * existing name for this content: `TreatmentLandscape` slices bullets 2–4 off
 * `clotting-factor-replacement` and calls them "§7.4 prophylaxis guidance that
 * belong to a different chapter". This is that chapter, so the two agree.
 *
 * Placeholder until its design lands. Content is already modelled: those three
 * bullets of the `clotting-factor-replacement` topic — the artboard sets the
 * "recommended over episodic treatment" bullet as the chapter's heading and the
 * remaining two ("greatly reduces bleeding risk", "…even for FVIII plasma levels
 * ≥2 IU/dL") as its body.
 */
export default function ProphylaxisGuidance() {
  return (
    <section aria-labelledby="education-heading">
      <h1 id="education-heading">Education — prophylaxis-guidance</h1>
      <p>Education chapter placeholder.</p>
    </section>
  );
}
