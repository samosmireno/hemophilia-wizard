import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { formatInline } from "./formatInline";

/**
 * Rendered rather than inspected as nodes: what matters is the markup a reader
 * gets, and `<em>`/`<strong>` are the assertion.
 */
function renderInline(text: string) {
  render(<p data-testid="out">{formatInline(text)}</p>);
  return screen.getByTestId("out");
}

describe("formatInline", () => {
  it("renders _text_ as em and **text** as strong", () => {
    const out = renderInline("prophylaxis of HB _with_ inhibitors and **more**");

    expect(out.querySelector("em")).toHaveTextContent("with");
    expect(out.querySelector("strong")).toHaveTextContent("more");
    expect(out).toHaveTextContent("prophylaxis of HB with inhibitors and more");
  });

  it("leaves an unmarked string completely alone", () => {
    const plain = "Click on the boxes below to learn more about each type of therapy";
    const out = renderInline(plain);

    expect(out).toHaveTextContent(plain);
    expect(out.querySelector("em")).toBeNull();
    expect(out.querySelector("strong")).toBeNull();
  });

  /**
   * The property that makes it safe to point this at strings that were never
   * marked up — which `/wizard/scenario` does for its class bullets and caveat.
   */
  it.each(["_abc", "abc_", "a_b", "**abc", "2 * 3 * 4"])(
    "passes the unpaired delimiter in %j through as text, uncut",
    (stray) => {
      const out = renderInline(stray);

      expect(out).toHaveTextContent(stray, { normalizeWhitespace: false });
      expect(out.querySelector("em")).toBeNull();
      expect(out.querySelector("strong")).toBeNull();
    },
  );

  /** One run must not swallow the next — the reason both alternatives exclude
      their own delimiter. */
  it("treats two emphasised runs as two runs", () => {
    const out = renderInline("_first_ and _second_");

    expect(out.querySelectorAll("em")).toHaveLength(2);
    expect(out).toHaveTextContent("first and second");
  });

  /** Documented limit, asserted so it cannot change silently. */
  it("does not nest — inner delimiters stay literal", () => {
    const out = renderInline("**_x_**");

    expect(out.querySelector("strong")).toHaveTextContent("_x_");
    expect(out.querySelector("em")).toBeNull();
  });

  /** The split is lossless: strip the delimiters and the text is the source. */
  it("preserves the whole string, delimiters aside", () => {
    const out = renderInline("a _b_ c **d** e");

    expect(out).toHaveTextContent("a b c d e");
  });
});
