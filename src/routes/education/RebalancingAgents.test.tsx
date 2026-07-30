import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import {
  type Bullet,
  REBALANCING_AGENTS,
  rebalancingAgentLabel,
  topicById,
} from "../../data/education";
import RebalancingAgents from "./RebalancingAgents";

/** The caption beside the `+`, which is also its accessible name. */
const CAPTION = "Mechanisms of hemostatic rebalancing agents within the coagulation cascade";

/** The first card's heading — §7.6's block title, which now lives on its prose. */
const PROSE_TITLE = "Hemostatic Rebalancing Agents in Treatment of HA/HB";

/** The second card's heading — the diagram's own name. */
const FIGURE_TITLE = "Mechanisms of Hemostatic Rebalancing Agents in the Coagulation Cascade";

const MECHANISMS = topicById("rebalancing-mechanisms")!;

/**
 * Every string the prose card renders, headings included — the two lead-ins are
 * `NestedBullet`s, so a flat `body.map()` would miss four of the six.
 */
const MECHANISM_PROSE: string[] = MECHANISMS.body.flatMap((bullet: Bullet) =>
  typeof bullet === "string" ? [bullet] : [bullet.text, ...bullet.children],
);

/** Opens the first card and returns it. */
async function openProseCard(user: ReturnType<typeof userEvent.setup>) {
  await user.click(screen.getByRole("button", { name: `Expand ${CAPTION}` }));
  return screen.getByRole("dialog");
}

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
   * The `<h1>` was a literal while the topic's title carried §7.6's scope
   * qualifier. That qualifier belongs to the *mechanism* prose — §7.6 sets it
   * over exactly those sentences — and the split that made these two topics left
   * it on the wrong one.
   *
   * Pinning both halves is what stops the move being undone one topic at a time:
   * the chapter's title must stay unqualified, and the qualified string must
   * stay on the topic whose card wears it.
   */
  it("keeps §7.6's scope qualifier on the mechanism prose, not on the chapter", () => {
    expect(topicById("rebalancing-agents")!.title).toBe("Hemostatic Rebalancing Agents");
    expect(MECHANISMS.title).toBe(PROSE_TITLE);
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
   * This asserts the split holds from the rendered side: none of it is on the
   * page, and neither is the card's own title, because `Popup`'s children are
   * `undefined` until it opens.
   */
  it("shows none of the mechanism prose or its card title while closed", () => {
    render(<RebalancingAgents />);
    for (const line of MECHANISM_PROSE) {
      expect(screen.queryByText(line)).not.toBeInTheDocument();
    }
    expect(screen.queryByText(PROSE_TITLE)).not.toBeInTheDocument();
  });

  // The caption beside the `+` is also the button's accessible name, which
  // `PopupButton` prefixes with "Expand".
  it("renders the mechanisms disclosure as a trigger with a visible caption", () => {
    render(<RebalancingAgents />);
    expect(screen.getByRole("button", { name: `Expand ${CAPTION}` })).toBeInTheDocument();
    expect(screen.getByText(CAPTION)).toBeInTheDocument();
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
   *
   * Queried by role rather than by selector, as `treatment-landscape` records:
   * `Popup` is mounted unconditionally, so its ✕ is a second `<button>` in the
   * container. Role queries honour the closed dialog's `display: none` and see
   * only what a user can reach.
   */
  it("reserves the figure boxes without announcing or focusing them", () => {
    render(<RebalancingAgents />);

    expect(screen.queryAllByRole("img")).toHaveLength(0);
    // The mechanisms `+`, and nothing else.
    expect(screen.queryAllByRole("button")).toHaveLength(1);
  });

  // The `+` opens a card now, so it advertises one. This is what has to stay in
  // step with the target actually having content behind it.
  it("advertises a dialog on the trigger that opens one", () => {
    render(<RebalancingAgents />);
    expect(screen.getByRole("button")).toHaveAttribute("aria-haspopup", "dialog");
  });

  /**
   * The card is named by §7.6's block heading, not by the §7.7 caption that
   * opens it — the caption-vs-title split `Disclosure` documents. Asserting the
   * whole accessible name is what catches the card being "helpfully" titled with
   * the caption instead.
   */
  it("opens the prose card under §7.6's block heading", async () => {
    const user = userEvent.setup();
    render(<RebalancingAgents />);

    expect(await openProseCard(user)).toHaveAccessibleName(PROSE_TITLE);
  });

  /**
   * The prose card renders its topic's `body` whole, headings included. Asserted
   * from the data rather than from literals so a copy edit lands in one place.
   */
  it("renders the mechanism prose verbatim from the data module", async () => {
    const user = userEvent.setup();
    render(<RebalancingAgents />);
    const card = within(await openProseCard(user));

    for (const line of MECHANISM_PROSE) {
      expect(card.getByText(line)).toBeInTheDocument();
    }
  });

  /**
   * The lead is a paragraph on the artboard and the two lead-ins are headings
   * over their own lists — which is why the topic's `body` was restructured into
   * `NestedBullet`s rather than left flat for the card to split on their colons.
   *
   * This asserts the card dispatches on that shape: a `string` is prose, a
   * `NestedBullet` is a section. It fails if the lead comes back as a bullet, if
   * a heading is rendered as list text, or if a section's children are hoisted
   * out to sit beside it.
   */
  it("renders the lead as a paragraph and each nested bullet as a heading over its own list", async () => {
    const user = userEvent.setup();
    render(<RebalancingAgents />);
    const card = within(await openProseCard(user));

    for (const bullet of MECHANISMS.body) {
      if (typeof bullet === "string") {
        expect(card.getByText(bullet).tagName).toBe("P");
        continue;
      }

      // `<h3>`, because `Popup`'s band is the card's `<h2>`.
      expect(card.getByRole("heading", { level: 3, name: bullet.text })).toBeInTheDocument();
      for (const child of bullet.children) {
        expect(card.getByText(child, { selector: "li" })).toBeInTheDocument();
      }
    }
  });

  /**
   * The prose card glosses all three abbreviations its copy introduces, where
   * the export glosses only AT — a deliberate, recorded divergence
   * (docs/styling.md §11). This is what stops it being quietly reverted to the
   * drawn single line.
   */
  it("glosses all three abbreviations the prose card introduces", async () => {
    const user = userEvent.setup();
    render(<RebalancingAgents />);
    const card = within(await openProseCard(user));

    expect(
      card.getByText(
        "APC = activated protein C; AT = antithrombin; TFPI = tissue factor pathway inhibitor.",
      ),
    ).toBeInTheDocument();
  });

  /**
   * The CTA's copy is sentence case with `uppercase` in CSS, as every shouted
   * string in this codebase is — so the accessible name stays readable.
   */
  it("names the CTA in sentence case, not the uppercase it displays", async () => {
    const user = userEvent.setup();
    render(<RebalancingAgents />);
    const card = within(await openProseCard(user));

    expect(card.getByRole("button", { name: "View mechanism" })).toBeInTheDocument();
  });

  /**
   * The second card replaces the first in the same dialog — one `Popup`, two
   * steps. Both halves matter: the name changes to the figure's own title, and
   * the prose it stepped away from is gone rather than scrolled past.
   */
  it("swaps to the figure card, name and all, when the CTA is clicked", async () => {
    const user = userEvent.setup();
    render(<RebalancingAgents />);
    await openProseCard(user);

    await user.click(screen.getByRole("button", { name: "View mechanism" }));

    const card = screen.getByRole("dialog");
    expect(card).toHaveAccessibleName(FIGURE_TITLE);
    for (const line of MECHANISM_PROSE) {
      expect(within(card).queryByText(line)).not.toBeInTheDocument();
    }
  });

  /**
   * The diagram is image-borne (CONTEXT.md §7.7): its labels are in no text
   * layer, so `alt` is the only route to what it says. An empty one would make
   * the card unreadable to a screen reader, and this is the guard on that — it
   * asserts substance, not a particular sentence, so the description can be
   * improved without editing a test.
   */
  it("describes the diagram, because nothing else does", async () => {
    const user = userEvent.setup();
    render(<RebalancingAgents />);
    await openProseCard(user);
    await user.click(screen.getByRole("button", { name: "View mechanism" }));

    const alt = within(screen.getByRole("dialog")).getByRole("img").getAttribute("alt")!;
    expect(alt.length).toBeGreaterThan(100);
    // The three agents are the point of the diagram; a description that names
    // none of them is describing the cascade rather than this figure. Matched
    // case-insensitively — whether an agent opens a sentence is a fact about
    // the prose, not about whether it is mentioned.
    for (const agent of REBALANCING_AGENTS) {
      expect(alt).toMatch(new RegExp(agent.name, "i"));
    }
  });

  /**
   * Back goes back — it does not close. The arrow's name says where it goes,
   * overriding `NavArrowButton`'s hardcoded "Previous", which means nothing
   * inside a card.
   */
  it("returns to the prose card from the back arrow", async () => {
    const user = userEvent.setup();
    render(<RebalancingAgents />);
    await openProseCard(user);
    await user.click(screen.getByRole("button", { name: "View mechanism" }));

    await user.click(screen.getByRole("button", { name: `Back to ${PROSE_TITLE}` }));

    expect(screen.getByRole("dialog")).toHaveAccessibleName(PROSE_TITLE);
  });

  /**
   * The ✕ closes to the page from *either* card — it is not a second back
   * button. This is the pair the back arrow exists to distinguish itself from,
   * and the easiest thing for a refactor to conflate.
   */
  it("closes to the page from the figure card's ✕, rather than stepping back", async () => {
    const user = userEvent.setup();
    render(<RebalancingAgents />);
    await openProseCard(user);
    await user.click(screen.getByRole("button", { name: "View mechanism" }));

    await user.click(screen.getByRole("button", { name: `Close ${FIGURE_TITLE}` }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    // And the trigger agrees about what is open — the reason it is controlled.
    expect(screen.getByRole("button", { name: `Expand ${CAPTION}` })).toBeInTheDocument();
  });

  /**
   * ESC is the same route out as the ✕, from either card.
   *
   * The `cancel` event is dispatched directly rather than pressed as a key:
   * jsdom implements no dialog behaviour, so no Escape it received would ever
   * produce one — the same call `Popup.test.tsx` makes and records.
   */
  it("closes to the page when the figure card is cancelled with ESC", async () => {
    const user = userEvent.setup();
    render(<RebalancingAgents />);
    await openProseCard(user);
    await user.click(screen.getByRole("button", { name: "View mechanism" }));

    fireEvent(screen.getByRole("dialog"), new Event("cancel", { cancelable: true, bubbles: true }));

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  /**
   * Closing resets the step. The `+` names the §7.7 target as a whole, so a
   * reader who reopens it is asking for that target — not for whichever card
   * they happened to be on when they left.
   */
  it("reopens on the prose card after being closed from the figure card", async () => {
    const user = userEvent.setup();
    render(<RebalancingAgents />);
    await openProseCard(user);
    await user.click(screen.getByRole("button", { name: "View mechanism" }));
    await user.click(screen.getByRole("button", { name: `Close ${FIGURE_TITLE}` }));

    expect(await openProseCard(user)).toHaveAccessibleName(PROSE_TITLE);
  });
});
