import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  CLOTTING_CASCADE_CONCLUSION,
  CLOTTING_CASCADE_NOTES,
  SEVERITY_TABLE,
  topicById,
} from "../../data/education";
import DiseaseBackground from "./DiseaseBackground";

/**
 * The chapter mounts two dialogs — the band's, and the cascade figure's — and
 * both stay in the DOM whether or not they are open, so a bare
 * `getByRole("dialog")` is ambiguous. Only one can ever carry `open`, because
 * `showModal()` makes everything behind it inert.
 */
const openDialog = () =>
  screen.getAllByRole("dialog", { hidden: true }).find((d) => d.hasAttribute("open"));

describe("disease-background chapter", () => {
  it("renders the chapter title in title case, not the uppercase it displays", () => {
    render(<DiseaseBackground />);
    // `uppercase` is a CSS transform, so the accessible name is unaffected —
    // this asserts the copy was not shouted in the markup.
    expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(
      "Hemophilia Disease Background",
    );
  });

  // The component reads these by id with a non-null assertion; if a rename ever
  // lands in the data module, this fails here rather than as a render crash.
  it.each(["disease-mechanism", "diagnosis"])("resolves the %s topic it composes from", (id) => {
    expect(topicById(id)).toBeDefined();
  });

  it("renders both section headings from the data module's own titles", () => {
    render(<DiseaseBackground />);
    expect(
      screen.getByRole("heading", { level: 2, name: topicById("disease-mechanism")!.title }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Diagnosis:" })).toBeInTheDocument();
  });

  it("nests the HA/HB pair under its lead bullet rather than flattening it", () => {
    render(<DiseaseBackground />);
    // "X‑linked" — the data holds a non-breaking hyphen, so an ASCII "-"
    // here would not match.
    const lead = screen.getByText(/X‑linked recessive inheritance/, { selector: "li" });
    const nested = within(lead).getAllByRole("listitem");
    expect(nested.map((li) => li.textContent)).toEqual([
      "HA: FVIII deficiency due to F8 gene mutation",
      "HB: FIX deficiency due to F9 gene mutation",
    ]);
  });

  it("renders the diagnosis prose verbatim from the data module", () => {
    render(<DiseaseBackground />);
    for (const bullet of topicById("diagnosis")!.body) {
      expect(screen.getByText(bullet as string)).toBeInTheDocument();
    }
  });

  /**
   * The cascade's annotations and conclusion were image-borne (CONTEXT.md §7.7)
   * and are now markup, so this asserts they are reachable as *text* — not
   * buried in an `alt`, where they could not be selected, translated or
   * reflowed. The thumbnail stays decorative: an image button takes its name
   * from `alt`, and a figure description makes a hostile control name.
   */
  it("renders the cascade's notes and conclusion as text, not as alt", async () => {
    render(<DiseaseBackground />);
    expect(screen.queryAllByRole("img")).toHaveLength(0);

    await userEvent.click(
      screen.getByRole("button", {
        name: "Expand Initiation and Amplification of the Clotting Cascade",
      }),
    );

    for (const note of CLOTTING_CASCADE_NOTES) {
      expect(screen.getByText(note)).toBeInTheDocument();
    }
    expect(screen.getByText(CLOTTING_CASCADE_CONCLUSION)).toBeInTheDocument();

    // The diagram is still a picture, and still the only route to the cascade.
    expect(screen.getByRole("img")).toHaveAccessibleName(/vascular injury exposes tissue factor/i);
  });

  // The thumbnail keeps the pop-up's crimson title band, so the card's heading
  // and the picture behind the trigger say the same thing — but only one of them
  // is text. This is what catches the two drifting apart.
  it("opens the cascade figure in a card titled with the figure's own heading", async () => {
    render(<DiseaseBackground />);
    const title = "Initiation and Amplification of the Clotting Cascade";

    await userEvent.click(screen.getByRole("button", { name: `Expand ${title}` }));

    expect(openDialog()).toHaveAccessibleName(title);
  });

  it("renders the three §7.7 disclosures as triggers with visible captions", () => {
    render(<DiseaseBackground />);
    const captions = [
      "Diagnostic algorithm for HA/HB",
      "Disease severity and bleeding in HA/HB",
      "Bleeding manifestations in HA/HB",
    ];
    for (const caption of captions) {
      expect(screen.getByRole("button", { name: `Expand ${caption}` })).toBeInTheDocument();
      expect(screen.getByText(caption)).toBeInTheDocument();
    }
  });

  // The caption names the target from the §7.7 click-through index; the card
  // wears the figure's own title. Every pair differs — the last only in
  // capitalisation, which `toHaveAccessibleName` still tells apart — so this is
  // what catches a card that fell back to its caption because the `title` was
  // dropped.
  it.each([
    ["Diagnostic algorithm for HA/HB", "Diagnostic approach for Hemophilia A/B"],
    ["Disease severity and bleeding in HA/HB", "Hemophilia Severity Based on Factor VIII/IX Level"],
    ["Bleeding manifestations in HA/HB", "Bleeding Manifestations in HA/HB"],
  ])("titles the %s pop-up with its own heading, not its caption", async (caption, title) => {
    render(<DiseaseBackground />);
    await userEvent.click(screen.getByRole("button", { name: `Expand ${caption}` }));

    expect(openDialog()).toHaveAccessibleName(title);
  });

  describe("the severity pop-up", () => {
    const open = () =>
      userEvent.click(
        screen.getByRole("button", { name: "Expand Disease severity and bleeding in HA/HB" }),
      );

    // A table, not a grid: this is what asserts the column association a
    // presentational layout would throw away.
    it("keeps each severity's factor level and manifestations in its own column", async () => {
      render(<DiseaseBackground />);
      await open();

      const columns = within(screen.getByRole("table")).getAllByRole("columnheader");
      expect(columns.map((th) => th.textContent)).toEqual([
        "Mild",
        "Moderate",
        "Severe",
        "Bleeding Manifestation Based on Severity",
      ]);

      // The factor-level row comes first, then one bullet cell per severity.
      const cells = screen.getAllByRole("cell");
      SEVERITY_TABLE.forEach((row, index) => {
        expect(cells[index]).toHaveTextContent(row.factorLevel);
        const bullets = within(cells[SEVERITY_TABLE.length + index]).getAllByRole("listitem");
        expect(bullets.map((li) => li.textContent)).toEqual([...row.manifestations]);
      });
    });
  });
});
