import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";

import type { Bullet } from "../../data/education";
import {
  SWITCH_REASONS,
  recommend,
  scenarioKey,
  type SwitchReason,
  type WizardHemophiliaType,
} from "../../data/wizard";
import { seedWizardAnswers } from "../../test/setup";
import { routes } from "../router";

/**
 * Mounted through the app's own `routes` for the reason `scenario.test.tsx`
 * records: the answers live in a provider in `AppShell` and this page sits behind
 * a layout route, so the wiring under test only exists in the real tree.
 *
 * Returns the page's own region — the `<section>`, named by its `<h1>`, which on
 * this page is the reason's imperative label. Every query below is scoped to it
 * rather than to `screen`, because the shell renders a sidebar full of list items
 * and buttons that would otherwise be indexed alongside the page's.
 */
function renderTherapies(type: WizardHemophiliaType, hasInhibitors: boolean, reason: SwitchReason) {
  seedWizardAnswers({ type, hasInhibitors, reason });
  const router = createMemoryRouter(routes, { initialEntries: ["/wizard/therapies"] });
  render(<RouterProvider router={router} />);

  const label = SWITCH_REASONS.find((r) => r.id === reason)!.label;
  return screen.getByRole("region", { name: label });
}

/** All sixteen leaves: 4 scenarios × 4 reasons. */
const LEAVES: [WizardHemophiliaType, boolean, SwitchReason][] = (
  ["A", "B"] as WizardHemophiliaType[]
).flatMap((type) =>
  [false, true].flatMap((inh) =>
    SWITCH_REASONS.map((r) => [type, inh, r.id] as [WizardHemophiliaType, boolean, SwitchReason]),
  ),
);

/** A note's bullets as a reader meets them, nested level flattened in source order. */
function flatten(points: Bullet[]): string[] {
  return points.flatMap((p) => (typeof p === "string" ? [p] : [p.text, ...p.children]));
}

/** The two header buttons, in the order the page stacks them. */
function headers(region: HTMLElement) {
  return within(region)
    .getAllByRole("heading", { level: 2 })
    .flatMap((h) => within(h).queryAllByRole("button"));
}

describe("wizard therapies — the sixteen leaves", () => {
  it.each(LEAVES)("renders hemophilia %s, inhibitors=%s, %s from recommend()", (type, inh, why) => {
    const { note, recommendations } = recommend(type, inh, why);
    const region = renderTherapies(type, inh, why);

    /*
      Sentence case in the accessible name, shouted in CSS — the app-wide rule.
      The `<h1>` is the artboard's imperative `label`, not the blueprint's gerund
      `sourceLabel`; the arch below is what uses the other one, and the two
      assertions together are what keep the pair from being collapsed into one
      string.
    */
    const heading = within(region).getByRole("heading", { level: 1 });
    expect(heading).toHaveAccessibleName(SWITCH_REASONS.find((r) => r.id === why)!.label);
    expect(heading).toHaveClass("uppercase");

    /*
      The notes are SCENARIO-specific, not shared per reason (CONTEXT.md §4.2) —
      which is exactly what asserting the titles across all sixteen leaves pins.
      Four of the sixteen would still pass against a per-reason lookup; the other
      twelve would not.
    */
    const [considerations, strategies] = headers(region);
    expect(considerations).toHaveTextContent(note.considerations.title);
    expect(strategies).toHaveTextContent(note.strategies.title);

    /* The curated agent list — issue 08's "all 4 scenarios reach the correct
       curated leaf, verified against wizard.ts". */
    expect(recommendations).not.toHaveLength(0);
    for (const treatment of recommendations) {
      expect(within(region).getByText(treatment.agent)).toBeInTheDocument();
    }
  });

  it.each(LEAVES)("resolves every recommended agent for %s/%s/%s", (type, inh, why) => {
    /* A recommendation naming an agent with no `Treatment` record would render as
       a missing button rather than as an error, so it is asserted rather than
       looked at. */
    expect(recommend(type, inh, why).unresolved).toEqual([]);
  });

  it("keeps the resolved scenario in step with scenarioKey()", () => {
    for (const [type, inh, why] of LEAVES) {
      expect(recommend(type, inh, why).scenario).toBe(scenarioKey(type, inh));
    }
  });
});

