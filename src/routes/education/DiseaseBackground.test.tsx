import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { topicById } from "../../data/education";
import DiseaseBackground from "./DiseaseBackground";

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

  // All of this figure's content is image-borne (CONTEXT.md §7.7) — it exists
  // in no text layer — so the alt text is the only route to it.
  it("gives the cascade figure alt text that carries what the image says", () => {
    render(<DiseaseBackground />);
    const figure = screen.getByRole("img");
    expect(figure).toHaveAccessibleName(/initiation and amplification of the clotting cascade/i);
    expect(figure).toHaveAccessibleName(/hemophilia reduces thrombin generation/i);
  });

  it("renders the three §7.7 disclosures as triggers with visible captions", () => {
    render(<DiseaseBackground />);
    const captions = [
      "Diagnostic algorithm for HA/HB",
      "Disease severity and bleeding in HA/HB",
      "Typical bleeding manifestations in males and females with HA/HB",
    ];
    for (const caption of captions) {
      expect(screen.getByRole("button", { name: `Expand ${caption}` })).toBeInTheDocument();
      expect(screen.getByText(caption)).toBeInTheDocument();
    }
  });
});
