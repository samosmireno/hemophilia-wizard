import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import { classFilterFor } from "../../data/explore";
import { TREATMENTS } from "../../data/treatments";
import { ALL_SCENARIOS, classesFor, type WizardHemophiliaType } from "../../data/wizard";
import { seedWizardAnswers } from "../../test/setup";
import { routes } from "../router";

/**
 * Mounted through the app's own `routes` for the reason `wizard.test.tsx`
 * records: the answers live in a provider in `AppShell` and this page sits behind
 * a layout route, so the wiring under test only exists in the real tree.
 *
 * Returns the page's own region — the `<section>`, named by its `<h1>`. Every
 * query below is scoped to it rather than to `screen`, because the shell renders
 * a sidebar full of list items and buttons that would otherwise be indexed
 * alongside the page's.
 */
function renderScenario(type: WizardHemophiliaType, hasInhibitors: boolean) {
  seedWizardAnswers({ type, hasInhibitors, reason: "bleeding-control" });
  const router = createMemoryRouter(routes, { initialEntries: ["/wizard/scenario"] });
  render(<RouterProvider router={router} />);

  return screen.getByRole("region", { name: classesFor({ type, hasInhibitors }).title });
}

/**
 * The four branches, taken from `ALL_SCENARIOS` rather than written out — the set
 * is the data module's to state. Flattened to tuples only so `it.each` can name
 * each case in its title.
 */
const BRANCHES: [WizardHemophiliaType, boolean][] = ALL_SCENARIOS.map(({ type, hasInhibitors }) => [
  type,
  hasInhibitors,
]);

