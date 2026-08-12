import { Button } from "mlg-components";
import { Link, useNavigate } from "react-router";

import BrandLoop from "../components/BrandLoop";
import { ACTIVITY_TITLE_LEAD, ACTIVITY_TITLE_TAIL } from "../data/activity";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <>
      <LandingBackdrop />
      <section
        aria-labelledby="landing-heading"
        className="flex flex-1 flex-col items-center justify-center text-center text-white"
      >
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
        {/* A grid rather than flex so the two buttons share one width: stacked
            they stretch to the wider label, and the md+ columns are equal `1fr`s. */}
        <div className="mt-12 grid gap-4 md:grid-cols-2 md:gap-6 lg:mt-20 lg:gap-8">
          <Button
            className="px-8 py-3 text-base/tight sm:px-12 sm:py-3.5 sm:text-lg/tight lg:px-14 lg:py-4 lg:text-xl/tight xl:px-16 xl:py-4.5 xl:text-2xl/tight"
            onClick={() => void navigate("/education/disease-background")}
          >
            HEMOPHILIA DISEASE BACKGROUND
          </Button>
          <Button
            className="px-8 py-3 text-base/tight sm:px-12 sm:py-3.5 sm:text-lg/tight lg:px-14 lg:py-4 lg:text-xl/tight xl:px-16 xl:py-4.5 xl:text-2xl/tight"
            onClick={() => void navigate("/wizard")}
          >
            HEMOPHILIA TREATMENT WIZARD
          </Button>
        </div>
        {/* A real anchor, not a Button: quiet third choice under the two equal
            destinations, and cmd-click / open-in-new-tab keep working. */}
        <Link
          to="/how-to"
          className="mt-6 text-sm/tight text-white underline underline-offset-4 hover:opacity-80 sm:text-base/tight lg:mt-8 lg:text-lg/tight"
        >
          How to use this tool
        </Link>
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
