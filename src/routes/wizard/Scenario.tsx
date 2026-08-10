import BulletList from "../../components/BulletList";
import { classesFor } from "../../data/wizard";
import { cn } from "../../lib/cn";
import { formatInline } from "../../lib/formatInline";
import { useCompleteWizardAnswers } from "../../state/wizardAnswers";

/* Every length here is rem so the placeholder scales with the board above the
   canvas. `border-[0.25rem]` is deliberately NOT `border-4` — Tailwind's numeric
   border utilities are px and would pin the outline at 4px while the box grows. */
const BOX = "h-46.25 w-full max-w-56.75 shrink-0 border-[0.25rem] border-black lg:shrink";

export default function Scenario() {
  const screen = classesFor(useCompleteWizardAnswers());

  const captionBelow = screen.classes.length === 1;

  const caption = (
    <p className="text-center text-xl font-bold text-popup-caption uppercase lg:text-2xl">
      {screen.caption}
    </p>
  );

  const boxes = (
    <div className="flex flex-col items-center gap-8 lg:flex-row lg:justify-center xl:gap-x-30">
      {screen.classes.map((label) => (
        <div key={label} className={BOX} />
      ))}
    </div>
  );

  return (
    <section aria-labelledby="wizard-scenario-heading">
      {/* Raw, NOT through `formatInline`: this is the section's accessible name,
          and a name assembled from fragments gains separating spaces. */}
      <h1
        id="wizard-scenario-heading"
        className="font-display text-3xl font-bold tracking-wide text-brand-crimson-50 uppercase lg:text-5xl"
      >
        {screen.title}
      </h1>

      <p className="mt-8 text-xl text-black lg:text-2xl">{formatInline(screen.lead)}</p>

      <BulletList items={screen.classes} className="text-xl lg:text-2xl" format={formatInline} />

      {screen.caveat && (
        <p className="mt-8 text-xl text-black lg:text-2xl">{formatInline(screen.caveat)}</p>
      )}

      <div className={cn("mt-40 flex flex-col gap-8", captionBelow && "flex-col-reverse")}>
        {caption}
        {boxes}
      </div>
    </section>
  );
}
