import { useState, type ReactNode } from "react";
import { Button, NavArrowButton, NavBarButton, PopupButton } from "mlg-components";

import cascadeThumbUrl from "../assets/images/clotting-cascade-thumb.webp";
import fitusiranUrl from "../assets/images/fitusiran.webp";
import AgentBoxButton from "../components/AgentBoxButton";
import DrugSheetPopup from "../components/DrugSheetPopup";
import ExpandableFigure from "../components/ExpandableFigure";
import NoteDisclosure from "../components/NoteDisclosure";
import PageSection from "../components/PageSection";
import Popup from "../components/Popup";
import { AGENT_NAMES } from "../data/agents";
import { cn } from "../lib/cn";
import ClottingCascadeFigure from "./education/ClottingCascadeFigure";
import { CASCADE_TITLE } from "./education/DiseaseBackground";
import { JUMP_TARGETS } from "./jumpTargets";

/*
  Every demo on this page is the real component doing its real job - the popup
  opens, the figure enlarges, the agent box serves its sheet - so the legend can
  never drift out of sync with the controls it explains. The two exceptions are
  decided ones: the BEGIN button and the sidebar replicas press like the real
  thing but go nowhere - moving through the activity belongs to the live rail
  alone, and the rail this legend mirrors is on this very page.
*/

const DEMO_POPUP_TITLE = "This is a pop-up";

/** What each live jump button does, keyed by the roster the sidebar renders. */
const JUMP_NOTES: Record<(typeof JUMP_TARGETS)[number]["label"], string> = {
  Home: "returns to the start",
  Wizard: "opens the treatment wizard",
  Acronyms: "opens the acronym list",
  References: "opens the references",
  Glossary: "opens the glossary",
};

type DemoDrawer = "first" | "second";

export default function HowTo() {
  const [popupOpen, setPopupOpen] = useState(false);
  const [openAgent, setOpenAgent] = useState<string | null>(null);
  const [openDrawer, setOpenDrawer] = useState<DemoDrawer>("first");

  return (
    // The bleed into the rail gutter is a ≥lg affordance - unprefixed it
    // overflows the phone's `px-6` sideways.
    <PageSection title="How to Use" className="flex flex-1 flex-col pb-4 lg:-mr-12">
      {/* Three layouts: a stack below `lg`, two columns from `lg` (taller than a
          viewport, so it scrolls and pads its own bottom - `lg:mb-16` is item 53's
          clearance carried on the grid because `padsOwnBottom` cannot be
          width-conditional), and the four-column board from `xl`. `xl:mb-0`: the
          board bottoms out 10px above the 800 line - any margin there is what
          tips the one-screen rule into a scrollbar. */}
      <div className="mt-5 mb-4 grid gap-4 lg:mb-16 lg:flex-1 lg:grid-cols-2 xl:mb-0 xl:grid-cols-[1fr_1fr_1.2fr_1.1fr] xl:grid-rows-[auto_auto]">
        <DemoCard caption="Click buttons to interact with page content.">
          {/* Look-only on purpose: moving forward is the Next arrow's job. */}
          <Button className="px-8 py-2.5 text-xl uppercase lg:px-12 lg:text-2xl">Begin</Button>
        </DemoCard>

        {/* U+2011 non-breaking hyphen - "pop-ups" must not split across lines
            in the narrow board columns. */}
        <DemoCard caption="Click + to open pop‑ups. Close them with the X, the Esc key, or a click outside the card.">
          <PopupButton
            label={DEMO_POPUP_TITLE}
            // Not `aria-controls`: a modal dialog lives in the top layer, so it
            // is not a region of this page the button expands.
            aria-haspopup="dialog"
            open={popupOpen}
            onClick={(next) => setPopupOpen(next)}
          />
        </DemoCard>

        <DemoCard caption="Click images that offer “click to enlarge” to expand them.">
          <ExpandableFigure
            thumbSrc={cascadeThumbUrl}
            thumbWidth={940}
            thumbHeight={538}
            title={CASCADE_TITLE}
            surface="white"
            className="max-w-72"
          >
            <ClottingCascadeFigure />
          </ExpandableFigure>
        </DemoCard>

        <DemoCard caption="Click agent boxes to open that agent’s drug information sheet.">
          <AgentBoxButton
            src={fitusiranUrl}
            agent={AGENT_NAMES.fitusiran}
            onClick={() => setOpenAgent(AGENT_NAMES.fitusiran)}
          />
        </DemoCard>

        {/* After the agent box, not before: at `lg`'s two columns auto-placement
            pairs the rows from DOM order (buttons+pop-ups, images+agent box,
            legend+drawers); at `xl` the explicit placement below overrides it. */}
        <SidebarLegend />

        <DemoCard caption="Click a bar with a chevron to expand it." className="xl:col-span-2">
          <div className="w-full">
            <NoteDisclosure
              title="First drawer"
              open={openDrawer === "first"}
              onOpen={() => setOpenDrawer("first")}
            >
              <DrawerLine>This drawer is open - click the other bar to switch.</DrawerLine>
            </NoteDisclosure>
            <NoteDisclosure
              title="Second drawer"
              open={openDrawer === "second"}
              onOpen={() => setOpenDrawer("second")}
              last
            >
              <DrawerLine>
                Opening this drawer closed the first - exactly one stays open.
              </DrawerLine>
            </NoteDisclosure>
          </div>
        </DemoCard>
      </div>

      <Popup
        card={
          popupOpen
            ? {
                title: DEMO_POPUP_TITLE,
                width: "narrow",
                content: (
                  <p className="py-6 text-center text-xl leading-[1.6] text-black lg:text-2xl">
                    Pop‑ups hold extra content. Close this one with the ✕ button, the Esc key, or by
                    clicking outside the card.
                  </p>
                ),
              }
            : null
        }
        onClose={() => setPopupOpen(false)}
      />

      <DrugSheetPopup agent={openAgent} onClose={() => setOpenAgent(null)} />
    </PageSection>
  );
}