describe("wizard therapies — the one-open accordion", () => {
  it("opens Considerations on mount, with Strategies closed", () => {
    const region = renderTherapies("B", true, "bleeding-control");
    const [considerations, strategies] = headers(region);

    expect(considerations).toHaveAttribute("aria-expanded", "true");
    expect(strategies).toHaveAttribute("aria-expanded", "false");
  });

  it("marks the open header aria-disabled and leaves it focusable", () => {
    const region = renderTherapies("B", true, "bleeding-control");
    const [considerations, strategies] = headers(region);

    /*
      APG's rule for an accordion that will not let its last panel collapse. NOT
      the `disabled` attribute: the header is its panel's label, so it has to stay
      in the tab order and readable — which is what `toBeEnabled` pins here.
    */
    expect(considerations).toHaveAttribute("aria-disabled", "true");
    expect(considerations).toBeEnabled();
    expect(strategies).not.toHaveAttribute("aria-disabled");
  });

  it("swaps which block is open when the closed header is clicked", async () => {
    const user = userEvent.setup();
    const region = renderTherapies("B", true, "bleeding-control");
    const [considerations, strategies] = headers(region);

    await user.click(strategies);

    expect(strategies).toHaveAttribute("aria-expanded", "true");
    expect(strategies).toHaveAttribute("aria-disabled", "true");
    expect(considerations).toHaveAttribute("aria-expanded", "false");
    expect(considerations).not.toHaveAttribute("aria-disabled");

    /*
      The shadow travels with the ground, because state is carried twice: the
      open band is recessed (black inset) and the closed one lifted (white).
      Asserted as classes rather than as computed style — Tailwind is not built
      for vitest, so jsdom resolves `box-shadow` to nothing — which makes this a
      guard against the shadow being left behind in a refactor of the branch
      above, not a claim about how it renders. That is checked in a browser.
    */
    expect(strategies).toHaveClass("shadow-note-open");
    expect(considerations).toHaveClass("shadow-note-closed");
  });

  it("does nothing when the already-open header is clicked", async () => {
    const user = userEvent.setup();
    const region = renderTherapies("B", true, "bleeding-control");
    const [considerations, strategies] = headers(region);

    await user.click(considerations);

    /* Exactly one is open, always — closing is not a state this accordion has.
       See docs/adr/0005-one-open-leaf-accordion.md. */
    expect(considerations).toHaveAttribute("aria-expanded", "true");
    expect(strategies).toHaveAttribute("aria-expanded", "false");
  });

  it("hides the closed panel from assistive tech", async () => {
    const user = userEvent.setup();
    const region = renderTherapies("B", true, "bleeding-control");
    const { note } = recommend("B", true, "bleeding-control");

    /*
      Both panels are always in the DOM — that is what lets one collapse while the
      other expands — so the closed one has to be taken out of the accessibility
      tree explicitly. Without this a screen reader reads both lists back to back,
      and `overflow: hidden` does nothing about it.

      Queried through `getByRole("region")` rather than the DOM, because
      `aria-hidden` is precisely what that query honours.
    */
    const named = (title: string) => within(region).queryByRole("region", { name: title });

    expect(named(note.considerations.title)).toBeInTheDocument();
    expect(named(note.strategies.title)).toBeNull();

    await user.click(headers(region)[1]);

    expect(named(note.considerations.title)).toBeNull();
    expect(named(note.strategies.title)).toBeInTheDocument();
  });

  it.each(LEAVES)("renders the open block's bullets for %s/%s/%s", (type, inh, why) => {
    const { note } = recommend(type, inh, why);
    const region = renderTherapies(type, inh, why);
    const panel = within(region).getByRole("region", { name: note.considerations.title });

    /*
      Nested bullets are markup, not indentation: the `treatment-burden` notes
      subordinate their age restrictions to a colon-terminated lead-in, so a
      child's `<li>` sits INSIDE its parent's. Comparing the flattened source
      order against every `<li>` in the panel asserts both the text and that
      nothing was dropped on the way through `BulletList`.
    */
    const items = within(panel)
      .getAllByRole("listitem")
      .map((li) =>
        [...li.childNodes]
          .filter((n) => n.nodeType === Node.TEXT_NODE)
          .map((n) => n.textContent)
          .join(""),
      );

    expect(items).toEqual(flatten(note.considerations.points));
  });
});

