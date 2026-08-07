import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { REFERENCES } from "../data/references";
import References from "./References";

/** `References` is static — no router, no state. */
function renderReferences() {
  render(<References />);
  return document.querySelector("ul")!;
}

/**
 * What the page paints, given a source string that carries ADR 0004 markup: the
 * emphasis delimiters are markup rather than characters of the citation, so they
 * come off — but **only outside a URL**. Six of these URLs contain underscores
 * of their own (`drugsatfda_docs`, `gad_source`), and those are painted. The
 * alternation is spelled out again here rather than imported, so that this
 * stays an independent statement of the rule and not an echo of the parser.
 */
function painted(text: string): string {
  return text
    .split(/(https?:\/\/\S+|_[^_]+_)/)
    .map((part) => (/^_[^_]+_$/.test(part) ? part.slice(1, -1) : part))
    .join("");
}

describe("references page", () => {
  it("heads the page and names its own section", () => {
    renderReferences();

    expect(screen.getByRole("heading", { level: 1, name: "References" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "References" })).toBeInTheDocument();
  });

  it("renders all 29 citations in source order", () => {
    const list = renderReferences();

    const items = [...list.querySelectorAll("li")].map((li) => li.textContent);
    expect(items).toHaveLength(29);
    expect(items).toEqual(REFERENCES.map((entry) => painted(entry.text)));
  });

  /**
   * The source draws discs, not numbers — nothing in the app cites a reference,
   * so an `<ol>` would be a marker pointing at nothing (CONTEXT.md §9), but the
   * bullet is what the board actually draws (ADR 0009). This page shipped
   * briefly with a hanging indent and no marker at all.
   */
  it("is a bulleted unordered list — no numbering", () => {
    const list = renderReferences();

    expect(document.querySelector("ol")).toBeNull();
    expect(screen.getByRole("list").tagName).toBe("UL");
    expect(list.className).toContain("list-disc");
  });

  /**
   * 15 of the 29 name a journal, and those are exactly the 15 the board sets in
   * NotoSans-Italic; PIs, websites and congress abstracts are upright.
   */
  it("italicises the journal abbreviation in all 15 entries that name one", () => {
    const list = renderReferences();

    expect([...list.querySelectorAll("em")].map((em) => em.textContent)).toEqual([
      "Haematologica.",
      "Haemophilia.",
      "Semin Thromb Hemost.",
      "J Thromb Haemost.",
      // `r15` — the source stops the run short of the sentence period.
      "J Thromb Haemost",
      "J Thromb Haemost.",
      "Res Pract Thromb Haemost.",
      "Res Pract Thromb Haemost.",
      "N Engl J Med.",
      "Res Pract Thromb Haemost.",
      "J Thromb Haemost.",
      "J Thromb Haemost.",
      "J Thromb Haemost.",
      "Haematologica.",
      "N Engl J Med.",
    ]);
  });

  /**
   * The delimiters are markup and must not reach the page — but the underscores
   * inside six URLs are characters of those URLs and must survive. This is the
   * pair of claims that a naive `replaceAll("_", "")` would satisfy only half of.
   */
  it("paints no emphasis delimiter, and every underscore that belongs to a URL", () => {
    const list = renderReferences();

    for (const em of list.querySelectorAll("em")) {
      expect(em.textContent).not.toContain("_");
    }
    for (const link of list.querySelectorAll("a")) {
      expect(link.getAttribute("href")).toBe(link.textContent);
    }
    expect(list.textContent).toContain("drugsatfda_docs");
    expect(list.textContent).toContain("gad_source");
  });

  it("superscripts all 7 registered-trademark marks", () => {
    const list = renderReferences();

    const marks = [...list.querySelectorAll("sup")].map((sup) => sup.textContent);
    expect(marks).toEqual(Array(7).fill("®"));
  });

  it("links all 11 URLs, each to itself, with no trailing punctuation in the href", () => {
    const list = renderReferences();

    const links = [...list.querySelectorAll("a")];
    expect(links).toHaveLength(11);
    for (const link of links) {
      const href = link.getAttribute("href")!;
      expect(href).toMatch(/^https:\/\//);
      expect(href).not.toMatch(/[.,]$/);
      expect(link).toHaveTextContent(href);
    }
  });

  /**
   * The five defects repaired under `docs/adr/0008-repair-bibliographic-defects.md`.
   * Pinned against the source forms so a re-transcription from `[PDF-V]` cannot
   * quietly undo them — the whole list is otherwise verbatim, which is exactly
   * the condition under which a well-meaning revert looks correct.
   */
  it.each([
    ["r2", "https://www.fda.gov/media/165594/download.", "download.."],
    ["r12", "healthy male participants.", "healthy male participant."],
    ["r14", "2017;117:1348-1357.", "2017:117:1348-1357."],
    ["r16", "2026;24:2341-2354.", "2026;24:2341-2354 "],
    ["r21", "Oldenburg J, et al.", "Oldenberg J, et al."],
  ])("ships %s repaired, not as the source drew it", (id, repaired, sourceForm) => {
    const entry = REFERENCES.find((r) => r.id === id);

    expect(entry?.text).toContain(repaired);
    expect(entry?.text).not.toContain(sourceForm);
  });

  /** `r16`'s doubled space after "et al." went with the terminal period. */
  it("carries no doubled spaces", () => {
    for (const { id, text } of REFERENCES) {
      expect(text, `${id} has a doubled space`).not.toMatch(/ {2}/);
    }
  });
});
