import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { EDUCATION_TOPICS } from "../../data/education";
import ProphylaxisGuidance from "./ProphylaxisGuidance";

const CHAPTER = EDUCATION_TOPICS["prophylaxis-guidance"];

/** Read the way the chapter reads them, so the copy is asserted from one source. */
const HEADING = CHAPTER.title;
const BODY = CHAPTER.body;

describe("prophylaxis-guidance chapter", () => {
  /**
   * The split with `treatment-landscape` is the whole filing decision behind this
   * chapter. It used to be positional — one `clotting-factor-replacement` topic
   * held all four sentences, that page took `body.slice(0, 1)`, and this one took
   * bullet 2 as its `<h1>` and bullets 3–4 as its list. The topic split (2026-08-07)
   * makes the boundary a name instead of an index, so an insertion in the source
   * order can no longer promote the wrong sentence to a chapter title.
   *
   * Still asserted as copy: the split moved these strings between topics, and
   * nothing else would notice them coming back.
   */
  it("owns its heading and both bullets as a topic of its own", () => {
    expect(HEADING).toBe(
      "Prophylactic treatment is recommended over episodic treatment to control bleeding in patients with moderately severe/severe hemophilia",
    );
    expect(BODY).toEqual([
      "Prophylaxis greatly reduces bleeding risk with minimal toxicity",
      "Recommendations for prophylactic treatment may apply even for FVIII plasma levels ≥2 IU/dL",
    ]);
    // The sentences that stayed behind, so the two halves cannot both drift.
    expect(EDUCATION_TOPICS["clotting-factor-replacement"].body).toHaveLength(1);
  });

  /**
   * `uppercase` is a CSS transform, so the accessible name is unaffected — this
   * asserts the copy was not shouted in the markup, as on every other chapter.
   */
  it("renders the chapter title in sentence case, not the uppercase it displays", () => {
    render(<ProphylaxisGuidance />);
    expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(HEADING);
    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("uppercase");
  });

  it("renders the two bullets verbatim from the data module", () => {
    render(<ProphylaxisGuidance />);
    for (const bullet of BODY) {
      expect(screen.getByText(bullet, { selector: "li" })).toBeInTheDocument();
    }
  });

  /**
   * The heading must not also appear in the list under itself — what the old
   * positional read produced whenever the slice was off by one.
   */
  it("does not repeat the heading as a bullet", () => {
    render(<ProphylaxisGuidance />);
    expect(screen.getAllByRole("listitem")).toHaveLength(BODY.length);
  });

  /**
   * The 2026-08-04 responsive pass, which is one line on this chapter: the
   * bullets step 24 → 20 below `lg` and nothing else moves. There is no grid, no
   * figure, no table and no card here — the `<h1>`'s own ramp is §2's app-wide
   * rule and predates this pass — so the whole of it is asserted in one test.
   *
   * Both halves matter. The `lg:` value is the transcription (26px measured off
   * the export, `text-2xl` since weight stopped travelling with a size), and the
   * base value is the step that keeps the body under the stepped-down heading
   * rather than level with it: at 24 against a 30px `<h1>` the phone renders a
   * hierarchy the artboard draws at 2 ×.
   *
   * `leading-tight` is asserted alongside because it is stated once for both
   * steps — a `text-*` that arrived without it would silently take Tailwind's
   * own 1.4 at `text-xl`, which is not the drawn 1.25 at either size.
   *
   * jsdom computes no layout, so a class string is the only thing here that can
   * fail; the arithmetic behind the step is unverified (open item 41).
   */
  it("steps the bullets down one below lg, keeping one line height across both", () => {
    const { container } = render(<ProphylaxisGuidance />);

    expect(container.querySelector("ul")).toHaveClass("text-xl", "lg:text-2xl", "leading-tight");
  });

  /**
   * The wash is wallpaper: it carries nothing the two bullets do not, so it is
   * decorative and must stay out of the accessibility tree. `alt=""` gives the
   * `presentation` role, so a role query sees no image at all — this fails if
   * someone "helpfully" describes it.
   */
  it("mounts the backdrop as decoration, not as an announced image", () => {
    render(<ProphylaxisGuidance />);
    expect(screen.queryAllByRole("img")).toHaveLength(0);
    expect(document.querySelector("[data-page-backdrop='prophylaxis'] img")).toHaveAttribute(
      "alt",
      "",
    );
  });

  /**
   * The 15% is the design value and it lives in CSS, not baked into the asset —
   * the delivered file arrived with it as a uniform alpha, and flattening that
   * put the number where it can be read. This is the guard on the pair: a
   * backdrop that lost the class would paint the wash at full strength.
   */
  it("washes the backdrop at the designer's 15%", () => {
    render(<ProphylaxisGuidance />);
    expect(document.querySelector("[data-page-backdrop='prophylaxis'] img")).toHaveClass(
      "opacity-15",
    );
  });
});