describe("wizard therapies — the nested treatment-burden bullets", () => {
  /**
   * The one place the data model carries a second level, and the reason
   * `NoteBlock.points` is `Bullet[]` rather than `string[]`. Asserted as
   * structure — a child `<li>` inside its parent's — because rendering the same
   * five strings flat would satisfy any text-only check while losing the depth
   * and count a screen reader announces.
   */
  it.each([
    ["A", false, 3],
    ["A", true, 3],
    ["B", false, 2],
    ["B", true, 2],
  ] as [WizardHemophiliaType, boolean, number][])(
    "nests the age bullets under the lead-in for %s/%s",
    (type, inh, childCount) => {
      const { note } = recommend(type, inh, "treatment-burden");
      const region = renderTherapies(type, inh, "treatment-burden");
      const panel = within(region).getByRole("region", { name: note.considerations.title });

      const leadIn = within(panel)
        .getAllByRole("listitem")
        .find((li) => li.textContent?.startsWith("Frequent IV therapy"))!;

      expect(leadIn).toBeDefined();
      expect(within(leadIn).getAllByRole("listitem")).toHaveLength(childCount);
    },
  );

  it("keeps B-without's gene-therapy bullet at the top level", () => {
    const { note } = recommend("B", false, "treatment-burden");
    const region = renderTherapies("B", false, "treatment-burden");
    const panel = within(region).getByRole("region", { name: note.considerations.title });

    /*
      The one bullet the source's own indentation separates from the nest —
      column 1755 with the top-level bullets, where the two age bullets sit at
      1763 (`documents/out.txt`). It is about gene therapy, not about children,
      and a mechanical "group everything after the colon" rule would have
      swallowed it.
    */
    const leadIn = within(panel)
      .getAllByRole("listitem")
      .find((li) => li.textContent?.startsWith("Frequent IV therapy"))!;

    expect(leadIn.textContent).not.toContain("Gene therapy may reduce");
    expect(panel).toHaveTextContent(/Gene therapy may reduce long-term treatment burden/);
  });
});

describe("wizard therapies — the arch", () => {
  it("names the reason in the blueprint's gerund form", () => {
    const region = renderTherapies("B", true, "bleeding-control");

    /*
      `sourceLabel`, not `label` — the sentence is the blueprint's (CONTEXT.md
      §4.2) and is written against the blueprint's phrasing, where the `<h1>`
      above uses the artboard's imperative. Rendering `label` here would read
      "…if Improve bleeding control is the primary reason…".
    */
    expect(
      within(region).getByRole("heading", {
        level: 2,
        name: "Novel therapies to consider if Improving bleeding control is the primary reason for switching therapies:",
      }),
    ).toBeInTheDocument();
  });

  it.each(LEAVES)("gives every agent a button and a caption for %s/%s/%s", (type, inh, why) => {
    const { recommendations } = recommend(type, inh, why);
    const region = renderTherapies(type, inh, why);

    /*
      `PopupButton` prefixes the label with "Expand", so the accessible name reads
      as a thing that opens. The caption below carries the bare agent name, which
      is what keeps the visible label inside the accessible one (WCAG 2.5.3).
    */
    for (const treatment of recommendations) {
      expect(
        within(region).getByRole("button", { name: `Expand ${treatment.agent}` }),
      ).toBeInTheDocument();
    }
  });

  it.each(LEAVES)("promises a dialog on every agent for %s/%s/%s", (type, inh, why) => {
    const { recommendations } = recommend(type, inh, why);
    const region = renderTherapies(type, inh, why);

    /*
      `aria-haspopup="dialog"`, unconditionally, where the education chapters
      make it conditional on a card existing. Every agent `recommend()` can name
      has a sheet — `content.test.ts` asserts that against `DRUG_SHEETS` — so
      there is no leaf on which a `+` promises something it cannot deliver.

      Swept across all sixteen rather than sampled: a missing sheet would show up
      on one branch, and the six agents are not evenly spread across them.
    */
    for (const treatment of recommendations) {
      expect(
        within(region).getByRole("button", { name: `Expand ${treatment.agent}` }),
      ).toHaveAttribute("aria-haspopup", "dialog");
    }
  });
});

