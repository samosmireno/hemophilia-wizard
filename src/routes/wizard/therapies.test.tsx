import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RouterProvider, createMemoryRouter } from "react-router";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import type { Bullet } from "../../data/education";
import {
  SWITCH_REASONS,
  recommend,
  scenarioKey,
  type SwitchReason,
  type WizardHemophiliaType,
} from "../../data/wizard";
import { seedWizardAnswers, setReducedMotion } from "../../test/setup";
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

describe("wizard therapies — the accordion payoff scroll", () => {
  /**
   * On a phone the Strategies panel can open entirely below the fold, so the
   * page scrolls the opened panel into view — `block: "nearest"`, which is a
   * no-op wherever the panel is already visible.
   *
   * jsdom computes no layout and implements no scrolling, so `scrollIntoView`
   * is stubbed onto the prototype and the assertions are about WHEN it fires
   * and with what, not where the page ends up. The timing is the substance:
   * at click time the grid row is still `0fr`, so a scroll fired there would
   * measure a zero-height box — it has to wait for the height transition to
   * land, except under reduced motion, where no transition ever fires and the
   * open flip itself scrolls, instantly.
   */
  const scrollIntoView = vi.fn();
  const original = HTMLElement.prototype.scrollIntoView;

  beforeEach(() => {
    scrollIntoView.mockClear();
    HTMLElement.prototype.scrollIntoView = scrollIntoView;
  });

  afterEach(() => {
    HTMLElement.prototype.scrollIntoView = original;
  });

  it("scrolls the opened panel into view when its expansion lands", async () => {
    const user = userEvent.setup();
    const { note } = recommend("B", true, "bleeding-control");
    const region = renderTherapies("B", true, "bleeding-control");

    await user.click(headers(region)[1]);

    /* Not at click time — the row is still 0fr and "nearest" would stop at the
       header. The transition's end is what carries the real geometry. */
    expect(scrollIntoView).not.toHaveBeenCalled();

    const panel = within(region).getByRole("region", { name: note.strategies.title });
    const wrapper = panel.parentElement!.parentElement!;

    /* The panel's own opacity transition bubbles through the wrapper 70ms
       before the height lands, and must not fire the scroll — that is what the
       handler's target === currentTarget check is for. */
    fireEvent.transitionEnd(panel);
    expect(scrollIntoView).not.toHaveBeenCalled();

    fireEvent.transitionEnd(wrapper);
    expect(scrollIntoView).toHaveBeenCalledWith({ behavior: "smooth", block: "nearest" });

    /*
      The landing pad: "nearest" aligns to the viewport's bottom, but below `lg`
      the sidebar's fixed bottom bar owns the last 80px of it. `scroll-mb-bar`
      is the same clearance `<main>` reserves as `pb-bar`, dropped at `lg` with
      it — measured at 375×667, without it the panel's final lines settle
      behind the bar.
    */
    expect(wrapper).toHaveClass("scroll-mb-bar", "lg:scroll-mb-0");
  });

  it("jumps instead of animating under prefers-reduced-motion", async () => {
    setReducedMotion(true);
    const user = userEvent.setup();
    const region = renderTherapies("B", true, "bleeding-control");

    /* Considerations opens on mount, and mount must not yank the page. */
    expect(scrollIntoView).not.toHaveBeenCalled();

    await user.click(headers(region)[1]);

    /* `motion-reduce:transition-none` means no transitionend will ever come, so
       the open flip itself scrolls — with no `behavior: "smooth"`, because a
       smooth scroll is exactly the motion the preference declines. */
    expect(scrollIntoView).toHaveBeenCalledTimes(1);
    expect(scrollIntoView).toHaveBeenCalledWith({ block: "nearest" });
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
      The caption/title split `fviii-mimetics` records, here spanning two
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

describe("wizard therapies — the responsive pass", () => {
  /**
   * The four decisions of 2026-08-05, asserted as class strings because jsdom
   * computes no layout and a class string is the only thing here that can fail.
   * The pixel arithmetic behind them was measured in a browser instead
   * (docs/styling.md §15).
   *
   * The `<h1>` rides along in the first test because it is the reason the rest
   * ramp: it drops 48 → 30 below `lg` under §2's app-wide rule, so a body left
   * at its drawn 20 would read 0.67× the heading on a phone where the artboard
   * draws 0.42×.
   */
  it.each(LEAVES)(
    "steps the heading, the bands and the body below lg, %s/%s/%s",
    (type, inh, why) => {
      const region = renderTherapies(type, inh, why);

      expect(within(region).getByRole("heading", { level: 1 })).toHaveClass(
        "text-3xl",
        "lg:text-5xl",
      );

      for (const header of headers(region)) {
        expect(header).toHaveClass("text-xl", "lg:text-2xl");
        /* A bare `text-2xl` would be the pre-pass value surviving the merge. */
        expect(header.className.split(/\s+/)).not.toContain("text-2xl");
        /* The 44px band is a floor at every width, not a thing that ramps. */
        expect(header).toHaveClass("min-h-11");
      }
    },
  );

  /**
   * **§2's body-copy exception reaches a fifth page here, and this is the first
   * one whose step lands ON the 16px floor** rather than above it: the other
   * four transcribe 26 and step to 20, where this page is drawn at 20.
   *
   * `leading-[1.4]` is pinned separately from the size and matters more than it
   * looks. The drawn 20/28 shipped as `leading-7`, which is absolute — against a
   * 16px step it renders 1.75, i.e. the step loosening what it was meant to
   * tighten. The ratio is what survives both sizes with one class, which is §2's
   * own lesson from `fviii-mimetics`.
   */
  it.each(LEAVES)(
    "steps the panel bullets to the floor, on a ratio, %s/%s/%s",
    (type, inh, why) => {
      const { note } = recommend(type, inh, why);
      const region = renderTherapies(type, inh, why);
      const list = within(region)
        .getByRole("region", { name: note.considerations.title })
        .querySelector("ul")!;

      expect(list).toHaveClass("text-base", "leading-[1.4]", "lg:text-xl");
      expect(list.className.split(/\s+/)).not.toContain("leading-7");
    },
  );

  /**
   * The measure fix, and the half of it that must NOT move.
   *
   * Three insets stack inside this panel — the 12px `mx-3`, this padding, and
   * `BulletList`'s `pl-6` — and at the drawn 36 that is 120px of chrome inside a
   * 311px column, leaving 191px of measure. Both halves are pinned because
   * either alone reopens it: the padding must ramp, and `mx-3` must not, since
   * it is where the `border-x` stroke and `last`'s bottom corners land.
   */
  it.each(LEAVES)(
    "ramps the panel's padding and not its 12px inset, %s/%s/%s",
    (type, inh, why) => {
      const { note } = recommend(type, inh, why);
      const region = renderTherapies(type, inh, why);
      const panel = within(region).getByRole("region", { name: note.considerations.title });

      expect(panel).toHaveClass("px-4", "sm:px-6", "lg:px-9");
      expect(panel).toHaveClass("mx-3");
      for (const c of ["sm:mx-0", "lg:mx-3", "px-9"]) {
        expect(panel.className.split(/\s+/)).not.toContain(c);
      }
    },
  );

  /**
   * The one deliberate non-step, pinned so a later consistency pass does not
   * take it silently. Nothing about this element's box moves with the viewport:
   * `w-40` fits even the 224px a 320px phone leaves inside the row's `px-4`,
   * `PopupButton` is a fixed 65px `shrink-0` from the package, and the captions
   * are single words that never wrap and never touch a measure.
   */
  it.each(LEAVES)("holds the agent captions at one size, %s/%s/%s", (type, inh, why) => {
    const { recommendations } = recommend(type, inh, why);
    const region = renderTherapies(type, inh, why);

    for (const treatment of recommendations) {
      const caption = within(region).getByText(treatment.agent, { selector: "p" });
      expect(caption).toHaveClass("text-xl");
      for (const c of ["text-base", "lg:text-xl", "lg:text-2xl"]) {
        expect(caption.className.split(/\s+/)).not.toContain(c);
      }
      expect(caption.parentElement).toHaveClass("w-40", "shrink-0", "xl:shrink");
    }
  });
});
