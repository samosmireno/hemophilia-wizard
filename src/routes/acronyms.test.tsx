import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ACRONYMS } from "../data/glossary";
import Acronyms from "./Acronyms";

/** `Acronyms` is static — no router, no state. */
function renderAcronyms() {
  render(<Acronyms />);
  return document.querySelector("dl")!;
}

describe("acronyms page", () => {
  it("heads the page and names its own section", () => {
    renderAcronyms();

    expect(screen.getByRole("heading", { level: 1, name: "Acronyms" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Acronyms" })).toBeInTheDocument();
  });

  it("renders all 41 terms in source order", () => {
    const list = renderAcronyms();

    const terms = [...list.querySelectorAll("dt")].map((dt) => dt.textContent);
    expect(terms).toEqual(ACRONYMS.map((entry) => entry.abbr));
  });

  it("pairs each term with its expansion", () => {
    const list = renderAcronyms();

    const pairs = [...list.children].reduce<string[][]>((acc, node, index) => {
      if (index % 2 === 0) acc.push([node.textContent ?? ""]);
      else acc[acc.length - 1].push(node.textContent ?? "");
      return acc;
    }, []);
    expect(pairs).toEqual(ACRONYMS.map((entry) => [entry.abbr, entry.full]));
  });

  /**
   * The case is content, not a heading style — `aPCC` uppercased names a
   * different thing. jsdom cannot compute `text-transform`, so the class is
   * what guards against a styling sweep reaching this page.
   */
  it("never uppercases a term", () => {
    const list = renderAcronyms();

    const mixed = ACRONYMS.filter((entry) => entry.abbr !== entry.abbr.toUpperCase());
    expect(mixed.length).toBeGreaterThan(0);

    for (const dt of list.querySelectorAll("dt")) {
      expect(dt.className).not.toMatch(/\buppercase\b/);
    }
    for (const entry of mixed) {
      expect(screen.getByText(entry.abbr)).toBeInTheDocument();
    }
  });
});