/** The lead as a reader sees it: the delimiters are markup, not text. */
function stripMarkup(text: string) {
  return text.replace(/_([^_]+)_/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1");
}

describe("wizard scenario — the four screens", () => {
  it.each(BRANCHES)("renders hemophilia %s, inhibitors=%s as its own screen", (type, inh) => {
    const data = classesFor({ type, hasInhibitors: inh });
    const region = renderScenario(type, inh);

    /*
      Sentence case in the accessible name, shouted in CSS — the app-wide rule,
      and the reason this one string is NOT rendered through `formatInline`.
    */
    const heading = within(region).getByRole("heading", { level: 1 });
    expect(heading).toHaveAccessibleName(data.title);
    expect(heading).toHaveClass("uppercase");

    /*
      Asserted with the markup stripped, which is the point: `_with_` is never
      text on the page. `toHaveTextContent` rather than a `getByText` for the
      paragraph — RTL joins only an element's DIRECT text nodes, so a sentence
      split by an `<em>` never matches a full-string query.
    */
    expect(region).toHaveTextContent(stripMarkup(data.lead));

    expect(
      within(region)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual(data.classes);
  });

  it.each(BRANCHES)("emphasises the polarity word for %s/%s", (type, inh) => {
    const region = renderScenario(type, inh);

    /*
      The one thing the four leads exist to say. `with` / `without` is the only
      difference between two otherwise near-identical sentences, so the emphasis
      is content: if it stopped rendering, the page would still read correctly
      and would have lost the distinction the designer drew on all four screens.
    */
    expect(within(region).getByText(inh ? "with" : "without").tagName).toBe("EM");
  });
});

describe("wizard scenario — the caveat", () => {
  it("shows the bypassing-agents note on hemophilia B with inhibitors", () => {
    const region = renderScenario("B", true);

    expect(region).toHaveTextContent(classesFor({ type: "B", hasInhibitors: true }).caveat!);
  });

  it.each(BRANCHES.filter(([type, inh]) => !(type === "B" && inh)))(
    "shows no caveat on %s/%s",
    (type, inh) => {
      const region = renderScenario(type, inh);

      expect(region).not.toHaveTextContent(/^Note: Bypassing agents/);
    },
  );
});

describe("wizard scenario — the illustration boxes", () => {
  it.each(BRANCHES)("renders one AgentBoxButton per class for %s/%s", (type, inh) => {
    const region = renderScenario(type, inh);

    /*
      The reserved divs became `AgentBoxButton`s once the class assets arrived,
      so each box is queried by the name the component composes — "Expand
      {class label}" — which also pins the label→asset map covering every
      class the screen lists.
    */
    for (const label of classesFor({ type, hasInhibitors: inh }).classes) {
      expect(within(region).getByRole("button", { name: `Expand ${label}` })).toBeInTheDocument();
    }
  });

  it.each(BRANCHES)("captions the boxes for %s/%s", (type, inh) => {
    const region = renderScenario(type, inh);

    expect(
      within(region).getByText(classesFor({ type, hasInhibitors: inh }).caption),
    ).toBeInTheDocument();
  });

  /**
   * Asserted through the reversing class because the DOM order deliberately
   * does NOT change: source order stays caption-then-boxes on all four screens
   * so the caption is read before what it describes, and only the painting
   * reverses.
   */
  it.each(BRANCHES)("paints the caption below the boxes, %s/%s", (type, inh) => {
    const region = renderScenario(type, inh);

    expect(region.querySelector(".flex-col-reverse")).not.toBeNull();
  });

  /**
   * The 2026-08-04 responsive pass ramped the **gap** and left the boxes alone —
   * the same fix `rebalancing-agents` took for the same row on the same pixel.
   * `lg:gap-x-30` put the drawn 120px gap into the column that had just lost
   * 175px to the gutter step (§12), so the row turned on 169px too wide and
   * `lg:shrink` took it out of the boxes: 171 × 185, a quarter under drawn and
   * portrait where the artboard draws landscape.
   *
   * Both halves are pinned, because either alone reopens it. The drawn gap must
   * stay at `xl`, where the 921px group fits its 1008px column, and the `lg`
   * step must stay unstated so the row keeps the stack's own 32px
   * (3 × 227 + 2 × 32 = 745 in 752). The box's drawn size is `AgentBoxButton`'s
   * own skin, pinned in its component test — this test keeps only the shrink
   * behaviour, which is the caller's.
   *
   * jsdom computes no layout, so a class string is the only thing here that can
   * fail; the pixel arithmetic behind these values is unverified (open item 43).
   */
  it.each(BRANCHES)(
    "ramps the row's gap rather than the boxes, which stay drawn-size at every width, %s/%s",
    (type, inh) => {
      const region = renderScenario(type, inh);
      const boxes = within(region).getAllByRole("button", { name: /^Expand / });

      for (const box of boxes) {
        expect(box).toHaveClass("shrink-0", "lg:shrink");
      }

      const row = boxes[0].parentElement!;
      expect(row).toHaveClass("flex-col", "gap-8", "lg:flex-row", "xl:gap-x-30");
      expect(row).not.toHaveClass("lg:gap-x-30");
    },
  );
});

/**
 * The 2026-08-12 wiring: each illustration box opens the §5 comparison table
 * cut to its own class — `ClassTablePopup`, resolved through `classFilterFor`.
 * The boxes shipped inert until this ruling (issue 08's residue), so the suite
 * that pinned them dead now pins each one open.
 */
describe("wizard scenario — the class table pop-ups", () => {
  it.each(BRANCHES)("opens each box's own slice of the S1 table, %s/%s", async (type, inh) => {
    const user = userEvent.setup();
    const region = renderScenario(type, inh);

    // Sequentially, not per-test: the card is modal, so a reader reaches the
    // next box by closing the current one — the order the clicks reproduce.
    for (const label of classesFor({ type, hasInhibitors: inh }).classes) {
      await user.click(within(region).getByRole("button", { name: `Expand ${label}` }));

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAccessibleName(label);

      /*
        The rows are exactly the bucket's, in S1 row order — computed from the
        same join the component uses, so what this pins is the render, while
        `content.test.ts` pins that the join resolves for every label at all.
      */
      const bucket = classFilterFor(label)!;
      const agents = within(dialog)
        .getAllByRole("row")
        .slice(1) // the header row
        .map((row) => within(row).getAllByRole("cell")[1].textContent);
      expect(agents).toEqual(
        TREATMENTS.filter((t) => bucket.classes.includes(t.treatmentClass)).map((t) => t.agent),
      );

      await user.click(within(dialog).getByRole("button", { name: `Close ${label}` }));
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    }
  });

  /**
   * No `FilterSelect`s, by design: the box already chose the class, and the
   * type/inhibitor dropdowns would let the fixed view contradict its own
   * title. A combobox appearing here means `ClassTablePopup` started rendering
   * `ExploreTable` instead of the bare grid.
   */
  it("offers no filters — the box already chose the class", async () => {
    const user = userEvent.setup();
    const region = renderScenario("A", false);

    await user.click(within(region).getByRole("button", { name: "Expand Factor VIIIa mimetics" }));

    expect(within(screen.getByRole("dialog")).queryByRole("combobox")).not.toBeInTheDocument();
  });

  /**
   * The wide card, asserted here for the reason `/explore`'s table test gives:
   * `Popup`'s own tests cover that the prop works, this covers that this card
   * asks for it — nine S1 columns in the default card are 113px each.
   */
  it("opens the card at the wide width", async () => {
    const user = userEvent.setup();
    const region = renderScenario("B", true);

    await user.click(
      within(region).getByRole("button", { name: "Expand Hemostatic rebalancing agents" }),
    );

    expect(screen.getByRole("dialog").firstElementChild).toHaveClass("w-[min(85rem,96vw)]");
  });
});

describe("wizard scenario — the responsive pass", () => {
  /**
   * Every transcribed size on the screen steps down one below `lg`, asserted in
   * one test because they are one decision rather than four.
   *
   * **This screen is the third case of §2's body-copy exception**, with
   * `rebalancing-agents` and `prophylaxis-guidance`: the other chapters sit on
   * the 16px floor with nowhere to go, while these three transcribe their body
   * at the artboards' 26 and so have exactly one step to give. 20 is a step on
   * the scale, not a collapse onto the other chapters' value.
   *
   * The `<h1>` these ramp against drops 48 → 30 below `lg` under §2's app-wide
   * rule — that ramp is `PageSection`'s and is pinned once in
   * `PageSection.test.tsx`.
   */
  it.each(BRANCHES)("steps every transcribed size down one below lg, %s/%s", (type, inh) => {
    const data = classesFor({ type, hasInhibitors: inh });
    const region = renderScenario(type, inh);

    expect(region.querySelector("ul")).toHaveClass("text-xl", "lg:text-2xl");
    expect(within(region).getByText(data.caption)).toHaveClass("text-xl", "lg:text-2xl");

    /*
      The lead and the caveat are found through the elements they are split
      across: `formatInline` puts an `<em>` inside the lead, so no full-string
      query matches it, and RTL joins only an element's direct text nodes.
    */
    const paragraphs = [...region.querySelectorAll("p")].filter(
      (p) => p.textContent !== data.caption,
    );
    expect(paragraphs).toHaveLength(data.caveat ? 2 : 1);
    for (const paragraph of paragraphs) {
      expect(paragraph).toHaveClass("text-xl", "lg:text-2xl");
    }
  });
});
