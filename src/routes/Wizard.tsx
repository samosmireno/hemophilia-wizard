import { Button } from "mlg-components";
import { useNavigate } from "react-router";

import OptionGroup, { type Option } from "../components/OptionGroup";
import { nextOf } from "../data/sectionOrder";
import {
  HEMOPHILIA_TYPES,
  SWITCH_REASONS,
  WIZARD_INPUT_TITLE,
  WIZARD_QUESTIONS,
  type SwitchReason,
  type WizardHemophiliaType,
} from "../data/wizard";
import { useWizardAnswers } from "../state/wizardAnswers";

/**
 * `/wizard` — the three patient characteristics the Treatment Wizard branches
 * on: type, inhibitor status, and the primary reason for considering a new
 * therapy (CONTEXT.md §4's Q1–Q3).
 *
 * The wizard is three routes, not one page: this screen collects the answers,
 * `/wizard/scenario` shows the therapeutic classes to consider, and
 * `/wizard/therapies` the curated leaf. The answers live above all three in
 * `WizardAnswersProvider`, session-scoped — see
 * `docs/adr/0003-session-scoped-wizard-answers.md`, which also covers why the
 * sidebar's Next arrow is gated here and why the two pages beyond guard
 * themselves.
 *
 * Nothing is computed here. `recommend()` is called by the pages that render a
 * result, from the same three answers.
 */

/**
 * Yes/No as radio ids. The answer is a `boolean` in `WizardAnswers` (it feeds
 * `scenarioKey(type, hasInhibitors)`), and `OptionGroup` is keyed by string, so
 * the two are mapped at this boundary rather than either side bending: a
 * radio's `value` is a string in the DOM whatever we do, and `hasInhibitors`
 * being a boolean is what makes the scenario key total.
 */
const INHIBITOR_OPTIONS: Option<"yes" | "no">[] = [
  { id: "yes", label: "Yes" },
  { id: "no", label: "No" },
];

/**
 * The artboard's reading order for Q3, which is NOT the blueprint's: it draws
 * bleeding control and monitoring in the top row, adherence and treatment
 * burden in the bottom one. `SWITCH_REASONS` keeps the source order (CONTEXT.md
 * §4.1's matrix reads in it) and the layout fact lives here, on the only screen
 * that lays them out.
 *
 * A lookup rather than a re-transcription, so the labels still come from the
 * data module and a reword there reaches this page.
 */
const REASON_READING_ORDER: SwitchReason[] = [
  "bleeding-control",
  "monitoring",
  "adherence",
  "treatment-burden",
];

const REASON_OPTIONS: Option<SwitchReason>[] = REASON_READING_ORDER.map((id) => {
  const reason = SWITCH_REASONS.find((r) => r.id === id)!;
  return { id: reason.id, label: reason.label };
});

export default function Wizard() {
  const { answers, setAnswer, complete } = useWizardAnswers();
  const navigate = useNavigate();

  /**
   * Submit goes wherever the walkthrough goes, exactly as `/wizard-intro`'s CTA
   * does, so it and the sidebar's Next arrow cannot disagree about what follows
   * this page. Non-null because `/wizard` is in `SECTION_ORDER` and is not its
   * last entry.
   */
  const next = nextOf("/wizard")!;

  return (
    <section aria-labelledby="wizard-heading">
      {/*
        Uppercase is CSS, not copy — the accessible name stays the sentence case
        the artboard was written in, as on every chapter. The string is shared
        with `/wizard-intro`'s CTA, which is the button that leads here.
      */}
      <h1
        id="wizard-heading"
        // `text-5xl` from `lg` only, app-wide (docs/styling.md §2). This is the
        // heading that forced the rule: `CHARACTERISTICS` sets 356.5px at 52px
        // against a 311px column, so at 375px the word left the screen and took
        // the document's scroll width with it.
        className="font-display text-3xl font-bold tracking-wide text-brand-crimson-50 uppercase lg:text-5xl"
      >
        {WIZARD_INPUT_TITLE}
      </h1>

      {/*
        A real `<form>`, so Enter submits from any of the fifteen radios without
        a keydown handler — and so the disabled Submit governs that path too.

        `mt-20` (80px) is the artboard's gap, arrived at in a browser rather than
        from the export's ink: ink-to-ink the title's baseline sits 92px above
        the first legend's cap top, but how much of that is line-box leading
        depends on the two fonts' metrics. Rendered at 1440, this puts the first
        row of pills at y=226 against the drawn 227.
      */}
      <form
        className="mt-20"
        onSubmit={(event) => {
          event.preventDefault();
          if (complete) void navigate(next);
        }}
      >
        <OptionGroup
          legend={WIZARD_QUESTIONS.type}
          name="hemophilia-type"
          options={HEMOPHILIA_TYPES}
          value={answers.type}
          onChange={(type: WizardHemophiliaType | null) => setAnswer("type", type)}
        />

        {/*
          `mt-6` (24px) between groups, measured the same way as the gap above:
          it lands the second row of pills at y=351 against the drawn 350, and
          the reason rows at 511 and 583 against 509 and 581. YES and NO are the
          one pair of labels the artboard sets in caps, so — per the rule the
          whole app follows — that is a class, not the copy.
        */}
        <OptionGroup
          className="mt-6"
          legend={WIZARD_QUESTIONS.inhibitors}
          name="inhibitors"
          options={INHIBITOR_OPTIONS}
          optionClassName="uppercase"
          value={answers.hasInhibitors === null ? null : answers.hasInhibitors ? "yes" : "no"}
          onChange={(id) => setAnswer("hasInhibitors", id === null ? null : id === "yes")}
        />

        <OptionGroup
          className="mt-6"
          legend={WIZARD_QUESTIONS.reason}
          name="switch-reason"
          options={REASON_OPTIONS}
          value={answers.reason}
          onChange={(reason: SwitchReason | null) => setAnswer("reason", reason)}
        />

        {/*
          Right-aligned to the pill grid, not to the content column — hence the
          same `max-w-225 mx-auto` box the groups use. That coupling is the
          point, not the number: whatever `OptionGroup` caps itself at, this has
          to match, or the button stops landing on the grid's right edge.

          `mt-8` is the drawn 32px, fill to fill, which needs no leading
          correction between two buttons.
        */}
        <div className="mx-auto mt-8 flex max-w-225 justify-end">
          {/*
            The package's `Button`, re-grounded in lagoon. Only the three ground
            colours are overridden (tailwind-merge, so the caller wins); type,
            shadows, focus ring and the disabled treatment stay the package's, so
            this button still reads as one of the app's buttons. The hover and
            press steps are derived the way §4.1's crimson pair is — lifted with
            the -25 tint, pressed to the -75 step.

            `px-6 leading-5` come from measurement: the artboard draws a 223 × 56
            pill around a 173px label, where the package's own `px-16` would make
            it 301px wide. The drawn padding was 25 and went to the nearest scale
            step; at 24 a side the pill renders 224 × 56 in a browser, which is
            the drawn 223 to within the ~4px this font runs wider than the export
            (the same discrepancy the pill labels above record). The type size is
            the package's 26px untouched.

            `disabled` is the real attribute, not `aria-disabled`: the gate is
            visible in the three unanswered groups above it, so a focusable
            button that refuses to act would explain nothing extra.
          */}
          <Button
            type="submit"
            disabled={!complete}
            className="bg-brand-lagoon-50 px-6 leading-5 hover:bg-brand-lagoon-25 active:bg-brand-lagoon-75"
          >
            Submit inputs
          </Button>
        </div>
      </form>
    </section>
  );
}
