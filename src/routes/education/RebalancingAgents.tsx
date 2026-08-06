import { type ReactNode, useState } from "react";
import { Button, NavArrowButton, PopupButton } from "mlg-components";

import mechanismUrl from "../../assets/images/hemostatic_mechanisms_diagram.webp";
import BulletList from "../../components/BulletList";
import Popup from "../../components/Popup";
import PopupFigure from "../../components/PopupFigure";
import {
  type RebalancingMechanism,
  REBALANCING_AGENTS,
  rebalancingAgentLabel,
  topicById,
} from "../../data/education";
import { cn } from "../../lib/cn";
import { usePreloadImage } from "../../lib/preloadImage";

const AGENTS = topicById("rebalancing-agents")!;
const MECHANISMS = topicById("rebalancing-mechanisms")!;

const BOXES_CAPTION = "Click on the boxes to learn more about hemostatic rebalancing agents";

// §7.7's spelling, not the artboard's "homeostatic" — that typo is not reproduced.
const MECHANISMS_LABEL =
  "Mechanisms of hemostatic rebalancing agents within the coagulation cascade";

// "in the coagulation cascade" here against the caption's "within" — both as drawn.
const MECHANISM_FIGURE_TITLE =
  "Mechanisms of Hemostatic Rebalancing Agents in the Coagulation Cascade";

const MECHANISM_FIGURE_ALT =
  "Coagulation cascade showing where hemostatic rebalancing agents act. FXI activates FIX; " +
  "FIX and FVIIa converge on FX, which with FV generates thrombin, and thrombin converts " +
  "fibrinogen to fibrin. Two endogenous anticoagulants restrain the cascade: TFPI inhibits " +
  "FVIIa and FX, and antithrombin inhibits FX and thrombin. Concizumab and marstacimab " +
  "inhibit TFPI; fitusiran inhibits antithrombin — removing those brakes restores thrombin " +
  "generation.";

/** Colour by mechanism class, as drawn: the anti-TFPI mABs in blue, the siRNA in crimson. */
const MECHANISM_TONE: Record<RebalancingMechanism, string> = {
  "anti-TFPI mAB": "text-agent-mab",
  "AT-directed siRNA": "text-agent-sirna",
};

/** Composed bullet → its tone, keyed by the string the data module puts in `children`. */
const AGENT_TONE: ReadonlyMap<string, string> = new Map(
  REBALANCING_AGENTS.map((agent) => [
    rebalancingAgentLabel(agent),
    MECHANISM_TONE[agent.mechanism],
  ]),
);

/** The width of the three-box group — 3 × 227 + 2 × 141, off the artboard. */
const GROUP = "mx-auto w-full max-w-240.5";

type Step = "prose" | "figure";

