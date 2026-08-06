import { Button } from "mlg-components";
import { useNavigate } from "react-router";

import BrandLoop from "../components/BrandLoop";
import { nextOf } from "../data/sectionOrder";
import { WIZARD_ENTRY_PROMPT, WIZARD_INPUT_TITLE } from "../data/wizard";

export default function WizardIntro() {
  const next = nextOf("/wizard-intro")!;

  const navigate = useNavigate();

  return (
    <>
      <IntroBackdrop />

      <section
        aria-labelledby="wizard-intro-heading"
        className="flex flex-1 flex-col items-center justify-center text-center"
      >
        <h1
          id="wizard-intro-heading"
          className="max-w-3xl font-display text-4xl/[1.05] font-bold text-brand-crimson-50 uppercase sm:text-5xl/[1.05] lg:text-7xl/[1.05]"
        >
          {WIZARD_ENTRY_PROMPT}
        </h1>

        <Button
          className="mt-8 px-8 py-3 text-base/tight uppercase sm:px-12 sm:py-3.5 sm:text-xl/tight lg:px-16 lg:py-4.5 lg:text-2xl/5"
          onClick={() => void navigate(next)}
        >
          {WIZARD_INPUT_TITLE}
        </Button>
      </section>
    </>
  );
}

function IntroBackdrop() {
  return (
    <div aria-hidden="true" data-page-backdrop="wizard-intro" className="fixed inset-0 -z-10">
      <BrandLoop className="opacity-25" />
    </div>
  );
}
