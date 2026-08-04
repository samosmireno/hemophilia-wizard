import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { DRUG_SHEETS, type DrugSheet } from "../data/drug-sheets";
import DrugSheetPopup from "./DrugSheetPopup";

/**
 * The card's five sections, in the order it stacks them, as a function of the
 * sheet — so the sweep below asserts the *rendered* order rather than restating
 * the component's list of fields.
 *
 * The two optional headings are resolved here exactly as the component resolves
 * them, which is what makes "Class" on Efanesoctocog and Denecimig's sentence
 * assertions rather than coincidences.
 */
function sections(sheet: DrugSheet): [heading: string, items: string[]][] {
  return [
    [sheet.classHeading ?? "Class/Target", [...sheet.classTarget]],
    ["Indication", [...sheet.indication]],
    ["Dosage and Administration", [...sheet.dosing]],
    [sheet.monitoringHeading ?? "Monitoring", [...sheet.monitoring]],
    ["Clinical Trials", sheet.trials.map((t) => `${t.name} (${t.id})`)],
  ];
}

/** The open card, queried as what it is: a modal dialog in the top layer. */
function openCard(agent: string) {
  render(<DrugSheetPopup agent={agent} onClose={() => {}} />);
  return screen.getByRole("dialog");
}

describe("DrugSheetPopup — all seven sheets", () => {
  it.each(DRUG_SHEETS.map((s) => [s.agent, s] as const))("renders %s", (_agent, sheet) => {
    const card = openCard(sheet.agent);

    /*
      The band's own name, which is the agent's except on the one sheet the
      source titles differently. Sentence case in the accessible name and shouted
      in CSS, the app-wide rule — `Popup` labels the dialog from the string it
      was passed, so this is what the caller supplied rather than what is painted.
    */
    expect(card).toHaveAccessibleName(sheet.title ?? sheet.agent);

    const headings = within(card)
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);

    /*
      Order is the CARD's, not the data's — every artboard stacks the same five —
      so it is asserted as a sequence rather than as five separate lookups. The
      colon belongs to the card too: the data stores headings without it, so that
      no record has to remember to carry one.
    */
    expect(headings).toEqual(sections(sheet).map(([heading]) => `${heading}:`));

    /*
      Each section's bullets, scoped to the list that follows its own heading.
      Walking the DOM sibling rather than querying all lists at once is what
      catches a section rendering under the wrong label — which flat text
      assertions would pass straight through.
    */
    for (const [heading, items] of sections(sheet)) {
      const h3 = within(card).getByRole("heading", { level: 3, name: `${heading}:` });
      const list = h3.nextElementSibling as HTMLElement;

      expect(list.tagName).toBe("UL");
      expect(
        within(list)
          .getAllByRole("listitem")
          .map((li) => li.textContent),
      ).toEqual(items);
    }
  });
});

describe("DrugSheetPopup — the two heading overrides", () => {
  /*
    Both are single-sheet deviations transcribed from the source, so each is
    pinned twice: that the one sheet has it, and that a neighbouring sheet does
    not. Asserting only the first would let a default that had drifted to the
    override's value pass.
  */
  it("heads Efanesoctocog alfa's first section 'Class', not 'Class/Target'", () => {
    const card = openCard("Efanesoctocog alfa");

    expect(within(card).getByRole("heading", { level: 3, name: "Class:" })).toBeInTheDocument();
    expect(within(card).queryByRole("heading", { level: 3, name: "Class/Target:" })).toBeNull();
  });

  it("heads Emicizumab's first section 'Class/Target' by default", () => {
    const card = openCard("Emicizumab");

    expect(
      within(card).getByRole("heading", { level: 3, name: "Class/Target:" }),
    ).toBeInTheDocument();
  });

  it("carries Denecimig's TBD qualifier as the Monitoring heading, not as a bullet", () => {
    const card = openCard("Denecimig");
    const qualifier = "Monitoring: TBD; based on phase 3 clinical trial data:";

    expect(within(card).getByRole("heading", { level: 3, name: qualifier })).toBeInTheDocument();
    /* It was transcribed as `monitoring[0]` before a card existed to draw it. */
    expect(within(card).queryByRole("listitem", { name: qualifier })).toBeNull();
    expect(
      within(card)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).not.toContain(qualifier);
  });

  it("titles Denecimig's card with its status qualifier", () => {
    /* The caption/title split: the `+` says "Expand Denecimig", the card is
       named what the source calls the sheet. */
    expect(openCard("Denecimig")).toHaveAccessibleName("Denecimig (emerging/investigational)");
  });
});

describe("DrugSheetPopup — clinical trials", () => {
  it("renders every trial as Name (NCTxxxxx), with nothing after it", () => {
    const card = openCard("Denecimig");
    const h3 = within(card).getByRole("heading", { level: 3, name: "Clinical Trials:" });
    const items = within(h3.nextElementSibling as HTMLElement)
      .getAllByRole("listitem")
      .map((li) => li.textContent);

    /*
      The four tails this sheet alone carried ("See Mancuso NEJM 2026" and its
      siblings) are cut by client direction, 2026-08-04 — and Denecimig is the
      only sheet that could regress, so it is the one pinned.
    */
    expect(items).toEqual([
      "FRONTIER2 (NCT05053139)",
      "FRONTIER3 (NCT05306418)",
      "FRONTIER4 (NCT05685238)",
      "FRONTEIR5 (NCT05878938)",
    ]);
    for (const item of items) expect(item).not.toMatch(/See |: /);
  });

  it("renders no link anywhere in the card", () => {
    /* Same cut, stated as the absence it actually is: the citations were drawn
       as blue underlined links, and nothing replaced them. */
    expect(within(openCard("Denecimig")).queryAllByRole("link")).toHaveLength(0);
  });
});

describe("DrugSheetPopup — what opens and what does not", () => {
  it("opens nothing for a null agent", () => {
    render(<DrugSheetPopup agent={null} onClose={() => {}} />);

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens nothing for a name with no sheet", () => {
    /*
      A real case, not a fabricated one: treatments.ts carries generic SHL and EHL
      rows, and CONTEXT.md §6 records that the source authored no sheet for either
      because they are class rows rather than branded agents. A caller handing one
      over gets no card, not a card with five empty headings.
    */
    render(<DrugSheetPopup agent="Standard half-life FVIII/FIX" onClose={() => {}} />);

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("calls onClose from the ✕", async () => {
    const user = userEvent.setup();
    let closed = 0;
    render(<DrugSheetPopup agent="Fitusiran" onClose={() => closed++} />);

    await user.click(screen.getByRole("button", { name: "Close Fitusiran" }));

    expect(closed).toBe(1);
  });
});