export default function RebalancingAgents() {
  const [step, setStep] = useState<Step | null>(null);

  const CARDS: Record<Step, { title: string; content: ReactNode }> = {
    prose: {
      title: MECHANISMS.title,
      content: <MechanismsCard onViewMechanism={() => setStep("figure")} />,
    },
    figure: {
      title: MECHANISM_FIGURE_TITLE,
      content: <MechanismFigureCard onBack={() => setStep("prose")} />,
    },
  };
  const card = step === null ? undefined : CARDS[step];

  usePreloadImage(mechanismUrl);

  return (
    <section aria-labelledby="chapter-heading">
      {/* Uppercase is CSS, not copy — the accessible name stays title-case. */}
      <h1
        id="chapter-heading"
        className="font-display text-3xl font-bold tracking-wide text-brand-crimson-50 uppercase lg:text-5xl"
      >
        {AGENTS.title}
      </h1>

      <BulletList
        items={AGENTS.body}
        className="mt-8 text-xl lg:text-2xl"
        childClassName={(child) => cn("font-semibold", AGENT_TONE.get(child))}
      />

      <div className="mt-14">
        {/* Reserved boxes at the drawn 227×185 — the three §7.7 thumbnails have no asset yet. */}
        <div
          className={cn(
            GROUP,
            "flex flex-col items-center gap-8 lg:flex-row lg:gap-x-10 xl:gap-x-35.25",
          )}
        >
          {REBALANCING_AGENTS.map((agent) => (
            <div
              key={agent.name}
              // `border-[0.25rem]` not `border-4`: the numeric utility is px and
              // would pin the outline while the box scales (§19). Editors will
              // offer to "canonicalise" it — decline.
              className="h-48 w-full max-w-56 shrink-0 border-[0.25rem] border-black lg:shrink"
            />
          ))}
        </div>

        <p className="mt-4 text-center text-xl font-bold text-popup-caption uppercase lg:text-2xl">
          {BOXES_CAPTION}
        </p>

        {/* `flex-col-reverse` on the phone: the DOM keeps caption-then-button
            while the narrow layout paints the `+` first. */}
        <div
          className={cn(
            GROUP,
            "mt-20 flex flex-col-reverse items-center gap-y-4",
            "sm:flex-row sm:flex-wrap sm:items-start sm:gap-x-6",
          )}
        >
          <p className="max-w-135 text-center text-xl font-bold text-popup-caption sm:text-left lg:text-2xl">
            {MECHANISMS_LABEL}
          </p>

          <PopupButton
            label={MECHANISMS_LABEL}
            open={step !== null}
            // Not `aria-controls`: a modal dialog lives in the top layer, so it
            // is not a region of this page the button expands.
            aria-haspopup="dialog"
            onClick={(next) => setStep(next ? "prose" : null)}
          />
        </div>
      </div>

      <Popup open={card !== undefined} title={card?.title ?? ""} onClose={() => setStep(null)}>
        {card?.content}
      </Popup>
    </section>
  );
}

/** The headings are `<h3>` — `Popup`'s band is the card's `<h2>`. */
function MechanismsCard({ onViewMechanism }: { onViewMechanism: () => void }) {
  return (
    <div className="py-6">
      {MECHANISMS.body.map((item) =>
        typeof item === "string" ? (
          <p key={item} className="text-xl leading-tight text-black lg:text-2xl">
            {item}
          </p>
        ) : (
          <section key={item.text} className="mt-6">
            <h3 className="text-2xl font-bold text-brand-crimson-50 lg:text-3xl">{item.text}</h3>
            <BulletList items={item.children} className="mt-4 text-base leading-[1.6] lg:text-xl" />
          </section>
        ),
      )}

      <CardFooter>
        {/* Sentence case with `uppercase` in CSS, as the component's doc requires. */}
        <Button
          className="px-8 py-2.5 text-xl uppercase sm:px-12 lg:px-16 lg:text-2xl"
          onClick={onViewMechanism}
        >
          View mechanism
        </Button>
      </CardFooter>
    </div>
  );
}

/** `width`/`height` are the drawn 886 — the card body's own inner width. */
function MechanismFigureCard({ onBack }: { onBack: () => void }) {
  return (
    <div className="py-6">
      <PopupFigure src={mechanismUrl} width={886} height={430} alt={MECHANISM_FIGURE_ALT} />

      <CardFooter>
        {/* `aria-label` overrides `NavArrowButton`'s hardcoded "Previous", which
            means nothing inside a card. */}
        <NavArrowButton
          direction="back"
          aria-label={`Back to ${MECHANISMS.title}`}
          onClick={onBack}
        />
      </CardFooter>
    </div>
  );
}

/**
 * Neither card carries an abbreviation footnote any more, so the row holds only
 * its action — `ms-auto` is what still puts that action on the right.
 */
function CardFooter({ children }: { children: ReactNode }) {
  return (
    <div className="mt-8 flex flex-wrap items-end gap-x-6 gap-y-4">
      <div className="ms-auto">{children}</div>
    </div>
  );
}
