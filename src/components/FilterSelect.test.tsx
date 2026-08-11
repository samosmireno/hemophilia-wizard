import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import FilterSelect from "./FilterSelect";

const OPTIONS = ["A", "B", "A + B"];

describe("FilterSelect", () => {
  it("is a combobox named by its visible label", () => {
    render(<FilterSelect label="Hemophilia Type" value="" options={OPTIONS} onChange={() => {}} />);

    expect(screen.getByRole("combobox")).toHaveAccessibleName("Hemophilia Type");
  });

  // All is prepended by the component, not supplied by the caller — so every
  // instance has it, first, and no data file has to carry a non-cell value.
  it("puts All first, then the options in the given order", () => {
    render(<FilterSelect label="Hemophilia Type" value="" options={OPTIONS} onChange={() => {}} />);

    const options = within(screen.getByRole("combobox")).getAllByRole("option");
    expect(options.map((o) => o.textContent)).toEqual(["All", ...OPTIONS]);
  });

  it("reports a picked option by its value, and All as the empty string", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    const { rerender } = render(
      <FilterSelect label="Hemophilia Type" value="" options={OPTIONS} onChange={onChange} />,
    );

    await user.selectOptions(screen.getByRole("combobox"), "A + B");
    expect(onChange).toHaveBeenLastCalledWith("A + B");

    rerender(
      <FilterSelect label="Hemophilia Type" value="A + B" options={OPTIONS} onChange={onChange} />,
    );
    await user.selectOptions(screen.getByRole("combobox"), "All");
    expect(onChange).toHaveBeenLastCalledWith("");
  });

  // The two halves of a glossed option must not swap: the label is for the
  // open list, the value is what predicates match cells with.
  it("shows a glossed option's label while reporting its verbatim value", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(
      <FilterSelect
        label="Hemophilia Type"
        value=""
        options={["A", { value: "A + B", label: "A + B (eligible for both)" }]}
        onChange={onChange}
      />,
    );

    await user.selectOptions(
      screen.getByRole("combobox"),
      screen.getByRole("option", { name: "A + B (eligible for both)" }),
    );

    expect(onChange).toHaveBeenLastCalledWith("A + B");
  });

  // Controlled: the select shows the prop, not its own last pick.
  it("renders the value it is given", () => {
    render(
      <FilterSelect label="Hemophilia Type" value="B" options={OPTIONS} onChange={() => {}} />,
    );

    expect(screen.getByRole("combobox")).toHaveValue("B");
  });
});
