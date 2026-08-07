import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  type FootnoteKey,
  TREATMENT_OPTIONS_FOOTNOTES,
  TREATMENT_OPTIONS_MATRIX,
  EDUCATION_TOPICS,
} from "../../data/education";
import TreatmentLandscape from "./TreatmentLandscape";

describe("treatment-landscape chapter", () => {
  it("renders the chapter title in title case, not the uppercase it displays", () => {
    render(<TreatmentLandscape />);
    // `uppercase` is a CSS transform, so the accessible name is unaffected —
    // this asserts the copy was not shouted in the markup.
    expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(
      "The Evolving Treatment Landscape for Hemophilia",
    );
  });

  // All three are literals in the chapter, because the artboard's headings and
  // the topics' titles disagree — two by a colon, and "Non-factor therapies:"
  // outright. This is what catches one of them being "helpfully" derived from
  // `topic.title` later.
  it.each([
    "Clotting factor replacement:",
    "Non-factor therapies:",
    "Personalized therapy for HA/HB:",
  ])("renders %s as a section heading", (heading) => {
    render(<TreatmentLandscape />);
    expect(screen.getByRole("heading", { level: 2, name: heading })).toBeInTheDocument();
  });

  /**
   * The clotting block shows its own topic and nothing from `prophylaxis-guidance`,
   * which is §7.4 copy belonging to a different chapter. Both topics held one array
   * until 2026-08-07, and this page read it by slice — so the absence half is what
   * the split has to keep true, not just the presence half.
   */
  it("shows the clotting-factor topic, not the prophylaxis guidance", () => {
    render(<TreatmentLandscape />);

    for (const bullet of EDUCATION_TOPICS["clotting-factor-replacement"].body) {
      expect(screen.getByText(bullet)).toBeInTheDocument();
    }

    const guidance = EDUCATION_TOPICS["prophylaxis-guidance"];
    for (const bullet of [guidance.title, ...guidance.body]) {
      expect(screen.queryByText(bullet)).not.toBeInTheDocument();
    }
  });

  it("renders the personalized-therapy prose verbatim from the data module", () => {
    render(<TreatmentLandscape />);
    for (const bullet of EDUCATION_TOPICS["personalized-therapy"].body) {
      expect(screen.getByText(bullet)).toBeInTheDocument();
    }
  });

  /**
   * The three therapeutic classes are a `NestedBullet` in the data module and
   * the design draws them indented under their lead line. Nesting them as
   * markup — rather than as four siblings — is what makes a screen reader
   * announce the sub-list; this is what catches it being flattened back.
   */
  it("nests the therapeutic classes under their lead bullet rather than flattening it", () => {
    render(<TreatmentLandscape />);
    const lead = screen.getByText(/Novel therapeutic classes:/, { selector: "li" });

    expect(
      within(lead)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual([
      "FVIII mimetic BsAbs (HA)",
      "Hemostatic rebalancing agents (HA/HB)",
      "Gene therapy (HB)",
    ]);
  });

  // Each caption is both the visible text under the `+` and the button's
  // accessible name, which `PopupButton` prefixes with "Expand".
  it.each([
    "Benefits and challenges of clotting replacement therapies",
    "Benefits and challenges of NFTs",
    "Novel Therapies for HA/HB",
  ])("renders the %s disclosure as a trigger with a visible caption", (caption) => {
    render(<TreatmentLandscape />);
    expect(screen.getByRole("button", { name: `Expand ${caption}` })).toBeInTheDocument();
    expect(screen.getByText(caption)).toBeInTheDocument();
  });

  /**
   * The three reserved figure boxes have no asset yet (CONTEXT.md §7.7). They
   * must not be `<img>` elements standing empty, and they must not be
   * focusable — a box that traps a tab stop and opens nothing is worse than a
   * gap. This is the guard on that until the assets land.
   *
   * Queried by role rather than by selector: `Popup` is mounted unconditionally
   * (its `showModal()` effect needs the element in the DOM), so the card's own ✕
   * is a fourth `<button>` in the container. Role queries honour the closed
   * dialog's `display: none` and see only what a user can reach, which is what
   * this was ever asserting.
   */
  it("reserves the figure boxes without announcing or focusing them", () => {
    render(<TreatmentLandscape />);

    expect(screen.queryAllByRole("img")).toHaveLength(0);
    // The three `+` triggers, and nothing else.
    expect(screen.queryAllByRole("button")).toHaveLength(3);
  });

  /**
   * **The box's outline is `border-[0.25rem]`, not `border-4`** — §19's rule
   * that a drawn edge is shape and has to scale with the object it edges, which
   * the numeric utility does not, being px.
   *
   * This test exists because the class reverted. The Tailwind language server
   * offers `suggestCanonicalClasses` on it, the two utilities compute the same
   * 4px at a 16px root, and accepting the suggestion silently unpins the edge
   * above the canvas. `rebalancing-agents` pinned its own box in the same pass
   * and that is what caught this one; this box had nothing asserting it.
   */
  it("outlines the figure box in rem, so it scales with the board", () => {
    const { container } = render(<TreatmentLandscape />);
    const boxes = [...container.querySelectorAll("div.border-\\[0\\.25rem\\]")];

    // The same three the test above counts by what they are not.
    expect(boxes).toHaveLength(3);
    for (const box of boxes) {
      expect(box).toHaveClass("h-41.5", "max-w-50", "border-black");
    }
  });

  /**
   * The three-step grid, asserted as class strings because jsdom computes no
   * layout — there is no width here to measure, so this is the only thing that
   * can fail.
   *
   * The three steps answer three different questions at three different
   * breakpoints, which is exactly why a dropped variant would be invisible:
   * `sm` puts the figure beside its own `+` under full-width prose, and `xl` is
   * the drawn three-track layout. **`xl` and not `lg` is the fix for §12's
   * 1024px cliff** — at `lg` the fixed tracks turned on in the same pixel the
   * gutter took 175px away, leaving the prose 204px — so a variant sliding back
   * to `lg` would silently reopen the thing this was written to close.
   */
  it("turns the figure/disclosure pairing on at sm and the drawn three tracks at xl", () => {
    const { container } = render(<TreatmentLandscape />);

    expect(container.querySelector("section > div.grid")).toHaveClass(
      "gap-y-10",
      "sm:grid-cols-[12.5rem_1fr]",
      "sm:gap-x-6",
      "xl:grid-cols-[1fr_12.5rem_18.75rem]",
      "xl:items-center",
      "xl:gap-y-5",
    );

    // The prose spanning both tracks is what puts the other two cells on the
    // row beneath rather than beside it. The whole two-up rests on this class,
    // and it is per-row, so all three are checked.
    for (const heading of screen.getAllByRole("heading", { level: 2 })) {
      expect(heading.parentElement).toHaveClass("sm:col-span-2", "xl:col-span-1");
    }
  });

  /**
   * All three rows now open a card, so `aria-haspopup` belongs on all three.
   * The assertion stays written as "exactly the triggers that open one" rather
   * than collapsing to a count of the buttons: `Row.content` is still optional,
   * and a §7.7 target that lands ahead of its artboard must go back to claiming
   * nothing rather than advertising a dialog that never appears.
   */
  it("advertises a dialog on exactly the triggers that open one", () => {
    render(<TreatmentLandscape />);
    const advertised = screen
      .getAllByRole("button")
      .filter((button) => button.getAttribute("aria-haspopup") === "dialog");

    const expected = [
      "Expand Benefits and challenges of clotting replacement therapies",
      "Expand Benefits and challenges of NFTs",
      "Expand Novel Therapies for HA/HB",
    ];

    expect(advertised).toHaveLength(expected.length);
    expected.forEach((name, index) => expect(advertised[index]).toHaveAccessibleName(name));
  });

  /**
   * The card's name is title + subtitle, not the title alone: the parenthetical
   * names which products the card is about, so a dialog announced without it
   * claims a broader scope than it has. This is the guard on `Popup`'s
   * `aria-labelledby` still pointing at both.
   */
  it("names the clotting card with its subtitle as well as its title", async () => {
    const user = userEvent.setup();
    render(<TreatmentLandscape />);

    await user.click(
      screen.getByRole("button", {
        name: "Expand Benefits and challenges of clotting replacement therapies",
      }),
    );

    expect(screen.getByRole("dialog")).toHaveAccessibleName(
      "Benefits and Challenges Associated with Clotting Factor Replacement Therapies " +
        "(Options include SHL, EHL, and UHL FVIII/FIX products)",
    );
  });

  /**
   * The card renders the data module's pair verbatim. Asserted from the data
   * rather than from literals so a copy edit lands in one place — and asserted
   * at all because the benefits list is now two items where §7.4 once had
   * three, and a re-added bullet should fail here.
   */
  it("renders the clotting benefits and challenges from the data module", async () => {
    const user = userEvent.setup();
    render(<TreatmentLandscape />);

    await user.click(
      screen.getByRole("button", {
        name: "Expand Benefits and challenges of clotting replacement therapies",
      }),
    );

    const dialog = within(screen.getByRole("dialog"));
    const { benefits, challenges } =
      EDUCATION_TOPICS["clotting-factor-replacement"].benefitsChallenges;

    expect(benefits).toHaveLength(2);
    for (const bullet of [...benefits, ...challenges]) {
      expect(dialog.getByText(bullet)).toBeInTheDocument();
    }
    for (const heading of ["Benefits", "Challenges"]) {
      expect(dialog.getByRole("heading", { level: 3, name: heading })).toBeInTheDocument();
    }
  });

  /**
   * The NFT card's title is its topic's own — the artboard reproduces it
   * exactly — and it has no subtitle, unlike §7.4's. Asserting the whole
   * accessible name is what catches the clotting card's parenthetical being
   * generalised onto a class it does not scope.
   */
  it("names the NFT card with its topic title alone", async () => {
    const user = userEvent.setup();
    render(<TreatmentLandscape />);

    await user.click(
      screen.getByRole("button", { name: "Expand Benefits and challenges of NFTs" }),
    );

    expect(screen.getByRole("dialog")).toHaveAccessibleName("Non-factor Replacement Therapies");
  });

  /** The NFT half of the same verbatim-from-data guard the clotting card gets. */
  it("renders the NFT benefits and challenges from the data module", async () => {
    const user = userEvent.setup();
    render(<TreatmentLandscape />);

    await user.click(
      screen.getByRole("button", { name: "Expand Benefits and challenges of NFTs" }),
    );

    const dialog = within(screen.getByRole("dialog"));
    const { benefits, challenges } = EDUCATION_TOPICS["nft"].benefitsChallenges;

    for (const bullet of [...benefits, ...challenges]) {
      expect(dialog.getByText(bullet)).toBeInTheDocument();
    }
    for (const heading of ["Benefits", "Challenges"]) {
      expect(dialog.getByRole("heading", { level: 3, name: heading })).toBeInTheDocument();
    }
  });

  /**
   * The §7.3 class matrix carries no title override, so its band takes the
   * trigger's caption like the other two cards do — the subject of the table,
   * not the figure number the artboard prints over it. Asserted so the pop-up
   * and the control a reader followed to get there stay the same phrase.
   */
  it("names the novel-therapy card after its trigger", async () => {
    const user = userEvent.setup();
    render(<TreatmentLandscape />);

    await user.click(screen.getByRole("button", { name: "Expand Novel Therapies for HA/HB" }));

    expect(screen.getByRole("dialog")).toHaveAccessibleName("Novel Therapies for HA/HB");
  });

  /**
   * The matrix verbatim from the data module, one row at a time — the same
   * from-the-data guard the two benefits cards get, so a copy edit lands in one
   * place. Read by row rather than by cell text alone: `within(row)` is what
   * says "Prophylaxis" appears in the row it belongs to and not merely somewhere
   * on the card, which a flat `getByText` over four identical strings could not.
   */
  it("renders every treatment-options row from the data module", async () => {
    const user = userEvent.setup();
    render(<TreatmentLandscape />);

    await user.click(screen.getByRole("button", { name: "Expand Novel Therapies for HA/HB" }));
    const dialog = within(screen.getByRole("dialog"));

    for (const { option, moa, population, indication, route } of TREATMENT_OPTIONS_MATRIX) {
      // `name` matches the row's accessible name, which the row header opens
      // with — so it also asserts the `<th scope="row">` is a header at all.
      const row = within(dialog.getByRole("row", { name: new RegExp(`^${option}`) }));

      for (const text of [moa, population, route, ...indication]) {
        expect(row.getByText(text), `${option}: ${text}`).toBeInTheDocument();
      }
    }
  });

  /**
   * The five headings are literals in the chapter — the artboard's casing is
   * uneven and "Route of Administration" is not `route` under any
   * transformation — so this is what catches them being derived from the row
   * type and quietly regularised.
   */
  it("heads the treatment-options table with the artboard's five column names", async () => {
    const user = userEvent.setup();
    render(<TreatmentLandscape />);

    await user.click(screen.getByRole("button", { name: "Expand Novel Therapies for HA/HB" }));

    expect(
      within(screen.getByRole("dialog"))
        .getAllByRole("columnheader")
        .map((cell) => cell.textContent),
    ).toEqual([
      "Treatment Options",
      "Mechanism of Action",
      "Population",
      "Indication",
      "Route of Administration",
    ]);
  });

  /**
   * The table scrolls sideways rather than reflowing — `SeverityTable`'s answer,
   * which open item 27 calls a precedent. Three separable things can break it,
   * so all three are asserted:
   *
   * - the wrapper is a plain `div`, because `overflow-x-auto` on a table box
   *   does nothing at all — a table is not a scroll container;
   * - the floor lives on the `<table>`, not on the wrapper, or the wrapper just
   *   shrinks with the card and never scrolls;
   * - the footnote list stays **outside** the wrapper. It is prose that wraps
   *   fine, and dragging it sideways with the grid would be a scroll region
   *   doing a job nobody asked for.
   */
  it("scrolls the treatment-options grid sideways without taking the footnotes with it", async () => {
    const user = userEvent.setup();
    render(<TreatmentLandscape />);

    await user.click(screen.getByRole("button", { name: "Expand Novel Therapies for HA/HB" }));
    const dialog = within(screen.getByRole("dialog"));
    const table = dialog.getByRole("table");

    expect(table).toHaveClass("min-w-165");
    expect(table.parentElement?.tagName).toBe("DIV");
    expect(table.parentElement).toHaveClass("overflow-x-auto");

    // Footnote (a)'s own list item, reached from the marker the rows point at.
    const footnotes = dialog.getByText("a.", { exact: false, selector: "li" }).closest("ul");
    expect(footnotes).not.toBeNull();
    expect(table.parentElement?.contains(footnotes!)).toBe(false);
  });

  /**
   * Every marker the table draws resolves to a footnote, and every footnote is
   * pointed at — the pairing the chapter derives rather than writes out. Footnote
   * b's two branches are asserted as a nested list because that is the shape the
   * data module holds them in: flattened to siblings, a screen reader reads four
   * footnotes where the export draws three.
   */
  it("resolves each footnote marker the treatment-options table draws", async () => {
    const user = userEvent.setup();
    render(<TreatmentLandscape />);

    await user.click(screen.getByRole("button", { name: "Expand Novel Therapies for HA/HB" }));
    const dialog = within(screen.getByRole("dialog"));

    for (const key of ["a", "b", "c"] as FootnoteKey[]) {
      const note = TREATMENT_OPTIONS_FOOTNOTES[key];
      const text = typeof note === "string" ? note : note.text;
      const item = dialog.getByText(`${key}.`, { exact: false, selector: "li" });

      expect(item).toHaveTextContent(text);
      if (typeof note !== "string") {
        expect(
          within(item)
            .getAllByRole("listitem")
            .map((li) => li.textContent),
        ).toEqual(note.children);
      }
    }
  });

  /**
   * Two rows now open a card, which is what makes the chapter's single
   * `openIndex` load-bearing rather than a tidier spelling of two booleans:
   * clicking the second `+` must replace the first card, not stack a second
   * dialog or leave the first trigger showing ✕.
   */
  it("swaps cards rather than opening two, when the other trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<TreatmentLandscape />);

    const clotting = "Benefits and challenges of clotting replacement therapies";
    await user.click(screen.getByRole("button", { name: `Expand ${clotting}` }));
    await user.click(
      screen.getByRole("button", { name: "Expand Benefits and challenges of NFTs" }),
    );

    // One dialog, and it is the NFT one.
    expect(screen.getAllByRole("dialog")).toHaveLength(1);
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Non-factor Replacement Therapies");
    // The trigger left behind agrees: it is back to offering "Expand".
    expect(screen.getByRole("button", { name: `Expand ${clotting}` })).toBeInTheDocument();
  });

  /**
   * The drop is ornament, unlike every other §7 figure — so it must stay out of
   * the accessibility tree even once a card that holds it is open. Both cards
   * draw the same asset, so both are asserted.
   */
  it.each([
    "Benefits and challenges of clotting replacement therapies",
    "Benefits and challenges of NFTs",
  ])("keeps the blood drop decorative in the %s card", async (caption) => {
    const user = userEvent.setup();
    render(<TreatmentLandscape />);

    await user.click(screen.getByRole("button", { name: `Expand ${caption}` }));

    expect(screen.queryAllByRole("img")).toHaveLength(0);
  });
});
