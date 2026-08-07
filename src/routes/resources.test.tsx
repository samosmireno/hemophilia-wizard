import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { RESOURCES } from "../data/references";
import Resources from "./Resources";

/** `Resources` is static — no router, no state. Prev/Next belong to `AppSidebar`. */
function renderResources() {
  render(<Resources />);
  return [...document.querySelectorAll("ul")];
}

/** See `references.test.tsx` — delimiters come off, URL underscores stay on. */
function painted(text: string): string {
  return text
    .split(/(https?:\/\/\S+|_[^_]+_)/)
    .map((part) => (/^_[^_]+_$/.test(part) ? part.slice(1, -1) : part))
    .join("");
}

describe("resources page", () => {
  it("heads the page and names its own section", () => {
    renderResources();

    expect(screen.getByRole("heading", { level: 1, name: "Resources" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Resources" })).toBeInTheDocument();
  });

  /** Three categories, three lists — not one list with headings floating in it. */
  it("renders the three categories in source order, each with its own list", () => {
    const lists = renderResources();

    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      "Clinical guidelines and recommendations",
      "Review articles",
      "Tools for clinical practice",
    ]);
    expect(lists).toHaveLength(3);
  });

  /**
   * The source draws its category labels with a run-in colon. The heading does
   * not carry it — vertical space does that job (docs/styling.md §25).
   */
  it("drops the source's run-in colon from the headings", () => {
    renderResources();

    for (const heading of screen.getAllByRole("heading", { level: 2 })) {
      expect(heading.textContent).not.toMatch(/:$/);
    }
  });

  it("renders all 18 items in source order, 5 / 8 / 5 across the categories", () => {
    const lists = renderResources();

    expect(lists.map((list) => list.querySelectorAll("li").length)).toEqual([5, 8, 5]);

    const items = lists.flatMap((list) =>
      [...list.querySelectorAll("li")].map((li) => li.textContent),
    );
    expect(items).toHaveLength(18);
    expect(items).toEqual(
      RESOURCES.flatMap(({ items: entries }) =>
        entries.map(({ text, url }) => painted(url ? `${text} ${url}.` : text)),
      ),
    );
  });

  /** Bulleted, as the board draws it and as `/references` now does (ADR 0009). */
  it("is bulleted, and unnumbered", () => {
    const lists = renderResources();

    expect(document.querySelector("ol")).toBeNull();
    for (const list of lists) expect(list.className).toContain("list-disc");
  });

  /**
   * The URL is stored beside the citation but drawn inside it, so the page puts
   * it back — painted as itself, with the sentence period outside the `href`.
   */
  it("links all 5 URLs inline, each to itself, with the period left outside", () => {
    const lists = renderResources();

    const links = lists.flatMap((list) => [...list.querySelectorAll("a")]);
    expect(links).toHaveLength(5);
    for (const link of links) {
      const href = link.getAttribute("href")!;
      expect(href).toMatch(/^https:\/\//);
      expect(href).not.toMatch(/[.,]$/);
      expect(link).toHaveTextContent(href);
      expect(link.parentElement?.textContent).toContain(`${href}.`);
    }
  });

  /**
   * 14 of the 18 name a journal, and those are exactly the 14 the board sets in
   * NotoSans-Italic. Mehta's run is the StatPearls chapter title — the one entry
   * where the italic is not a journal, and the reason a term list could not have
   * derived this (ADR 0004's own argument, with "Hemophilia" as the collision).
   */
  it("italicises the journal in all 14 entries that name one", () => {
    const lists = renderResources();

    const emphasised = lists.flatMap((list) =>
      [...list.querySelectorAll("em")].map((em) => em.textContent),
    );
    expect(emphasised).toEqual([
      "Haemophilia.",
      "J Thromb Haemost.",
      "J Thromb Haemost.",
      "Res Pract Thromb Haemost.",
      "Hemophilia.",
      "Expert Rev Clin Pharmacol.",
      "J Thromb Haemost.",
      "J Blood Med.",
      "Res Pract Thromb Haemost.",
      "Haemophilia.",
      "Hemasphere.",
      "Haemophilia.",
      "Haemophilia.",
      "J Clin Med.",
    ]);
  });

  /** The four with no journal: MASAC, AJMC, and the two WFH tool entries. */
  it("leaves the four entries that name no journal upright", () => {
    const lists = renderResources();

    const upright = lists
      .flatMap((list) => [...list.querySelectorAll("li")])
      .filter((li) => !li.querySelector("em"));
    expect(upright).toHaveLength(4);
  });

  /**
   * The three defects repaired under `docs/adr/0008-repair-bibliographic-defects.md`,
   * pinned against the forms `[PDF-V]` draws. Two are the Duncan entry, whose
   * volume 16 of *Haemophilia* is 2010 and whose title reads "prophylactic"; the
   * third is a stray `3` in the WFH Workbook entry where a sentence break
   * belongs. `RESOURCES` is otherwise verbatim, which is exactly the condition
   * under which a re-transcription would revert all three and look correct.
   */
  it.each([
    // Volume and pages alone — the journal between them now carries ADR 0004
    // markup, and this pin is about the year, not about the emphasis.
    ["Duncan volume year", "2010;16:247-255.", "2020;16:247-255."],
    ["Duncan title", "adherence to prophylactic regimens", "adherence to prophylaxis regimens"],
    ["WFH Workbook stray glyph", "March 2025. Last reviewed:", "March 2025 3 Last reviewed:"],
  ])("ships the %s repaired, not as the source drew it", (_label, repaired, sourceForm) => {
    const all = RESOURCES.flatMap(({ items }) => items.map(({ text }) => text)).join("\n");

    expect(all).toContain(repaired);
    expect(all).not.toContain(sourceForm);
  });

  /** The closing "URLs accessed July 14, 2026." line ships on neither page. */
  it("does not carry the source's accessed-date line", () => {
    renderResources();

    expect(document.body.textContent).not.toContain("URLs accessed");
  });
});
