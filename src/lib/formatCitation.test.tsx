import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { formatCitation } from "./formatCitation";

/** Rendered rather than inspected as nodes — the markup a reader gets is the assertion. */
function renderCitation(text: string) {
  render(<p data-testid="out">{formatCitation(text)}</p>);
  return screen.getByTestId("out");
}

describe("formatCitation", () => {
  it("superscripts a registered-trademark mark in place", () => {
    const out = renderCitation("HEMLIBRA® PI. July 2025.");

    expect(out.querySelector("sup")).toHaveTextContent("®");
    expect(out).toHaveTextContent("HEMLIBRA® PI. July 2025.");
  });

  it("superscripts every mark, not just the first", () => {
    const out = renderCitation("Alhemo® and HEMGENIX® and QFITLIA®");

    expect(out.querySelectorAll("sup")).toHaveLength(3);
  });

  it("links a URL to itself", () => {
    const out = renderCitation("HEMLIBRA® PI. https://www.gene.com/download/pdf/x.pdf.");

    const link = out.querySelector("a")!;
    expect(link).toHaveAttribute("href", "https://www.gene.com/download/pdf/x.pdf");
    expect(link).toHaveTextContent("https://www.gene.com/download/pdf/x.pdf");
  });

  /**
   * The whole reason the URL run is split twice. The sentence period is painted
   * but must not reach the `href`, or every link in the list 404s.
   */
  it.each([
    ["https://example.com/a.pdf.", "https://example.com/a.pdf"],
    ["https://example.com/a/.", "https://example.com/a/"],
    ["https://example.com/a..", "https://example.com/a"],
    ["https://example.com/a,", "https://example.com/a"],
  ])("keeps trailing punctuation out of the href in %j", (text, href) => {
    const out = renderCitation(text);

    expect(out.querySelector("a")).toHaveAttribute("href", href);
    expect(out).toHaveTextContent(text);
  });

  it("opens links in a new tab without leaking the referrer", () => {
    const out = renderCitation("See https://example.com/a.");

    const link = out.querySelector("a")!;
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noreferrer");
  });

  it("italicises a marked journal abbreviation and keeps its delimiters off the page", () => {
    const out = renderCitation("Castaman G, Matino D. _Haematologica._ 2019;104:1702-1709.");

    expect(out.querySelector("em")).toHaveTextContent("Haematologica.");
    expect(out).toHaveTextContent("Castaman G, Matino D. Haematologica. 2019;104:1702-1709.");
    expect(out.textContent).not.toContain("_");
  });

  /** `r15` alone: `[PDF-V]` leaves the terminal period upright, outside the run. */
  it("italicises a run that stops short of the sentence period", () => {
    const out = renderCitation("Lauritzen B, et al. _J Thromb Haemost_. 2022;00:1–13.");

    expect(out.querySelector("em")).toHaveTextContent("J Thromb Haemost");
    expect(out.querySelector("em")).not.toHaveTextContent("J Thromb Haemost.");
  });

  /**
   * Why the URL arm sits first in the alternation. `r8`'s HEMLIBRA URL carries
   * `gad_source` and `gad_campaignid` — two underscores that pair — so an
   * emphasis-first alternation would italicise the middle of the query string
   * and break the `href`. This is the regression that ordering prevents.
   */
  it("does not treat paired underscores inside a URL as emphasis", () => {
    const url =
      "https://www.hemlibra-hcp.com/about/x.html?c=hea-18a&gad_source=1&gad_campaignid=222&gbraid=0AA";
    const out = renderCitation(`How HEMLIBRA Works. ${url}.`);

    expect(out.querySelector("a")).toHaveAttribute("href", url);
    expect(out.querySelector("em")).toBeNull();
  });

  /** A journal *and* a link in one entry — the two arms must not interfere. */
  it("handles a marked journal and a URL in the same citation", () => {
    const out = renderCitation("Lim MY, et al. _J Thromb Haemost._ https://example.com/a_b_c.pdf.");

    expect(out.querySelector("em")).toHaveTextContent("J Thromb Haemost.");
    expect(out.querySelector("a")).toHaveAttribute("href", "https://example.com/a_b_c.pdf");
  });

  /** Most of the list has no URL and no mark; those entries must come through untouched. */
  it("leaves a plain citation completely alone", () => {
    const plain = "Castaman G, Matino D. Haematologica. 2019;104:1702-1709.";
    const out = renderCitation(plain);

    expect(out).toHaveTextContent(plain);
    expect(out.querySelector("a")).toBeNull();
    expect(out.querySelector("sup")).toBeNull();
    expect(out.querySelector("em")).toBeNull();
  });

  /** The split is lossless — no character of the source is dropped. */
  it("preserves the whole string across a mark and a URL", () => {
    const text = "Alhemo® (concizumab-mtci) PI. July 2025. https://example.com/label.pdf.";
    const out = renderCitation(text);

    expect(out).toHaveTextContent(text);
  });

  /**
   * A bare `.` is not a URL and a lone `®` is not a citation; neither may throw.
   * An unpaired `_` falls out of the alternation and stays text, which is what
   * makes pointing this helper at unmarked strings free (ADR 0004).
   */
  it.each(["", "®", "http not a url", "www.example.com", "drugsatfda_docs"])(
    "passes %j through as text",
    (stray) => {
      const out = renderCitation(stray);

      expect(out.querySelector("a")).toBeNull();
      expect(out.querySelector("em")).toBeNull();
      if (stray) expect(out).toHaveTextContent(stray);
    },
  );
});
