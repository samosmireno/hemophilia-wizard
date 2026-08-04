import { useState } from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Popup from "./Popup";

const TITLE = "Hemostatic Rebalancing Agents in Treatment of HA/HB";
const SUBTITLE = "(Options include SHL, EHL, and UHL FVIII/FIX products)";

/** The dialog is always mounted; `open` is what `showModal()` reflects. */
const dialog = () => screen.getByRole("dialog", { hidden: true });

describe("Popup", () => {
  it("opens and closes as `open` changes", () => {
    const { rerender } = render(
      <Popup open={false} title={TITLE} onClose={vi.fn()}>
        <p>body</p>
      </Popup>,
    );
    expect(dialog()).not.toHaveAttribute("open");

    rerender(
      <Popup open title={TITLE} onClose={vi.fn()}>
        <p>body</p>
      </Popup>,
    );
    expect(dialog()).toHaveAttribute("open");

    rerender(
      <Popup open={false} title={TITLE} onClose={vi.fn()}>
        <p>body</p>
      </Popup>,
    );
    expect(dialog()).not.toHaveAttribute("open");
  });

  it("names the dialog with its title", () => {
    render(
      <Popup open title={TITLE} onClose={vi.fn()}>
        <p>body</p>
      </Popup>,
    );

    expect(dialog()).toHaveAccessibleName(TITLE);
  });

  /**
   * The subtitle is a scope qualifier — it names which products the card covers
   * — so it belongs to the dialog's name and not merely to its body. Title
   * first, then subtitle, which is the order `aria-labelledby` lists the ids in.
   */
  it("names the dialog with its title AND subtitle when it has one", () => {
    render(
      <Popup open title={TITLE} subtitle={SUBTITLE} onClose={vi.fn()}>
        <p>body</p>
      </Popup>,
    );

    expect(dialog()).toHaveAccessibleName(`${TITLE} ${SUBTITLE}`);
  });

  it("renders no subtitle element when none is given", () => {
    render(
      <Popup open title={TITLE} onClose={vi.fn()}>
        <p>body</p>
      </Popup>,
    );

    expect(screen.queryByText(SUBTITLE)).not.toBeInTheDocument();
    expect(dialog()).toHaveAccessibleName(TITLE);
  });

  /**
   * A class assertion, which this suite otherwise avoids — and it is here
   * because the bug it guards is invisible to every other kind of test. Routing
   * these classes through `cn()` silently dropped the old `text-h4`:
   * tailwind-merge did not know this project's `@theme` font sizes, read
   * `text-h4` as a colour, and let the `text-white` beside it win. jsdom applies
   * no Tailwind at all, so the subtitle rendered at an inherited 16px with the
   * whole suite green.
   *
   * `text-xl` is a stock t-shirt size, so the default config resolves it and the
   * bug cannot recur in this form (`src/lib/cn.ts`). Kept as the regression test
   * for reintroducing a named `--text-*` token, which would fail exactly here.
   */
  it("keeps the subtitle's font-size utility intact", () => {
    render(
      <Popup open title={TITLE} subtitle={SUBTITLE} onClose={vi.fn()}>
        <p>body</p>
      </Popup>,
    );

    expect(screen.getByText(SUBTITLE)).toHaveClass("text-xl", "font-medium");
  });

  /**
   * The band is `uppercase`, and a plain transform destroys the abbreviations it
   * is often made of: `FVIIIa` is factor VIII *activated* and `FIXa` is factor
   * IX activated, neither of which survives being shouted — the caption below
   * would read "FIX/FIXA AND FX/FXA" and stop distinguishing an activated factor
   * from its zymogen.
   *
   * The accessible name is asserted in the same test on purpose: the spans that
   * opt those terms out are themselves what would corrupt it, because the
   * accessible-name algorithm joins each element's contribution with a space.
   * The band's `aria-label` is what holds the two facts together, and only
   * asserting them together can catch one being fixed at the other's expense.
   */
  it("keeps cased abbreviations out of the band's uppercase, and out of its name", () => {
    const cased = "Emicizumab MOA: Interactions with FIX/FIXa and FX/FXa";
    render(
      <Popup open title={cased} onClose={vi.fn()}>
        <p>body</p>
      </Popup>,
    );

    const heading = screen.getByRole("heading", { name: cased });
    for (const term of ["FIXa", "FXa"]) {
      expect(within(heading).getByText(term)).toHaveClass("normal-case");
    }
    expect(dialog()).toHaveAccessibleName(cased);
  });

  /** A title with nothing to protect is one text node, and names the card. */
  it("leaves a title with no cased term whole", () => {
    render(
      <Popup open title={TITLE} onClose={vi.fn()}>
        <p>body</p>
      </Popup>,
    );

    expect(screen.getByRole("heading", { name: TITLE })).toHaveTextContent(TITLE);
    expect(dialog()).toHaveAccessibleName(TITLE);
  });

  /**
   * Class assertions again, for the same reason the subtitle's is one: jsdom
   * applies no Tailwind, so a card at the wrong width is invisible to every
   * other kind of test in this file. What they guard is not the numbers — those
   * are a browser's business — but that the prop reaches the card at all and
   * that `cn()` does not drop it. Routing a `w-` utility through tailwind-merge
   * beside the base string is exactly the shape that silently ate the old `text-h4`.
   */
  describe("width", () => {
    /** The card is the layer's only child; the layer itself is always full-size. */
    const card = () => dialog().firstElementChild!;

    it.each([
      ["narrow", "w-[min(860px,92vw)]"],
      ["default", "w-[min(1140px,92vw)]"],
      ["wide", "w-[min(1360px,96vw)]"],
    ] as const)("draws the %s card", (width, expected) => {
      render(
        <Popup open title={TITLE} width={width} onClose={vi.fn()}>
          <p>body</p>
        </Popup>,
      );

      expect(card()).toHaveClass(expected);
    });

    /**
     * The step every card sits on that has not asked for another, and the one
     * the §7.6 hemostatic-mechanisms asset is stored against — it is encoded at
     * 1772px for a drawn 886. That used to be exactly this width less the border
     * and the body gutters; the step moved 1024 → 1140 on 2026-08-04, so the
     * body is now 1002 and the asset is the one thing that did not follow. See
     * styling open item 29.
     */
    it("is the default width when the caller says nothing", () => {
      render(
        <Popup open title={TITLE} onClose={vi.fn()}>
          <p>body</p>
        </Popup>,
      );

      expect(card()).toHaveClass("w-[min(1140px,92vw)]");
    });

    /**
     * The band is content-height, so a one-line title on a phone sizes it to
     * ~47px — and the ✕ centred on it is 65px, which then overhangs the band at
     * both ends and is clipped at the top by the card's `overflow-hidden`.
     * Measured at 390px before the floor went in: 4px of the button gone.
     *
     * Asserted as a class for the same reason as the widths — jsdom lays nothing
     * out, so the only thing a test here can hold is that the rule is still on
     * the element. `justify-center` is asserted with it because the floor is
     * what makes it matter: without it the title sits at the top of a band the
     * ✕ is centred in.
     */
    it("floors the band at the ✕'s own height, with the title centred in it", () => {
      render(
        <Popup open title={TITLE} onClose={vi.fn()}>
          <p>body</p>
        </Popup>,
      );

      expect(card().firstElementChild).toHaveClass("min-h-[65px]", "justify-center");
    });
  });

  it("closes on the ✕", async () => {
    const onClose = vi.fn();
    render(
      <Popup open title={TITLE} onClose={onClose}>
        <p>body</p>
      </Popup>,
    );

    // `PopupButton` builds its name as "Close <label>" when open.
    await userEvent.click(screen.getByRole("button", { name: `Close ${TITLE}` }));

    expect(onClose).toHaveBeenCalledOnce();
  });

  /**
   * ESC is handled on `keydown`, ahead of the platform's own close watcher —
   * Chrome groups nested dialogs into one watcher and closes them together, so
   * `onCancel` alone cannot dismiss just the topmost (see `ModalLayer`).
   *
   * The cancelled default is the assertion that matters: it is what takes the
   * close request away from the browser, and a handler that called `onClose`
   * without it would close the layer *and* let the group close too.
   */
  it("routes ESC through onClose and cancels the platform's own close", () => {
    const onClose = vi.fn();
    render(
      <Popup open title={TITLE} onClose={onClose}>
        <p>body</p>
      </Popup>,
    );

    const escaped = fireEvent.keyDown(dialog(), { key: "Escape" });

    expect(onClose).toHaveBeenCalledOnce();
    // `fireEvent` returns false when a handler called preventDefault.
    expect(escaped).toBe(false);
  });

  /** Any other key is none of this component's business. */
  it("ignores keys that are not ESC", () => {
    const onClose = vi.fn();
    render(
      <Popup open title={TITLE} onClose={onClose}>
        <p>body</p>
      </Popup>,
    );

    fireEvent.keyDown(dialog(), { key: "Enter" });

    expect(onClose).not.toHaveBeenCalled();
  });

  /**
   * The `cancel` event is dispatched directly rather than pressed as a key:
   * jsdom implements no dialog behaviour, so no Escape it receives would ever
   * produce one. What this asserts is the half we own — that the handler
   * preventDefaults, so the element cannot close itself out from under `open`,
   * and routes ESC through `onClose` like every other close.
   */
  it("routes the platform's cancel (ESC) through onClose without self-closing", () => {
    const onClose = vi.fn();
    render(
      <Popup open title={TITLE} onClose={onClose}>
        <p>body</p>
      </Popup>,
    );

    const cancel = new Event("cancel", { cancelable: true, bubbles: true });
    fireEvent(dialog(), cancel);

    expect(onClose).toHaveBeenCalledOnce();
    expect(cancel.defaultPrevented).toBe(true);
    expect(dialog()).toHaveAttribute("open");
  });

  it("closes on a backdrop click", async () => {
    const onClose = vi.fn();
    render(
      <Popup open title={TITLE} onClose={onClose}>
        <p>body</p>
      </Popup>,
    );

    await userEvent.click(dialog());

    expect(onClose).toHaveBeenCalledOnce();
  });

  it("ignores a click inside the card", async () => {
    const onClose = vi.fn();
    render(
      <Popup open title={TITLE} onClose={onClose}>
        <p>body</p>
      </Popup>,
    );

    await userEvent.click(screen.getByText("body"));

    expect(onClose).not.toHaveBeenCalled();
  });

  /**
   * A text selection dragged from the body out onto the backdrop delivers a
   * click whose target is the dialog — the common ancestor of its mousedown and
   * mouseup — and is otherwise indistinguishable from a real backdrop click.
   */
  it("ignores a drag that starts inside the card and ends on the backdrop", () => {
    const onClose = vi.fn();
    render(
      <Popup open title={TITLE} onClose={onClose}>
        <p>body</p>
      </Popup>,
    );

    fireEvent.mouseDown(screen.getByText("body"));
    fireEvent.mouseUp(dialog());
    fireEvent.click(dialog());

    expect(onClose).not.toHaveBeenCalled();
  });

  it("locks and restores page scroll", () => {
    function Harness() {
      const [open, setOpen] = useState(false);
      return (
        <>
          <button onClick={() => setOpen((previous) => !previous)}>toggle</button>
          <Popup open={open} title={TITLE} onClose={() => setOpen(false)}>
            <p>body</p>
          </Popup>
        </>
      );
    }
    document.body.style.overflow = "scroll";
    render(<Harness />);

    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(document.body.style.overflow).toBe("hidden");

    fireEvent.click(screen.getByRole("button", { name: "toggle" }));
    expect(document.body.style.overflow).toBe("scroll");
  });
});
