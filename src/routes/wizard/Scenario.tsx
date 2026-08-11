import factorConcentratesUrl from "../../assets/images/factor_concentrates.webp";
import geneTherapyUrl from "../../assets/images/gene_therapy.webp";
import rebalancingUrl from "../../assets/images/hemostatic_rebalancing_agents.webp";
import mimeticUrl from "../../assets/images/mimetic_bispecific_antibody.webp";
import AgentBoxButton from "../../components/AgentBoxButton";
import BulletList from "../../components/BulletList";
import PageSection from "../../components/PageSection";
import { classesFor } from "../../data/wizard";
import { cn } from "../../lib/cn";
import { formatInline } from "../../lib/formatInline";
import { useCompleteWizardAnswers } from "../../state/wizardAnswers";

/** One class illustration: the asset plus its own intrinsic pixels — the four
    exports do not share a size the way §7.7's agent thumbnails do. */
interface BoxArt {
  src: string;
  width: number;
  height: number;
}

const CONCENTRATES: BoxArt = { src: factorConcentratesUrl, width: 584, height: 652 };
const MIMETIC: BoxArt = { src: mimeticUrl, width: 804, height: 716 };
const REBALANCING: BoxArt = { src: rebalancingUrl, width: 848, height: 716 };
const GENE: BoxArt = { src: geneTherapyUrl, width: 600, height: 716 };

/**
 * Keyed by the verbatim class labels `classesFor` lists — the only join there
 * is, since the classes are plain strings. Both mimetic wordings appear because
 * `A-with` carries the 2026-08-05 copy edit; both factor-replacement classes
 * share the vial asset.
 */
const BOX_ART: ReadonlyMap<string, BoxArt> = new Map([
  ["Recombinant FVIII concentrates", CONCENTRATES],
  ["FIX prophylaxis", CONCENTRATES],
  ["Factor VIIIa mimetics", MIMETIC],
  ["Factor VIII mimetic", MIMETIC],
  ["Hemostatic rebalancing agents", REBALANCING],
  ["Gene therapy", GENE],
]);

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
      {screen.classes.map((label) => {
        // `!`: the map is keyed from the same verbatim strings `classesFor`
        // lists, and the box tests render all four screens.
        const art = BOX_ART.get(label)!;
        return (
          <AgentBoxButton
            key={label}
            src={art.src}
            agent={label}
            width={art.width}
            height={art.height}
            // Deliberately inert: the therapy popups are not wired yet, so the
            // buttons ship with their skin and name but open nothing.
            onClick={() => {}}
            className="shrink-0 lg:shrink"
          />
        );
      })}
    </div>
  );

  return (
    // Raw, NOT through `formatInline`: the title is the section's accessible
    // name, and a name assembled from fragments gains separating spaces.
    <PageSection title={screen.title}>
      <p className="mt-8 text-xl text-black lg:text-2xl">{formatInline(screen.lead)}</p>

      <BulletList items={screen.classes} className="text-xl lg:text-2xl" format={formatInline} />

      {screen.caveat && (
        <p className="mt-8 text-xl text-black lg:text-2xl">{formatInline(screen.caveat)}</p>
      )}

      <div className={cn("mt-40 flex flex-col gap-8", captionBelow && "flex-col-reverse")}>
        {caption}
        {boxes}
      </div>
    </PageSection>
  );
}
