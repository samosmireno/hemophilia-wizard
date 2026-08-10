import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import PageSection from "./PageSection";

/**
 * The frame's invariants are pinned here, once — the route suites query the
 * seam (`getByRole("region", { name })`) and do not restate the classes.
 */
describe("PageSection", () => {
  /**
   * The pairing is the module's whole reason to exist: the section is a
   * `region` named by its own `<h1>`, wired through an id no caller writes.
   */
  it("announces a region named by its <h1>", () => {
    render(
      <PageSection title="Glossary">
        <p>body</p>
      </PageSection>,
    );

    const region = screen.getByRole("region", { name: "Glossary" });
    expect(within(region).getByRole("heading", { level: 1 })).toHaveTextContent("Glossary");
    expect(within(region).getByText("body")).toBeInTheDocument();
  });

  /**
   * The page-title ramp (docs/styling.md §2), stated once for the whole app:
   * 30 → 48 across `lg`, display face, crimson. Uppercase is CSS, not copy —
   * asserted through the accessible name above staying as written.
   */
  it("draws the page-title ramp", () => {
    render(<PageSection title="Glossary">{null}</PageSection>);

    expect(screen.getByRole("heading", { level: 1 })).toHaveClass(
      "font-display",
      "text-3xl",
      "font-bold",
      "tracking-wide",
      "text-brand-crimson-50",
      "uppercase",
      "lg:text-5xl",
    );
  });

  /**
   * `titleLabel` exists for the one title whose markup breaks the name
   * algorithm (FviiiMimetics' two-tone split): the label names the region, the
   * marked-up title still paints.
   */
  it("lets titleLabel name the region when the title is markup", () => {
    render(
      <PageSection
        title={
          <>
            <span>FVIII Mimetic BsAbs:</span> <span>Approved and Emerging</span>
          </>
        }
        titleLabel="FVIII Mimetic BsAbs: Approved and Emerging Agents"
      >
        {null}
      </PageSection>,
    );

    expect(
      screen.getByRole("region", { name: "FVIII Mimetic BsAbs: Approved and Emerging Agents" }),
    ).toBeInTheDocument();
  });

  /**
   * The always-scrolls rule (docs/styling.md §9 item 53): `AppShell` sets
   * `lg:pb-0`, so a page that always scrolls pads its own bottom. Named as a
   * prop so a fifth scroller states intent rather than re-deriving the class.
   */
  it("pads its own bottom when padsOwnBottom is set, and merges caller classes", () => {
    const { container } = render(
      <PageSection title="References" padsOwnBottom className="flex flex-1 flex-col">
        {null}
      </PageSection>,
    );

    expect(container.firstElementChild).toHaveClass("lg:pb-16", "flex", "flex-1", "flex-col");
  });

  it("adds no bottom padding by default", () => {
    const { container } = render(<PageSection title="Wizard">{null}</PageSection>);

    expect(container.firstElementChild).not.toHaveClass("lg:pb-16");
  });
});
