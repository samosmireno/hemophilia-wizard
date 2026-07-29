import { render, screen } from "@testing-library/react";
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
 */
const trigger = (label: string, state: "Expand" | "Close" = "Expand") =>
  screen.getByRole("button", { name: `${state} ${label}` });

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
  // still toggles, and must not claim to control a panel that is not there.
  it("still toggles a disclosure that has nothing to open", async () => {
    renderBand();
    expect(trigger("Third figure")).not.toHaveAttribute("aria-controls");

    await userEvent.click(trigger("Third figure"));

    expect(trigger("Third figure", "Close")).toBeInTheDocument();
  });

  it("points each trigger at the panel it opens", async () => {
    renderBand();
    const panelId = trigger("First figure").getAttribute("aria-controls");

    await userEvent.click(trigger("First figure"));

    expect(document.getElementById(panelId!)).toHaveTextContent("first panel");
  });
});