describe("wizard therapies — the drug sheets", () => {
  it("opens the clicked agent's sheet, and only that one", async () => {
    const user = userEvent.setup();
    const region = renderTherapies("B", true, "bleeding-control");

    expect(screen.queryByRole("dialog")).toBeNull();

    await user.click(within(region).getByRole("button", { name: "Expand Concizumab" }));

    /*
      Queried from `screen`, not from the region: a `<dialog>` opened with
      `showModal()` is in the top layer, so it is outside the page's own section
      even though this page is what mounts it.
    */
    const card = screen.getByRole("dialog");
    expect(card).toHaveAccessibleName("Concizumab");
    /* One card for the whole row — see the mount comment on the page. */
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
  });

  it("titles Denecimig's card with the qualifier its button does not carry", async () => {
    const user = userEvent.setup();
    /* HA with inhibitors, improving bleeding control — a leaf that recommends
       both mimetics, so the split is visible on one screen. */
    const region = renderTherapies("A", true, "bleeding-control");

    await user.click(within(region).getByRole("button", { name: "Expand Denecimig" }));

    /*
      The caption/title split `fviiia-mimetics` records, here spanning two
      components: the page knows the agent, the sheet knows what the card is
      called. A reader hears "Expand Denecimig" on the `+` and
      "Denecimig (emerging/investigational)" on the dialog.
    */
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Denecimig (emerging/investigational)");
  });

  it("closes the sheet from the ✕ and returns the + to its closed state", async () => {
    const user = userEvent.setup();
    const region = renderTherapies("B", true, "bleeding-control");

    await user.click(within(region).getByRole("button", { name: "Expand Fitusiran" }));
    /*
      Scoped to the dialog, because the open trigger is named "Close Fitusiran"
      too — `PopupButton` builds both names the same way, and jsdom implements no
      top layer to make the one underneath unreachable. docs/styling.md §13
      records that pair and prescribes exactly this scoping.
    */
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Close Fitusiran" }),
    );

    expect(screen.queryByRole("dialog")).toBeNull();
    /*
      `PopupButton` names itself "Expand" when closed and "Close" when open, so
      the trigger being findable as "Expand Fitusiran" again IS the assertion
      that the ✕ put the glyph back — the state is one `openAgent`, and the card
      and the button read it together.
    */
    expect(within(region).getByRole("button", { name: "Expand Fitusiran" })).toBeInTheDocument();
  });

  it("swaps sheets when a second agent is clicked", async () => {
    const user = userEvent.setup();
    const region = renderTherapies("B", true, "bleeding-control");

    await user.click(within(region).getByRole("button", { name: "Expand Concizumab" }));
    /*
      The first card is modal, so its `+` is inert underneath it — a real reader
      reaches the second agent by closing the first. Doing it in that order here
      is what keeps this a test of the state and not of jsdom's willingness to
      click through a scrim. Scoped to the dialog for the reason above.
    */
    await user.click(
      within(screen.getByRole("dialog")).getByRole("button", { name: "Close Concizumab" }),
    );
    await user.click(within(region).getByRole("button", { name: "Expand Marstacimab" }));

    expect(screen.getByRole("dialog")).toHaveAccessibleName("Marstacimab");
  });
});
