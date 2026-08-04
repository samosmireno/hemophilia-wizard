import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import OptionGroup, { type Option } from "./OptionGroup";

const OPTIONS: Option<"a" | "b" | "c">[] = [
  { id: "a", label: "Option A" },
  { id: "b", label: "Option B" },
  { id: "c", label: "Option C" },
];

function renderGroup(value: "a" | "b" | "c" | null, onChange = vi.fn()) {
  render(
    <OptionGroup
      legend="Pick one"
      name="test-group"
      options={OPTIONS}
      value={value}
      onChange={onChange}
    />,
  );
  return onChange;
}

const radio = (name: string) => screen.getByRole("radio", { name });

describe("OptionGroup", () => {
  it("is a group named by its legend, holding one radio per option", () => {
    renderGroup(null);

    expect(screen.getByRole("group", { name: "Pick one" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  /**
   * The `name` is what makes the browser enforce one-of-N and give the group
   * arrow-key navigation — the whole reason these are real radios rather than
   * buttons. Nothing else asserts it, and it is invisible in the rendered page.
   */
  it("groups the radios under one name", () => {
    renderGroup(null);

    for (const label of ["Option A", "Option B", "Option C"]) {
      expect(radio(label)).toHaveAttribute("name", "test-group");
    }
  });

  it("checks the option matching `value`, and only that one", () => {
    renderGroup("b");

    expect(radio("Option A")).not.toBeChecked();
    expect(radio("Option B")).toBeChecked();
    expect(radio("Option C")).not.toBeChecked();
  });

  it("reports a pick by id", async () => {
    const onChange = renderGroup(null);

    await userEvent.click(radio("Option C"));

    expect(onChange).toHaveBeenCalledExactlyOnceWith("c");
  });

  /**
   * The deselect. A checked radio cannot be unchecked by the platform, so this
   * is the one behaviour the component adds — and the one that would silently
   * regress if the `onClick`/`onChange` pairing were ever simplified into a
   * single handler.
   */
  it("clears the choice when the chosen option is picked again", async () => {
    const onChange = renderGroup("b");

    await userEvent.click(radio("Option B"));

    expect(onChange).toHaveBeenCalledExactlyOnceWith(null);
  });

  /** Switching between two options must not read as a clear on the way. */
  it("does not clear when a different option is picked", async () => {
    const onChange = renderGroup("b");

    await userEvent.click(radio("Option A"));

    expect(onChange).toHaveBeenCalledExactlyOnceWith("a");
  });

  /**
   * Arrow-key selection is the platform's, not ours — asserted once because it
   * is the payoff for using real radios, and because it also synthesises a
   * click, which is the input the deselect handler listens on. If those two
   * interacted badly, moving with the keyboard would clear the group.
   */
  it("moves the selection with an arrow key without clearing it", async () => {
    const onChange = renderGroup("a");

    radio("Option A").focus();
    await userEvent.keyboard("{ArrowRight}");

    expect(onChange).toHaveBeenCalledExactlyOnceWith("b");
  });

  describe("skin", () => {
    /**
     * The three resting states the artboard draws, asserted as the classes that
     * carry them. This is the component's whole visual contract and jsdom
     * computes no styles, so the class is the seam — see docs/styling.md §14 for
     * where each colour came from.
     */
    it("gives every option the resting Button skin while the group is unanswered", () => {
      renderGroup(null);

      for (const label of ["Option A", "Option B", "Option C"]) {
        expect(radio(label).closest("label")).toHaveClass("bg-ui-btn-bg");
      }
    });

    it("gives the chosen option the teal skin", () => {
      renderGroup("b");

      expect(radio("Option B").closest("label")).toHaveClass("bg-choice-selected");
    });

    it("recedes the options passed over in an answered group", () => {
      renderGroup("b");

      for (const label of ["Option A", "Option C"]) {
        const pill = radio(label).closest("label");
        expect(pill).toHaveClass("bg-ui-btn-bg-active");
        expect(pill).toHaveClass("text-ui-btn-fg-active");
      }
    });

    /**
     * The responsive pass of 2026-08-04, pinned as one assertion per box,
     * because the four ramps are one argument: below `lg` the block is a single
     * column of drawn-width (440px) pills at two-thirds type, and at `lg` the
     * artboard's two columns come back. jsdom computes no styles, so the class
     * is the seam — docs/styling.md §14 carries the arithmetic.
     */
    it("stacks one column of drawn-width pills below `lg`, and splits at it", () => {
      renderGroup(null);
      const group = screen.getByRole("group", { name: "Pick one" });

      // 440px = (900 − 20) / 2, i.e. the pill's own width at the canvas.
      expect(group).toHaveClass("max-w-110", "lg:max-w-225");
      expect(group.querySelector("div")).toHaveClass("grid-cols-1", "lg:grid-cols-2");
    });

    /**
     * Three steps on the pills against one on the legend: the legend takes §2's
     * app-wide step at `lg` while the pills follow their own width, which is 440
     * / 366 / 440 across the two breakpoints and so cannot be one step.
     */
    it("ramps the label type on the pill's width and the legend on §2's rule", () => {
      renderGroup(null);

      expect(screen.getByText("Pick one")).toHaveClass("text-xl", "lg:text-3xl");
      expect(radio("Option A").closest("label")).toHaveClass(
        "text-base",
        "lg:text-xl",
        "xl:text-2xl",
      );
    });

    /**
     * One `leading-tight` covers all three sizes — a v4 `leading-*` sets
     * `--tw-leading` and each `text-<size>` reads it back — and with `min-h-14`
     * it is what keeps the pill 56px tall at every step rather than only where
     * the padding happens to add up.
     */
    it("states the line box once, and floors the pill at the drawn height", () => {
      renderGroup(null);

      expect(radio("Option A").closest("label")).toHaveClass("leading-tight", "min-h-14");
    });

    it("applies `optionClassName` to every option", () => {
      render(
        <OptionGroup
          legend="Pick one"
          name="shouty"
          options={OPTIONS}
          value={null}
          onChange={vi.fn()}
          optionClassName="uppercase"
        />,
      );

      for (const label of ["Option A", "Option B", "Option C"]) {
        expect(radio(label).closest("label")).toHaveClass("uppercase");
      }
    });
  });
});
