import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { REBALANCING_AGENTS, rebalancingAgentLabel, topicById } from "../../data/education";
import RebalancingAgents from "./RebalancingAgents";

describe("rebalancing-agents chapter", () => {
  it("renders the chapter title in title case, not the uppercase it displays", () => {
    render(<RebalancingAgents />);
    // `uppercase` is a CSS transform, so the accessible name is unaffected —
    // this asserts the copy was not shouted in the markup.
    expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(
      "Hemostatic Rebalancing Agents",
    );
  });

  /**
   * The `<h1>` is a literal because the artboard drops §7.6's scope qualifier.
   * Asserting they differ is what stops the heading being "helpfully" derived
   * from `topic.title` later — the two are not the same string, and the design
   * is the authority for the one on screen.
   */
  it("does not use the topic's own title as the heading", () => {
    render(<RebalancingAgents />);
    expect(topicById("rebalancing-agents")!.title).toBe(
      "Hemostatic Rebalancing Agents in Treatment of HA/HB",
    );
    expect(screen.queryByText(/in Treatment of HA\/HB/)).not.toBeInTheDocument();
  });

  // Both are read by id with a non-null assertion; a rename in the data module
  // fails here rather than as a render crash.
  it.each(["rebalancing-agents", "rebalancing-mechanisms"])("resolves the %s topic", (id) => {
    expect(topicById(id)).toBeDefined();
  });

  it("renders the chapter prose verbatim from the data module", () => {
    render(<RebalancingAgents />);
    expect(
      screen.getByText("Hemostatic rebalancing agents are NFTs administered by SC injection"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "FDA-approved agents are indicated for prophylaxis of HA and HB, with and without inhibitors",
        { selector: "li" },
      ),
    ).toBeInTheDocument();
  });

  /**
   * The three agents are a `NestedBullet` under the FDA-approval line, drawn
   * indented on the artboard. Nesting them as markup rather than as siblings is
   * what makes a screen reader announce the sub-list; this catches a flatten.
   */
  it("nests the three agents under the FDA-approval bullet", () => {
    render(<RebalancingAgents />);
    const lead = screen.getByText(/^FDA-approved agents/, { selector: "li" });

    expect(
      within(lead)
        .getAllByRole("listitem")
        .map((li) => li.textContent),
    ).toEqual(REBALANCING_AGENTS.map(rebalancingAgentLabel));
  });

  /**
   * The colour split is the artboard's whole point on this row: anti-TFPI mABs
   * in blue, AT-directed siRNA in crimson. The join runs composed-label →
   * mechanism → token, so this asserts an agent lands in its class's colour
   * rather than asserting three hard-coded strings.
   */
  it.each(REBALANCING_AGENTS)("tones $name by its mechanism class", (agent) => {
    render(<RebalancingAgents />);
    const expected = agent.mechanism === "anti-TFPI mAB" ? "text-agent-mab" : "text-agent-sirna";

    expect(screen.getByText(rebalancingAgentLabel(agent))).toHaveClass(expected);
  });

  /**
   * §7.6's mechanism prose was split into its own topic when this design
   * landed, precisely so the chapter would not have to slice it off by index.
   * This asserts the split holds from the rendered side: none of it is here.
   */
  it("shows none of the mechanism prose, which belongs to the figure card", () => {
    render(<RebalancingAgents />);
    for (const bullet of topicById("rebalancing-mechanisms")!.body) {
      expect(screen.queryByText(bullet as string)).not.toBeInTheDocument();
    }
  });

  // The caption beside the `+` is also the button's accessible name, which
  // `PopupButton` prefixes with "Expand".
  it("renders the mechanisms disclosure as a trigger with a visible caption", () => {
    render(<RebalancingAgents />);
    const caption = "Mechanisms of hemostatic rebalancing agents within the coagulation cascade";

    expect(screen.getByRole("button", { name: `Expand ${caption}` })).toBeInTheDocument();
    expect(screen.getByText(caption)).toBeInTheDocument();
  });

  /**
   * The artboard writes "homeostatic", which is a different word — homeostasis
   * is not hemostasis. CONTEXT.md §7.6/§7.7 and every other mention in this
   * repo write "hemostatic", so the typo is not reproduced.
   */
  it("does not reproduce the artboard's 'homeostatic' typo", () => {
    render(<RebalancingAgents />);
    expect(screen.queryByText(/homeostatic/i)).not.toBeInTheDocument();
  });

  /**
   * The three reserved figure boxes have no asset yet (CONTEXT.md §7.7). They
   * must not be `<img>`s standing empty, and they must not be focusable — a box
   * that takes a tab stop and opens nothing is worse than a gap. The caption
   * above them says "click on the boxes", so this is the guard that the
   * instruction has not been half-honoured with a control that does nothing.
   */
  it("reserves the figure boxes without announcing or focusing them", () => {
    render(<RebalancingAgents />);

    expect(screen.queryAllByRole("img")).toHaveLength(0);
    // The mechanisms `+`, and nothing else.
    expect(screen.queryAllByRole("button")).toHaveLength(1);
  });

  /**
   * Nothing on this chapter opens yet, so nothing may advertise a dialog —
   * announced only where something will actually appear, per `DisclosureBand`.
   * This is what has to change in the same commit as the figure asset.
   */
  it("advertises no dialog, because nothing opens yet", () => {
    render(<RebalancingAgents />);
    expect(screen.getByRole("button")).not.toHaveAttribute("aria-haspopup");
  });
});
