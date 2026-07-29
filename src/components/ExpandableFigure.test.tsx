import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import ExpandableFigure from "./ExpandableFigure";

const TITLE = "Initiation and Amplification of the Clotting Cascade";
const ALT = "Vascular injury exposes tissue factor, which with FVIIa initiates coagulation.";

const renderFigure = () =>
  render(
    <ExpandableFigure thumbSrc="/thumb.webp" title={TITLE}>
      <img src="/figure.webp" alt={ALT} />
    </ExpandableFigure>,
  );

/** The dialog is always mounted; `open` is what `showModal()` reflects. */
const dialog = () => screen.getByRole("dialog", { hidden: true });

describe("ExpandableFigure", () => {
  it("names the trigger with the same verb PopupButton uses", () => {
    renderFigure();

    expect(screen.getByRole("button", { name: `Expand ${TITLE}` })).toBeInTheDocument();
  });

  /**
   * The thumbnail is a preview of content that is one click away, and its `alt`
   * would otherwise become the button's accessible name — a paragraph announced
   * as the name of a control. The description lives on the pop-up's figure only.
   */
  it("exposes no image while closed — the thumbnail is decorative", () => {
    renderFigure();

    expect(screen.queryAllByRole("img")).toHaveLength(0);
    expect(screen.getByRole("button", { name: `Expand ${TITLE}` })).toHaveAccessibleName(
      `Expand ${TITLE}`,
    );
  });

  it("starts closed", () => {
    renderFigure();

    expect(dialog()).not.toHaveAttribute("open");
  });

  it("opens the pop-up on the thumbnail, titled with the figure's own heading", async () => {
    renderFigure();

    await userEvent.click(screen.getByRole("button", { name: `Expand ${TITLE}` }));

    expect(dialog()).toHaveAttribute("open");
    expect(dialog()).toHaveAccessibleName(TITLE);
  });

  it("renders its children as the card's body", async () => {
    renderFigure();

    await userEvent.click(screen.getByRole("button", { name: `Expand ${TITLE}` }));

    expect(screen.getByRole("img")).toHaveAccessibleName(ALT);
    expect(screen.getByRole("img")).toHaveAttribute("src", "/figure.webp");
  });

  /** The default is the design's gradient; white is opt-in, per `Popup`. */
  it("passes its surface through to the card", () => {
    const { rerender } = render(
      <ExpandableFigure thumbSrc="/thumb.webp" title={TITLE}>
        <p>body</p>
      </ExpandableFigure>,
    );
    expect(dialog().firstElementChild).toHaveClass("bg-popup");

    rerender(
      <ExpandableFigure thumbSrc="/thumb.webp" title={TITLE} surface="white">
        <p>body</p>
      </ExpandableFigure>,
    );
    expect(dialog().firstElementChild).toHaveClass("bg-white");
  });

  it("closes again on the ✕", async () => {
    renderFigure();

    await userEvent.click(screen.getByRole("button", { name: `Expand ${TITLE}` }));
    // `PopupButton` builds its name as "Close <label>" when open.
    await userEvent.click(screen.getByRole("button", { name: `Close ${TITLE}` }));

    expect(dialog()).not.toHaveAttribute("open");
  });

  /**
   * The hint is an affordance, not a name: a sighted user gets "Click to
   * enlarge" on hover, a screen-reader user gets "Expand <title>" — so the hint
   * must not leak into the button's accessible name and make it say both.
   */
  it("hides the hover hint from the accessible name", () => {
    renderFigure();

    const hint = screen.getByText("Click to enlarge");
    expect(hint).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("button", { name: `Expand ${TITLE}` })).toHaveAccessibleName(
      `Expand ${TITLE}`,
    );
  });
});
