import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import ExpandableFigure from "./ExpandableFigure";

const TITLE = "Initiation and Amplification of the Clotting Cascade";
const ALT = "Vascular injury exposes tissue factor, which with FVIIa initiates coagulation.";

const renderFigure = () =>
  render(
    <ExpandableFigure thumbSrc="/thumb.webp" thumbWidth={940} thumbHeight={538} title={TITLE}>
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

  /**
   * The thumbnail's box must exist before the file has bytes: it is `w-full`,
   * so the declared ratio is what gives an unloaded image a height — without it
   * a thumb inside a `Popup` opens the card short and the body shifts when the
   * picture lands. jsdom does no layout, so the declaration is what is testable.
   */
  it("reserves the thumbnail's box with the declared ratio", () => {
    renderFigure();

    const thumb = screen.getByRole("button", { name: `Expand ${TITLE}` }).querySelector("img");
    expect(thumb).toHaveStyle({ aspectRatio: "940 / 538" });
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
      <ExpandableFigure thumbSrc="/thumb.webp" thumbWidth={940} thumbHeight={538} title={TITLE}>
        <p>body</p>
      </ExpandableFigure>,
    );
    expect(dialog().firstElementChild).toHaveClass("bg-popup");

    rerender(
      <ExpandableFigure
        thumbSrc="/thumb.webp"
        thumbWidth={940}
        thumbHeight={538}
        title={TITLE}
        surface="white"
      >
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

  /**
   * Touch devices reach neither `:hover` nor `:focus-visible`, so they get a
   * persistent tap badge instead; CSS hides it wherever hover exists, which
   * jsdom cannot see — presence and `aria-hidden` are what is testable here.
   * Like the wash, it must not leak into the button's accessible name.
   */
  it("hides the persistent tap hint from the accessible name", () => {
    renderFigure();

    const badge = screen.getByText("Tap to enlarge");
    expect(badge).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("button", { name: `Expand ${TITLE}` })).toHaveAccessibleName(
      `Expand ${TITLE}`,
    );
  });

  /**
   * `variant="bare"` swaps the §7.7 card for `Lightbox` — the picture on the
   * scrim with no band and no border.
   *
   * The pair is the fact worth pinning. Losing the heading is the point; keeping
   * the *name* is what stops that being a regression, because with no band there
   * is no visible text left for the dialog to be named from, and `Lightbox` has
   * to label it directly. Everything else — ESC, the backdrop, the ✕ — is
   * `ModalLayer`'s and is tested through the card above.
   */
  it("expands bare on request: no heading, still named, still closable", async () => {
    render(
      <ExpandableFigure
        thumbSrc="/thumb.webp"
        thumbWidth={940}
        thumbHeight={538}
        title={TITLE}
        variant="bare"
      >
        <img src="/figure.webp" alt={ALT} />
      </ExpandableFigure>,
    );

    await userEvent.click(screen.getByRole("button", { name: `Expand ${TITLE}` }));

    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
    expect(dialog()).toHaveAccessibleName(TITLE);
    expect(dialog()).toHaveAttribute("open");

    await userEvent.click(screen.getByRole("button", { name: `Close ${TITLE}` }));
    expect(dialog()).not.toHaveAttribute("open");
  });
});
