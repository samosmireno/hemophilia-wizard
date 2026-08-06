import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GLOSSARY } from "../data/glossary";
import Glossary from "./Glossary";

/** `Glossary` is static — no router, no state. */
function renderGlossary() {
  render(<Glossary />);
  return document.querySelector("dl")!;
}

describe("glossary page", () => {
  it("heads the page and names its own section", () => {
    renderGlossary();

    expect(screen.getByRole("heading", { level: 1, name: "Glossary" })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Glossary" })).toBeInTheDocument();
  });

  it("renders all 12 terms in source order", () => {
    const list = renderGlossary();

    const terms = [...list.querySelectorAll("dt")].map((dt) => dt.textContent);
    expect(terms).toEqual(GLOSSARY.map((entry) => entry.term));
  });

  it("pairs each term with its definition", () => {
    const list = renderGlossary();

    const pairs = [...list.children].reduce<string[][]>((acc, node, index) => {
      if (index % 2 === 0) acc.push([node.textContent ?? ""]);
      else acc[acc.length - 1].push(node.textContent ?? "");
      return acc;
    }, []);
    expect(pairs).toEqual(GLOSSARY.map((entry) => [entry.term, entry.definition]));
  });

  /**
   * Same reason as `/acronyms`: the case is content. "Factor VIIIa-mimetic"
   * uppercased reads `VIIIA`, which names nothing. jsdom cannot compute
   * `text-transform`, so the class is what guards against a styling sweep
   * reaching this page.
   */
  it("never uppercases a term", () => {
    const list = renderGlossary();

    const mimetic = GLOSSARY.find((entry) => entry.term.includes("VIIIa"));
    expect(mimetic).toBeDefined();

    for (const dt of list.querySelectorAll("dt")) {
      expect(dt.className).not.toMatch(/\buppercase\b/);
    }
    expect(screen.getByText(mimetic!.term)).toBeInTheDocument();
  });
});
