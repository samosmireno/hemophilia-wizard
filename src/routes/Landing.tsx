import { Button } from "mlg-components";
import { useNavigate } from "react-router";

import BrandLoop from "../components/BrandLoop";
import { ACTIVITY_CODE, ACTIVITY_TITLE_LEAD, ACTIVITY_TITLE_TAIL } from "../data/activity";
import { nextOf } from "../data/sectionOrder";

export default function Landing() {
  const navigate = useNavigate();

  const next = nextOf("/")!;

  return (
    <>
      <LandingBackdrop />
      <section
        aria-labelledby="landing-heading"
        className="flex flex-1 flex-col items-center justify-center text-center text-white"
      >
        {/* Outside the <h1>: the activity code identifies the CME activity, it
            is not part of its title. */}
        <p className="font-display text-2xl/none font-normal sm:text-4xl/none lg:text-5xl/none xl:text-6xl/none">
          {ACTIVITY_CODE}
        </p>
        {/* One heading, split into two typographic halves — so the accessible
            name is the whole title, exactly as `ACTIVITY_TITLE` spells it. */}
        <h1 id="landing-heading" className="mt-2 max-w-280 font-display">
          <span className="block text-5xl/[0.75] font-bold sm:text-7xl/[0.75] lg:text-8xl/[0.75] xl:text-9xl/[0.75]">
            {ACTIVITY_TITLE_LEAD}
          </span>{" "}
          {/* The space is load-bearing, not formatting: without a text node between
              the two block spans the heading's accessible name runs the halves together. */}
          <span className="mt-3 block text-sm/tight font-normal text-balance sm:text-xl/tight lg:text-3xl/tight xl:text-4xl/tight">
            {ACTIVITY_TITLE_TAIL}
          </span>
        </h1>
        <Button
          className="mt-12 px-8 py-3 text-base/tight sm:px-12 sm:py-3.5 sm:text-lg/tight lg:mt-20 lg:px-14 lg:py-4 lg:text-xl/tight xl:px-16 xl:py-4.5 xl:text-2xl/tight"
          onClick={() => void navigate(next)}
        >
          LET’S GET STARTED
        </Button>
      </section>
    </>
  );
}

function LandingBackdrop() {
  return (
    <div
      aria-hidden="true"
      data-page-backdrop="landing"
      className="fixed inset-0 -z-10 overflow-hidden bg-white"
    >
      <BrandLoop />
      <div className="absolute inset-0 bg-page-landing" />
    </div>
  );
}
