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

/** The line under the three reserved boxes. */
const BOXES_CAPTION = "Click on the boxes to learn more about hemostatic rebalancing agents";

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
   * The colour split is the artboard's whole point on this row: anti-TFPI mAbs
   * in blue, AT-directed siRNA in crimson. The join runs composed-label →
   * mechanism → token, so this asserts an agent lands in its class's colour
   * rather than asserting three hard-coded strings.
   */
  it.each(REBALANCING_AGENTS)("tones $name by its mechanism class", (agent) => {
    render(<RebalancingAgents />);
    const expected = agent.mechanism === "anti-TFPI mAb" ? "text-agent-mab" : "text-agent-sirna";

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

  /**
   * The 2026-08-04 responsive pass ramped the **gap** and left the boxes alone.
   * `lg:gap-x-35.25` put the drawn 141px gap into the column that had just lost
   * 175px to the gutter step, so the row turned on 202px too wide and the boxes
   * shrank to 157 × 192 — 30% under drawn, and portrait where the artboard draws
   * landscape.
   *
   * Both halves are pinned, because either alone reopens it: the `lg` gap must
   * stay at the derived 40 (3 × 224 + 2 × 40 = 752, the `lg` column exactly, so
   * the row turns on where the boxes fit it at full size), and the box must keep
   * its drawn `h-48`/`max-w-56` at every width. A `max-w-*` on the box would let
   * a future gap change resume shrinking it silently, which is why the size is
   * asserted here rather than inferred from the row fitting.
   *
   * jsdom computes no layout, so a class string is the only thing here that can
   * fail; the pixel arithmetic behind these values is unverified (open item 39).
   */
  it("ramps the box row's gap rather than the boxes, which stay drawn-size at every width", () => {
    const { container } = render(<RebalancingAgents />);
    const boxes = [...container.querySelectorAll("div.border-\\[0\\.25rem\\]")];

    expect(boxes).toHaveLength(REBALANCING_AGENTS.length);
    for (const box of boxes) {
      expect(box).toHaveClass("h-48", "max-w-56", "shrink-0", "lg:shrink");
    }

    expect(boxes[0].parentElement).toHaveClass(
      "flex-col",
      "lg:flex-row",
      "lg:gap-x-10",
      "xl:gap-x-35.25",
    );
  });

  /**
   * Every transcribed size on the chapter steps down one below `lg`, page and
   * card alike — asserted in one test because the sizes are one decision (§11's
   * ramp table) rather than six.
   *
   * **This is one of the two chapters whose body copy ramps**, with
   * `prophylaxis-guidance`. §11 pins the other three at 16px because that is a
   * legibility floor with nowhere down to go; these two transcribe their body at
   * 24 off the same measurement (open item 9), so each has exactly one step to
   * give. The card's lead lands on the same 20px the page bullets do — the card
   * body is 303px at 375 against the page's own 311px column, so it may not set
   * larger type than the page that opened it.
   */
  it("steps every transcribed size down one below lg, page and card alike", async () => {
    const user = userEvent.setup();
    const { container } = render(<RebalancingAgents />);

    expect(container.querySelector("section > ul")).toHaveClass("text-xl", "lg:text-2xl");
    expect(screen.getByText(BOXES_CAPTION)).toHaveClass("text-xl", "lg:text-2xl");
    expect(screen.getByText(CAPTION)).toHaveClass("text-xl", "lg:text-2xl");

    const card = within(await openProseCard(user));
    const [lead] = MECHANISMS.body;
    expect(card.getByText(lead as string)).toHaveClass("text-xl", "lg:text-2xl");

    for (const bullet of MECHANISMS.body) {
      if (typeof bullet === "string") continue;

      expect(card.getByRole("heading", { level: 3, name: bullet.text })).toHaveClass(
        "text-2xl",
        "lg:text-3xl",
      );
      expect(card.getByText(bullet.children[0], { selector: "li" }).parentElement).toHaveClass(
        "text-base",
        "lg:text-xl",
      );
    }
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
   * Neither card carries an abbreviation footnote: the prose card lost its gloss
   * on 2026-08-05 (the divergence open item 17 raised), and the figure card lost
   * its own "TFPI = tissue factor pathway inhibitor." on 2026-08-06. CONTEXT.md
   * §7.6 still records the source's gloss, so this is the guard on the deletion
   * being redone from it — a footnote on *either* card fails.
   *
   * Each card's action is asserted beside it because that is the point of the
   * change: the row lost its text and kept its button.
   */
  it("drops the abbreviation footnote from both cards but keeps their actions", async () => {
    const user = userEvent.setup();
    render(<RebalancingAgents />);
    const prose = within(await openProseCard(user));

    expect(prose.queryByText(/=/)).not.toBeInTheDocument();
    expect(prose.getByRole("button", { name: "View mechanism" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "View mechanism" }));
    const figure = within(screen.getByRole("dialog"));

    // Scoped to text nodes: the diagram's own `alt` is not a footnote, and it
    // has no `=` in it either way.
    expect(figure.queryByText(/=/)).not.toBeInTheDocument();
    expect(figure.getByRole("button", { name: `Back to ${PROSE_TITLE}` })).toBeInTheDocument();
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
   * The CTA ramps its inset and its type, which it did not until 2026-08-04: the
   * package ships `px-16` around `text-[26px]`, computing ~358px against a card
   * body of 303px at 375. It never overflowed — `max-w-full` and `break-words`
   * are the component's — so nothing failed; the label just wrapped into the
   * 175px left inside a 303px box.
   *
   * The `px-*` steps are the ones `Landing`'s hero CTA already puts on this same
   * component, reused rather than reinvented. `lg:text-2xl` is asserted because
   * it is the one value in these passes that moves the **canvas** — it finishes
   * §2's 26 → 24 migration on the last 26 this chapter had — and `py-2.5` is
   * what holds the drawn 49px height across that step.
   */
  it("ramps the CTA's inset and type so it fits the card body it lives in", async () => {
    const user = userEvent.setup();
    render(<RebalancingAgents />);
    const card = within(await openProseCard(user));

    expect(card.getByRole("button", { name: "View mechanism" })).toHaveClass(
      "px-8",
      "sm:px-12",
      "lg:px-16",
      "text-xl",
      "lg:text-2xl",
      "py-2.5",
    );
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
