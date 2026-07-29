import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import Popup from "./Popup";

const TITLE = "Hemostatic Rebalancing Agents in Treatment of HA/HB";

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
