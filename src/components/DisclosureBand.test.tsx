import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import DisclosureBand, { type Disclosure } from "./DisclosureBand";

const DISCLOSURES: readonly [Disclosure, Disclosure, Disclosure] = [
  { label: "First figure", content: <p>first panel</p> },
  { label: "Second figure", content: <p>second panel</p> },
  // No content — the §7.7 assets that do not exist yet.
  { label: "Third figure" },
];

function renderBand() {
  render(<DisclosureBand title="Severity and bleeding" disclosures={DISCLOSURES} />);
}

/**
 * `PopupButton` builds its accessible name as "Expand <label>" / "Close
 * <label>", so the name doubles as the open-state assertion.
 *
 * Both queries are scoped, because an open disclosure puts **two** buttons
 * named "Close <label>" in the document: the trigger, which is showing ✕, and
 * the dialog's own ✕, which takes the same label. That is not ambiguous to a
 * real user — `showModal()` makes everything outside the dialog inert, so only
 * one of the two is reachable at a time — but jsdom implements no top layer, so
 * an unscoped `getByRole` sees both and throws.
 */
const trigger = (label: string, state: "Expand" | "Close" = "Expand") =>
  within(screen.getByRole("list")).getByRole("button", { name: `${state} ${label}` });

const dialog = () => screen.getByRole("dialog", { hidden: true });

describe("DisclosureBand", () => {
  it("opens the panel a disclosure declares", async () => {
    renderBand();
    expect(screen.queryByText("first panel")).not.toBeInTheDocument();

    await userEvent.click(trigger("First figure"));

    expect(screen.getByText("first panel")).toBeInTheDocument();
  });

  // One panel, so one open disclosure — the mutual exclusion is the reason the
  // state lives on the band instead of inside each button.
  it("closes the open disclosure when another is opened", async () => {
    renderBand();

    await userEvent.click(trigger("First figure"));
    await userEvent.click(trigger("Second figure"));

    expect(screen.getByText("second panel")).toBeInTheDocument();
    expect(screen.queryByText("first panel")).not.toBeInTheDocument();
    expect(trigger("First figure")).toHaveAttribute("aria-expanded", "false");
  });

  it("closes on a second click of the open disclosure", async () => {
    renderBand();

    await userEvent.click(trigger("First figure"));
    await userEvent.click(trigger("First figure", "Close"));

    expect(screen.queryByText("first panel")).not.toBeInTheDocument();
  });

  // The placeholder state issue 11 accepts: a trigger with no assets behind it
  // still toggles, and must not claim to summon a dialog that is not there —
  // nor open an empty one, which is a worse placeholder than the inert toggle.
  it("still toggles a disclosure that has nothing to open", async () => {
    renderBand();
    expect(trigger("Third figure")).not.toHaveAttribute("aria-haspopup");

    await userEvent.click(trigger("Third figure"));

    expect(trigger("Third figure", "Close")).toBeInTheDocument();
    expect(dialog()).not.toHaveAttribute("open");
  });

  it("opens each disclosure in the dialog, titled with its label", async () => {
    renderBand();
    expect(trigger("First figure")).toHaveAttribute("aria-haspopup", "dialog");

    await userEvent.click(trigger("First figure"));

    expect(dialog()).toHaveAttribute("open");
    expect(dialog()).toHaveAccessibleName("First figure");
    expect(dialog()).toHaveTextContent("first panel");
  });

  // Closing from inside the dialog has to move the band's state, or the trigger
  // is left showing ✕ for a popup that is gone.
  it("resets the trigger when the dialog is closed from inside", async () => {
    renderBand();
    await userEvent.click(trigger("First figure"));

    await userEvent.click(within(dialog()).getByRole("button", { name: "Close First figure" }));

    expect(dialog()).not.toHaveAttribute("open");
    expect(trigger("First figure")).toHaveAttribute("aria-expanded", "false");
  });
});
