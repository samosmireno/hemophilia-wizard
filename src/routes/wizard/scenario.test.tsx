import { render, screen, within } from "@testing-library/react";
import { RouterProvider, createMemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import {
  CLASSES_TO_CONSIDER,
  scenarioKey,
  type ScenarioKey,
  type WizardHemophiliaType,
} from "../../data/wizard";
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
function renderScenario(type: WizardHemophiliaType, hasInhibitors: boolean, key: ScenarioKey) {
  seedWizardAnswers({ type, hasInhibitors, reason: "bleeding-control" });
  const router = createMemoryRouter(routes, { initialEntries: ["/wizard/scenario"] });
  render(<RouterProvider router={router} />);

  return screen.getByRole("region", { name: CLASSES_TO_CONSIDER[key].title });
}

/** The four branches, and the key each is expected to resolve to. */
const BRANCHES: [WizardHemophiliaType, boolean, ScenarioKey][] = [
  ["A", false, "A-without"],
  ["A", true, "A-with"],
  ["B", false, "B-without"],
  ["B", true, "B-with"],
];

/** The lead as a reader sees it: the delimiters are markup, not text. */
function stripMarkup(text: string) {
  return text.replace(/_([^_]+)_/g, "$1").replace(/\*\*([^*]+)\*\*/g, "$1");
}

describe("wizard scenario — the four screens", () => {
  it.each(BRANCHES)("renders hemophilia %s, inhibitors=%s as its own screen", (type, inh, key) => {
    const data = CLASSES_TO_CONSIDER[key];
    const region = renderScenario(type, inh, key);

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

  it.each(BRANCHES)("emphasises the polarity word for %s/%s", (type, inh, key) => {
    const region = renderScenario(type, inh, key);

    /*
      The one thing the four leads exist to say. `with` / `without` is the only
      difference between two otherwise near-identical sentences, so the emphasis
      is content: if it stopped rendering, the page would still read correctly
      and would have lost the distinction the designer drew on all four screens.
    */
    expect(within(region).getByText(inh ? "with" : "without").tagName).toBe("EM");
  });

  it("keeps the resolved key in step with scenarioKey()", () => {
    for (const [type, inh, key] of BRANCHES) expect(scenarioKey(type, inh)).toBe(key);
  });
});

describe("wizard scenario — the caveat", () => {
  it("shows the bypassing-agents note on hemophilia B with inhibitors", () => {
    const region = renderScenario("B", true, "B-with");

    expect(region).toHaveTextContent(CLASSES_TO_CONSIDER["B-with"].caveat!);
  });

  it.each(BRANCHES.filter(([, , key]) => key !== "B-with"))(
    "shows no caveat on %s/%s",
    (type, inh, key) => {
      const region = renderScenario(type, inh, key);

      expect(region).not.toHaveTextContent(/^Note: Bypassing agents/);
    },
  );
});

describe("wizard scenario — the illustration boxes", () => {
  it.each(BRANCHES)("reserves one box per class for %s/%s", (type, inh, key) => {
    const region = renderScenario(type, inh, key);

    /*
      The boxes are inert reserved divs with no accessible role — no asset exists
      for any of them (CONTEXT.md §7.7), and a button that opened nothing would be
      worse than none. So they are counted through the DOM, which is the honest
      way to assert something deliberately invisible to assistive tech.
    */
    expect(region.querySelectorAll("div.border-4")).toHaveLength(
      CLASSES_TO_CONSIDER[key].classes.length,
    );
  });

  it.each(BRANCHES)("captions the boxes for %s/%s", (type, inh, key) => {
    const region = renderScenario(type, inh, key);

    expect(within(region).getByText(CLASSES_TO_CONSIDER[key].caption)).toBeInTheDocument();
  });

  /**
   * The layout fact this page derives rather than reads. Asserted through the
   * class that flips, because the DOM order deliberately does NOT change: source
   * order stays caption-then-boxes on all four screens so the caption is read
   * before what it describes, and only the painting reverses.
   */
  it.each(BRANCHES)(
    "paints the caption below the boxes only when there is one, %s/%s",
    (type, inh, key) => {
      const region = renderScenario(type, inh, key);
      const single = CLASSES_TO_CONSIDER[key].classes.length === 1;

      expect(region.querySelector(".flex-col-reverse") !== null).toBe(single);
    },
  );

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
   * (3 × 227 + 2 × 32 = 745 in 752). The box's drawn size is asserted rather
   * than inferred from the row fitting, since a future gap change would resume
   * shrinking it silently.
   *
   * jsdom computes no layout, so a class string is the only thing here that can
   * fail; the pixel arithmetic behind these values is unverified (open item 43).
   */
  it.each(BRANCHES)(
    "ramps the row's gap rather than the boxes, which stay drawn-size at every width, %s/%s",
    (type, inh, key) => {
      const region = renderScenario(type, inh, key);
      const boxes = [...region.querySelectorAll("div.border-4")];

      for (const box of boxes) {
        expect(box).toHaveClass("h-[185px]", "max-w-[227px]", "shrink-0", "lg:shrink");
      }

      const row = boxes[0].parentElement!;
      expect(row).toHaveClass("flex-col", "gap-8", "lg:flex-row", "xl:gap-x-30");
      expect(row).not.toHaveClass("lg:gap-x-30");
    },
  );
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
   * The `<h1>` is asserted alongside them because it is the reason the rest
   * ramp: it drops 48 → 30 below `lg` under §2's app-wide rule, and prose left
   * at 24 would read at 0.8× the heading on a phone where the artboard draws
   * 0.5×.
   */
  it.each(BRANCHES)("steps every transcribed size down one below lg, %s/%s", (type, inh, key) => {
    const data = CLASSES_TO_CONSIDER[key];
    const region = renderScenario(type, inh, key);

    expect(within(region).getByRole("heading", { level: 1 })).toHaveClass(
      "text-3xl",
      "lg:text-5xl",
    );
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