function DemoCard({
  caption,
  className,
  children,
}: {
  caption: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-2 rounded-3xl bg-demo-card p-5", className)}>
      <p className="text-center text-base font-bold text-popup-caption lg:text-xl">{caption}</p>
      <div className="flex flex-1 flex-col items-center justify-center">{children}</div>
    </div>
  );
}

function DrawerLine({ children }: { children: ReactNode }) {
  return <p className="text-base leading-[1.4] lg:text-xl">{children}</p>;
}

/**
 * The one legend whose demos do not do their real job: these buttons mirror the
 * sidebar's roster and press like it - hover, focus, the works - but navigating
 * away mid-legend would defeat the page, so none of them goes anywhere. The
 * printed labels do the explaining; the arrows' accessible names say "example"
 * so neither answers to a live rail control's name - the spine-walk tests
 * reach the real arrows by exactly "Previous"/"Next", on this page too.
 */
function SidebarLegend() {
  return (
    <div className="flex flex-col gap-1 rounded-3xl bg-demo-card p-5 xl:col-start-4 xl:row-span-2 xl:row-start-1">
      <p className="text-center text-base font-bold text-popup-caption lg:text-xl">
        Use the menu buttons to navigate the activity.
      </p>

      <ul className="flex flex-1 flex-col justify-evenly">
        {JUMP_TARGETS.map(({ label, Icon }) => (
          <li key={label} className="flex items-center gap-4">
            <NavBarButton className="shrink-0">
              <Icon />
            </NavBarButton>
            {/* No `lg:text-lg` step: at `xl`'s narrowest (1280) the larger size
                wraps every note to three lines and tips the board past 800. */}
            <p className="text-base text-black">
              <span className="font-bold">{label}</span> - {JUMP_NOTES[label]}
            </p>
          </li>
        ))}

        <li className="flex flex-col items-center gap-4">
          <span className="flex shrink-0 gap-2">
            <NavArrowButton direction="back" aria-label="Previous example" />
            <NavArrowButton direction="front" aria-label="Next example" />
          </span>
          <p className="text-base text-black">
            <span className="font-bold">Previous / Next</span> - step through the activity. Next
            unlocks on the wizard once all three inputs are answered.
          </p>
        </li>
      </ul>
    </div>
  );
}
