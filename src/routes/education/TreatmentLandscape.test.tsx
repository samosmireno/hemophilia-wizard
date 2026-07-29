import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { topicById } from "../../data/education";
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

  // The component reads these by id with a non-null assertion; if a rename ever
  // lands in the data module, this fails here rather than as a render crash.
  it.each(["evolving-landscape", "clotting-factor-replacement", "nft", "personalized-therapy"])(
    "resolves the %s topic it composes from",
    (id) => {
      expect(topicById(id)).toBeDefined();
    },
  );

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
   * The clotting block shows the topic's LEAD bullet only — bullets 2–4 are
   * §7.4 prophylaxis guidance belonging to a different chapter. This asserts
   * both halves: the one that shows, and the three that must not.
   */
  it("shows only the lead clotting-factor bullet, not the prophylaxis guidance", () => {
    render(<TreatmentLandscape />);
    const [lead, ...elsewhere] = topicById("clotting-factor-replacement")!.body;

    expect(screen.getByText(lead as string)).toBeInTheDocument();
    for (const bullet of elsewhere) {
      expect(screen.queryByText(bullet as string)).not.toBeInTheDocument();
    }
  });

  it("renders the personalized-therapy prose verbatim from the data module", () => {
    render(<TreatmentLandscape />);
    for (const bullet of topicById("personalized-therapy")!.body) {
      expect(screen.getByText(bullet as string)).toBeInTheDocument();
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
      "FVIIIa-mimetic BsAbs (HA)",
      "Hemostatic rebalancing agents (HA/HB)",
      "Gene therapy (HB)",
    ]);
  });

  // Each caption is both the visible text under the `+` and the button's
  // accessible name, which `PopupButton` prefixes with "Expand".
  it.each([
    "Benefits and challenges of clotting replacement therapies",
    "Benefits and challenges of NFTs",
    "Novel therapy classes for HA/HB",
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
   */
  it("reserves the figure boxes without announcing or focusing them", () => {
    const { container } = render(<TreatmentLandscape />);

    expect(screen.queryAllByRole("img")).toHaveLength(0);
    // The three `+` triggers, and nothing else.
    expect(container.querySelectorAll("button, [tabindex]")).toHaveLength(3);
  });
});
