import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import AgentBoxButton from "./AgentBoxButton";

function renderBox(overrides: Partial<Parameters<typeof AgentBoxButton>[0]> = {}) {
  return render(
    <AgentBoxButton src="/concizumab.webp" agent="Concizumab" onClick={() => {}} {...overrides} />,
  );
}

describe("AgentBoxButton", () => {
  /**
   * The button is named for what the click does, in the app-wide trigger
   * convention (`PopupButton`, `ExpandableFigure`): "Expand {dialog title}",
   * and the sheet's dialog title is the agent name. It advertises the dialog
   * it opens.
   */
  it("names itself Expand {agent} and advertises a dialog", () => {
    renderBox();

    const button = screen.getByRole("button", { name: "Expand Concizumab" });
    expect(button).toHaveAttribute("aria-haspopup", "dialog");
    expect(button).toHaveAttribute("type", "button");
  });

  /**
   * The image is presentation — the button is the thing. An `alt` here would
   * double-announce what the caller's prose already says (the chapter bullets
   * carry each agent's composed label), so the img must stay out of the
   * accessibility tree.
   */
  it("keeps the image decorative", () => {
    renderBox();
    expect(screen.queryAllByRole("img")).toHaveLength(0);
  });

  it("fires onClick", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderBox({ onClick });

    await user.click(screen.getByRole("button", { name: "Expand Concizumab" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  /**
   * The exported rest skin plus the invented states (docs/styling.md §9/§11):
   * hover raises the shadow onto white, press inverts it onto `slate-100`,
   * focus-visible swaps the white ring to crimson. The rem ring is the §19
   * scaling rule; `shadow-agent-box` is the two-layer token — the guard on the
   * export's two-`shadow-[]`-class form coming back.
   */
  it("wears the rest skin and the three invented state skins", () => {
    renderBox();
    const button = screen.getByRole("button", { name: "Expand Concizumab" });

    expect(button).toHaveClass(
      "h-48",
      "max-w-56",
      "rounded-xl",
      "bg-slate-50",
      "py-1",
      "shadow-agent-box",
      "outline-[0.1875rem]",
      "-outline-offset-[0.1875rem]",
      "outline-white",
      "cursor-pointer",
      "hover:bg-white",
      "hover:shadow-agent-box-hover",
      "active:bg-slate-100",
      "active:shadow-agent-box-active",
      "focus-visible:outline-brand-crimson-50",
    );
  });

  /**
   * The three §7.7 exports share 912×745, so the intrinsic size defaults —
   * a caller with a differently-shaped asset moves the numbers with it.
   */
  it("defaults the image's intrinsic size to the shared 912×745", () => {
    const { container } = renderBox();
    const img = container.querySelector("img")!;

    expect(img).toHaveAttribute("width", "912");
    expect(img).toHaveAttribute("height", "745");

    renderBox({ width: 100, height: 50 });
    expect(container.ownerDocument.querySelectorAll("img")[1]).toHaveAttribute("width", "100");
  });

  /** Layout classes merge in; the caller cannot un-skin the box this way. */
  it("merges caller layout classes", () => {
    renderBox({ className: "shrink-0 lg:shrink" });
    expect(screen.getByRole("button", { name: "Expand Concizumab" })).toHaveClass(
      "shrink-0",
      "lg:shrink",
    );
  });
});
