import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { topicById } from "../../data/education";
import FviiiaMimetics from "./FviiiaMimetics";

const CHAPTER = topicById("fviiia-mimetics")!;
const EMICIZUMAB = topicById("emicizumab-overview")!;
const DENECIMIG = topicById("denecimig-overview")!;
const NXT007 = topicById("nxt007-overview")!;
const INNO8 = topicById("inno8-overview")!;
/** The figure topics split out of the three overviews; see the data module. */
const MOA = topicById("emicizumab-moa")!;
const DENECIMIG_MOA = topicById("denecimig-moa")!;
const NXT007_STRUCTURE = topicById("nxt007-structure")!;

/** The panel's group heading — a chapter literal, no topic holds it. */
const PANEL_HEADING = "Investigational FVIII mimetic therapies in earlier-stage development:";

/**
 * NXT007's display name — a chapter literal too, and since 2026-08-05 the INN
 * ahead of the code name, where `NXT007.title` still transcribes the source's
 * bare "NXT007". The chapter uses it for both the panel's caption and the card's
 * band, so it is one const here as well; the pair being identical is what makes
 * "Close Zemocimig (NXT007)" ambiguous in the document, and the queries below
 * scope around that.
 */
const NXT007_CAPTION = "Zemocimig (NXT007)";

describe("fviiia-mimetics chapter", () => {
  /**
   * Read by id with non-null assertions in the chapter; a rename in the data
   * module fails here rather than as a render crash.
   */
  it("resolves the topics it reads", () => {
    expect(topicById("fviiia-mimetics")).toBeDefined();
    expect(topicById("emicizumab-overview")).toBeDefined();
    expect(topicById("denecimig-overview")).toBeDefined();
    expect(topicById("nxt007-overview")).toBeDefined();
    expect(topicById("inno8-overview")).toBeDefined();
  });

  it("renders the chapter title in title case, not the uppercase it displays", () => {
    render(<FviiiaMimetics />);
    // `uppercase` is a CSS transform, so the accessible name is unaffected —
    // this asserts the copy was not shouted in the markup, and that the
    // two-tone split did not lose or duplicate a word on the way through.
    expect(screen.getByRole("heading", { level: 1 })).toHaveAccessibleName(CHAPTER.title);
  });

  /**
   * The three two-toned strings, pinned at their split points.
   *
   * The chapter paints a lead and a tail in different colours and finds the
   * boundary by punctuation, so what actually has to hold is that each title
   * still CARRIES that punctuation — a title that lost its colon would render
   * whole in the lead's colour and nothing would otherwise say so.
   *
   * Both markers appear in the Denecimig title and the design breaks on the
   * colon, so the order in `splitTitle` is the fact under test here.
   */
  it("keeps the punctuation its two-tone headings split on", () => {
    expect(CHAPTER.title).toBe(
      "FVIII Mimetic BsAbs: Approved and Emerging Agents for HA Prophylaxis",
    );
    expect(EMICIZUMAB.title).toBe("Emicizumab (FDA-approved)");
    expect(DENECIMIG.title).toBe("Denecimig (Mim8): Investigational currently under FDA review");
    // The paren comes first in the string; the colon is the drawn break.
    expect(DENECIMIG.title.indexOf(" (")).toBeLessThan(DENECIMIG.title.indexOf(": "));
  });

  /**
   * `uppercase` is a CSS transform, so nothing here can be asserted by reading
   * text — what is assertable is that the abbreviation is carried in its own
   * element, which is the only way it can opt out of it. A heading that shouted
   * it would render "BSABS" and destroy it. (`FVIII` needs no such span: every
   * letter of it is already a capital, so the transform is a no-op.)
   */
  it("keeps BsAbs out of the heading's uppercase transform", () => {
    render(<FviiiaMimetics />);
    const heading = screen.getByRole("heading", { level: 1 });

    const span = within(heading).getByText("BsAbs");
    expect(span).toHaveClass("normal-case");
  });

  /**
   * Four bullets, where the Figma export shows five `<li>`s — its last two are
   * one sentence Figma broke across lines. Pinning the count is what stops the
   * drawing being transcribed over the source.
   */
  it("renders the topic's four bullets", () => {
    render(<FviiiaMimetics />);
    expect(CHAPTER.body).toHaveLength(4);
    for (const bullet of CHAPTER.body) {
      expect(screen.getByText(bullet as string)).toBeInTheDocument();
    }
  });

  /**
   * Four disclosures, each named by the words beside it — `PopupButton` prefixes
   * the label with "Expand", and the accessible name has to contain the visible
   * caption (WCAG 2.5.3).
   */
  it("renders a named disclosure for each of the four agents", () => {
    render(<FviiiaMimetics />);
    for (const name of [EMICIZUMAB.title, DENECIMIG.title, NXT007_CAPTION, "Inno8"]) {
      expect(screen.getByRole("button", { name: `Expand ${name}` })).toBeInTheDocument();
    }
  });

  /** The two investigational agents sit inside the panel, under its heading. */
  it("groups NXT007 and Inno8 under the panel heading", () => {
    render(<FviiiaMimetics />);
    const panel = screen.getByRole("region", { name: PANEL_HEADING });

    expect(
      within(panel).getByRole("button", { name: `Expand ${NXT007_CAPTION}` }),
    ).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: "Expand Inno8" })).toBeInTheDocument();
    // The other two are the chapter's, not the panel's.
    expect(
      within(panel).queryByRole("button", { name: `Expand ${EMICIZUMAB.title}` }),
    ).not.toBeInTheDocument();
  });

  /**
   * One open at a time — the disclosures' own state, which the cards read rather
   * than replace.
   *
   * Scoped to the panel, and that is not decoration: NXT007's card is the one
   * whose band draws exactly the panel's caption for it, so with the card up the
   * document holds two buttons named "Close Zemocimig (NXT007)" — this
   * disclosure and the card's ✕. `within(panel)` is what keeps this asserting on
   * the disclosure.
   */
  it("shows at most one disclosure open at a time", async () => {
    const user = userEvent.setup();
    render(<FviiiaMimetics />);
    const panel = screen.getByRole("region", { name: PANEL_HEADING });

    await user.click(within(panel).getByRole("button", { name: `Expand ${NXT007_CAPTION}` }));
    expect(
      within(panel).getByRole("button", { name: `Close ${NXT007_CAPTION}` }),
    ).toBeInTheDocument();

    await user.click(within(panel).getByRole("button", { name: "Expand Inno8" }));
    expect(within(panel).getByRole("button", { name: "Close Inno8" })).toBeInTheDocument();
    expect(
      within(panel).getByRole("button", { name: `Expand ${NXT007_CAPTION}` }),
    ).toBeInTheDocument();

    // Clicking the open one closes it, leaving all four shut.
    await user.click(within(panel).getByRole("button", { name: "Close Inno8" }));
    expect(screen.queryByRole("button", { name: /^Close / })).not.toBeInTheDocument();
  });

  /**
   * `aria-haspopup` is a promise, and with Pop up 13 built all four disclosures
   * can finally keep it. This chapter shipped three commits with the attribute
   * withheld from whichever card did not exist yet — announcing a dialog that
   * never appears is worse than announcing nothing, which is the reason
   * `DisclosureBand` makes it conditional too.
   *
   * Still asserted on all four rather than deleted as trivially true: what it
   * pins is that the attribute tracks the cards, so a fifth agent's disclosure
   * added ahead of its card fails here rather than shipping a silent promise.
   */
  it("promises a dialog on every disclosure that opens one", () => {
    render(<FviiiaMimetics />);

    for (const name of [
      `Expand ${EMICIZUMAB.title}`,
      `Expand ${DENECIMIG.title}`,
      `Expand ${NXT007_CAPTION}`,
      "Expand Inno8",
    ]) {
      expect(screen.getByRole("button", { name })).toHaveAttribute("aria-haspopup", "dialog");
    }
  });
});

/**
 * Pop up 10 — the first of the two cards the designer has delivered.
 *
 * `hidden: true` on every dialog query: jsdom implements `showModal()` but not
 * the top layer, so a closed `<dialog>` is `display: none` and an open one is
 * still not exposed the way a real UA exposes it. The chapter's other tests use
 * accessible names, which is what actually distinguishes the two cards here.
 */
describe("the Emicizumab card", () => {
  const dialogs = () => screen.getAllByRole("dialog", { hidden: true });

  /**
   * The card, then the enlarged figure nested inside it. DOM order, because the
   * figure's `<dialog>` is a descendant of the card's — which is also the whole
   * reason the card survives the figure closing.
   *
   * The Denecimig card is mounted too, but its children are `undefined` while it
   * is shut, so it contributes exactly one empty dialog *after* these two. The
   * indices are therefore unaffected by a sibling card existing.
   *
   * **`open` is what "showing" means here**, not presence in the document.
   * `ExpandableFigure` mounts its `Popup` with children unconditionally, so the
   * figure card's markup exists from the moment the Emicizumab card opens; the
   * UA hides it with `display: none` until `showModal()` runs. Asserting on text
   * being in the document would therefore pass in both states.
   */
  const card = () => dialogs()[0];
  const figure = () => dialogs()[1];

  const open = async (user: ReturnType<typeof userEvent.setup>) => {
    render(<FviiiaMimetics />);
    await user.click(screen.getByRole("button", { name: `Expand ${EMICIZUMAB.title}` }));
  };

  it("resolves the MOA topic split out of the overview", () => {
    expect(topicById("emicizumab-moa")).toBeDefined();
  });

  /**
   * The card's band drops the regulatory status the `+` beside it states — the
   * caption-vs-title split `rebalancing-agents` records. Pinned because the
   * title is a chapter literal, so nothing else would notice it drifting toward
   * the topic's own title.
   */
  it("opens a dialog named for the agent alone, not its status", async () => {
    const user = userEvent.setup();
    await open(user);

    expect(card()).toHaveAccessibleName("Emicizumab");
    expect(EMICIZUMAB.title).toBe("Emicizumab (FDA-approved)");
  });

  /**
   * Three bullets, where this topic carried four until the MOA sentence was
   * split onto the figure. The count is the fact under test: the chapter renders
   * `body` whole, so a fourth bullet reappearing here means the split leaked
   * rather than that the card grew a line.
   *
   * The sentence itself is pinned to the figure card rather than merely absent —
   * "not in the bullets" would also pass if it were rendered nowhere at all, and
   * the point of the split is that it moved rather than that it was dropped.
   */
  it("renders the three drawn bullets, with the MOA sentence on the figure", async () => {
    const user = userEvent.setup();
    await open(user);

    expect(EMICIZUMAB.body).toHaveLength(3);
    for (const bullet of EMICIZUMAB.body) {
      expect(screen.getByText(bullet as string)).toBeInTheDocument();
    }
    expect(figure()).toContainElement(screen.getByText(MOA.body[0] as string));
  });

  /** The diagram is a control, named the way every other expandable figure is. */
  it("offers the diagram as an expandable figure", async () => {
    const user = userEvent.setup();
    await open(user);

    expect(screen.getByRole("button", { name: `Expand ${MOA.title}` })).toBeInTheDocument();
  });

  /**
   * **The requirement this card was built around.** The enlarged diagram is a
   * second `<dialog>` nested inside the first, and closing it must leave the
   * Emicizumab card standing — a reader who enlarges the picture and dismisses
   * it should be back on the card, not back on the chapter.
   *
   * Two independent things make that true and both are asserted here: the ✕
   * inside the figure card closes only its own dialog, and the Emicizumab card
   * is still open and still showing its bullets afterwards.
   */
  it("closes the enlarged diagram without closing the card behind it", async () => {
    const user = userEvent.setup();
    await open(user);

    await user.click(screen.getByRole("button", { name: `Expand ${MOA.title}` }));
    expect(figure()).toHaveAttribute("open");
    expect(card()).toHaveAttribute("open");

    await user.click(screen.getByRole("button", { name: `Close ${MOA.title}` }));

    // The figure has closed…
    expect(figure()).not.toHaveAttribute("open");
    // …and the card has not: its own ✕ and the `+` that opened it both still
    // read as open, which is the state a reader is looking at.
    expect(card()).toHaveAttribute("open");
    expect(screen.getByRole("button", { name: "Close Emicizumab" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: `Close ${EMICIZUMAB.title}` })).toBeInTheDocument();
  });

  /**
   * ESC peels one layer, not both — and this one needed a fix rather than
   * falling out of the platform.
   *
   * Chrome puts nested dialogs in a single CloseWatcher *group*, so its own ESC
   * closed the card and the figure together; verified in Chromium, where exactly
   * one `cancel` fired (on the inner dialog) and both ended up shut. There is no
   * outer `cancel` to preventDefault, so `ModalLayer` handles the keydown ahead
   * of the platform instead — see the comment there.
   *
   * jsdom implements neither dialogs nor CloseWatcher, so what this can assert
   * is the half the fix owns: the keypress reaches the inner layer's handler and
   * `stopPropagation` keeps it from also running the card's. That is exactly the
   * regression a future refactor would reintroduce by dropping either call.
   */
  it("closes the enlarged diagram on ESC without closing the card behind it", async () => {
    const user = userEvent.setup();
    await open(user);
    await user.click(screen.getByRole("button", { name: `Expand ${MOA.title}` }));

    fireEvent.keyDown(figure(), { key: "Escape" });

    expect(figure()).not.toHaveAttribute("open");
    expect(card()).toHaveAttribute("open");
  });

  /**
   * The outer card's backdrop guard is what a click on the inner dialog has to
   * survive: `Popup` closes on a click whose target IS its own layer, and the
   * nested dialog is a descendant of that layer rather than the layer itself.
   * Without the `target === currentTarget` test, dismissing the enlarged figure
   * by its backdrop would take the card with it.
   */
  it("keeps the card open when the enlarged diagram's backdrop is clicked", async () => {
    const user = userEvent.setup();
    await open(user);
    await user.click(screen.getByRole("button", { name: `Expand ${MOA.title}` }));

    // The inner dialog's own layer — the element a backdrop click targets.
    await user.click(figure());

    expect(figure()).not.toHaveAttribute("open");
    expect(card()).toHaveAttribute("open");
  });

  /**
   * The enlargement is **bare**: the picture on the scrim, no band and no border
   * (`ExpandableFigure`'s `variant="bare"`).
   *
   * Both halves matter. No heading is the visible fact — a card would paint the
   * title and stack a second ✕ under the one already on screen. Still having an
   * accessible name is what stops that being a regression: with no band there is
   * no text to name the dialog from, so `Lightbox` labels it directly, and a
   * screen-reader user hears the same string the trigger promised.
   */
  it("enlarges bare — no heading, but still named", async () => {
    const user = userEvent.setup();
    await open(user);
    await user.click(screen.getByRole("button", { name: `Expand ${MOA.title}` }));

    expect(within(figure()).queryByRole("heading")).not.toBeInTheDocument();
    expect(figure()).toHaveAccessibleName(MOA.title);
    // The card behind it still has its band, so the page has exactly one.
    expect(within(card()).getByRole("heading", { name: "Emicizumab" })).toBeInTheDocument();
  });
});

/**
 * Pop up 11 — the second delivered card, and the second `Popup` mounted by the
 * chapter.
 *
 * The indices shift by one against the Emicizumab block above, and that shift is
 * the structure rather than an accident: the Emicizumab card mounts first and
 * stands empty while this one is open, so the dialogs are [emicizumab (empty),
 * denecimig, denecimig's figure, nxt007 (empty)] in DOM order. The empty mounts
 * that come *after* cannot move these two.
 */
describe("the Denecimig card", () => {
  const dialogs = () => screen.getAllByRole("dialog", { hidden: true });
  const card = () => dialogs()[1];
  const figure = () => dialogs()[2];

  const open = async (user: ReturnType<typeof userEvent.setup>) => {
    render(<FviiiaMimetics />);
    await user.click(screen.getByRole("button", { name: `Expand ${DENECIMIG.title}` }));
  };

  it("resolves the MOA topic split out of the overview", () => {
    expect(topicById("denecimig-moa")).toBeDefined();
  });

  /** Same caption-vs-title split the Emicizumab card records; same reason. */
  it("opens a dialog named for the agent alone, not its status", async () => {
    const user = userEvent.setup();
    await open(user);

    expect(card()).toHaveAccessibleName("Denecimig (Mim8)");
    expect(DENECIMIG.title).toBe("Denecimig (Mim8): Investigational currently under FDA review");
  });

  /**
   * Four bullets at the left, and the split's two under the diagram.
   *
   * The counts are the fact under test, exactly as on the Emicizumab card: both
   * columns render a `body` whole, so a bullet reappearing on the wrong side
   * means the split leaked rather than that a card grew a line. Pinned to the
   * figure column rather than merely absent from the left — the point is that
   * the two sentences moved, not that they were dropped.
   *
   * The nested FRONTIER bullet is a `NestedBullet`, so its `text` is what the
   * left column draws and its three children hang under it; asserted below.
   */
  it("renders four bullets at the left and the MOA pair under the diagram", async () => {
    const user = userEvent.setup();
    await open(user);

    expect(DENECIMIG.body).toHaveLength(4);
    expect(DENECIMIG_MOA.body).toHaveLength(2);

    for (const bullet of DENECIMIG.body) {
      const text = typeof bullet === "string" ? bullet : bullet.text;
      expect(within(card()).getByText(text)).toBeInTheDocument();
    }
    for (const sentence of DENECIMIG_MOA.body) {
      expect(within(card()).getByText(sentence as string)).toBeInTheDocument();
    }
  });

  /**
   * The three FRONTIER trials are a real sub-list, not three indented siblings —
   * a screen reader announces the nesting's depth and count, which is the whole
   * reason `NestedBullet` exists rather than a CSS class on positions 4–6.
   */
  it("nests the three FRONTIER trials under the bullet that introduces them", async () => {
    const user = userEvent.setup();
    await open(user);

    const frontier = DENECIMIG.body[2];
    expect(typeof frontier).not.toBe("string");
    if (typeof frontier === "string") return;

    // The `<li>` carrying the lead line, and the sub-list inside it.
    const item = within(card()).getByText(frontier.text).closest("li")!;
    for (const child of frontier.children) {
      expect(within(item).getByText(child)).toBeInTheDocument();
    }
    expect(frontier.children).toHaveLength(3);
  });

  /**
   * The card opens with the artboard's class-level MOA sentence — the one §7.5
   * authors for emicizumab and this card nonetheless draws first.
   *
   * Pinned as an equality against `emicizumab-moa` rather than as a literal: the
   * two topics state the same fact from two sources, and what would actually go
   * wrong is someone "de-duplicating" them into one shared constant. This fails
   * only if the strings diverge, which is the signal that the transcription was
   * edited on one side.
   */
  it("opens with the class-level MOA sentence the artboard draws", async () => {
    const user = userEvent.setup();
    await open(user);

    expect(DENECIMIG.body[0]).toBe(MOA.body[0]);
    expect(within(card()).getByText(DENECIMIG.body[0] as string)).toBeInTheDocument();
  });

  /** The panel is a control, named the way every other expandable figure is. */
  it("offers the diagram as an expandable figure", async () => {
    const user = userEvent.setup();
    await open(user);

    expect(
      screen.getByRole("button", { name: `Expand ${DENECIMIG_MOA.title}` }),
    ).toBeInTheDocument();
  });

  /**
   * The enlargement is **bare and carries no caption** — the picture alone.
   *
   * Two facts, and the second is this card's own. No heading is the `variant`
   * (the raster paints its own title, so a band would state it twice). No prose
   * beneath is the deliberate difference from Pop up 10, whose caption renders
   * nowhere else: these two sentences are already in the card behind the scrim,
   * so repeating them would only shrink the diagram.
   */
  it("enlarges bare, with no caption repeated from the card", async () => {
    const user = userEvent.setup();
    await open(user);
    await user.click(screen.getByRole("button", { name: `Expand ${DENECIMIG_MOA.title}` }));

    expect(within(figure()).queryByRole("heading")).not.toBeInTheDocument();
    expect(figure()).toHaveAccessibleName(DENECIMIG_MOA.title);
    for (const sentence of DENECIMIG_MOA.body) {
      expect(within(figure()).queryByText(sentence as string)).not.toBeInTheDocument();
    }
  });

  /**
   * The nesting guarantee, on this card as on the other: enlarging the panel and
   * dismissing it leaves the reader on the card, not back on the chapter.
   */
  it("closes the enlarged diagram without closing the card behind it", async () => {
    const user = userEvent.setup();
    await open(user);

    await user.click(screen.getByRole("button", { name: `Expand ${DENECIMIG_MOA.title}` }));
    expect(figure()).toHaveAttribute("open");
    expect(card()).toHaveAttribute("open");

    fireEvent.keyDown(figure(), { key: "Escape" });

    expect(figure()).not.toHaveAttribute("open");
    expect(card()).toHaveAttribute("open");
    expect(screen.getByRole("button", { name: "Close Denecimig (Mim8)" })).toBeInTheDocument();
  });

  /**
   * The two cards cannot be up at once. That is `openId` being one id rather
   * than four booleans — and with two `Popup`s mounted side by side it is worth
   * pinning, since nothing in the markup would otherwise stop both opening.
   */
  it("closes the Emicizumab card when Denecimig is opened", async () => {
    const user = userEvent.setup();
    render(<FviiiaMimetics />);

    await user.click(screen.getByRole("button", { name: `Expand ${EMICIZUMAB.title}` }));
    expect(dialogs()[0]).toHaveAttribute("open");

    await user.click(screen.getByRole("button", { name: `Expand ${DENECIMIG.title}` }));
    expect(dialogs()[0]).not.toHaveAttribute("open");
    expect(card()).toHaveAttribute("open");
  });
});

/**
 * Pop up 12 — the third delivered card, and the chapter's third `Popup`.
 *
 * Two empty mounts precede it while it is open, so the dialogs are [emicizumab
 * (empty), denecimig (empty), nxt007, nxt007's figure] in DOM order.
 */
describe("the NXT007 card", () => {
  const dialogs = () => screen.getAllByRole("dialog", { hidden: true });
  const card = () => dialogs()[2];
  const figure = () => dialogs()[3];

  /**
   * The panel's disclosure, not the card's ✕ — the two share the name "Close
   * Zemocimig (NXT007)" once the card is up, which is the collision the
   * chapter's own one-open-at-a-time test scopes around.
   */
  const disclosure = (name: string) =>
    within(screen.getByRole("region", { name: PANEL_HEADING })).getByRole("button", { name });

  const open = async (user: ReturnType<typeof userEvent.setup>) => {
    render(<FviiiaMimetics />);
    await user.click(disclosure(`Expand ${NXT007_CAPTION}`));
  };

  it("resolves the structure topic split out of the overview", () => {
    expect(topicById("nxt007-structure")).toBeDefined();
  });

  /**
   * **The one card whose band and whose `+` say the same thing.** The other two
   * agents shed a regulatory status on the way into the dialog; this one has none
   * to shed, so the caption-vs-title split collapses — and that collapse is worth
   * pinning, because it is what makes "Close Zemocimig (NXT007)" ambiguous in the
   * document and would otherwise be rediscovered as a flaky query.
   *
   * The name is the chapter's display literal, NOT `NXT007.title`: the client's
   * INN went on both the button and the band on 2026-08-05, where the data
   * module still transcribes the source's bare code name. Both are asserted, so
   * a "fix" that pushes the display name back into the topic fails here.
   */
  it("opens a dialog named exactly as the panel's caption for it", async () => {
    const user = userEvent.setup();
    await open(user);

    expect(card()).toHaveAccessibleName(NXT007_CAPTION);
    expect(NXT007.title).toBe("NXT007");
    expect(NXT007_CAPTION).toContain(NXT007.title);
    expect(screen.getAllByRole("button", { name: `Close ${NXT007_CAPTION}` })).toHaveLength(2);
  });

  /**
   * Three bullets at the left, and the split's one sentence under the diagram.
   *
   * The counts are the fact under test, as on both other cards: each column
   * renders a `body` whole, so a bullet reappearing on the wrong side means the
   * split leaked rather than that a card grew a line. The sentence is pinned to
   * the figure column rather than merely absent from the left — the point of the
   * split is that it moved, not that it was dropped.
   */
  it("renders three bullets at the left and the structure sentence under the panel", async () => {
    const user = userEvent.setup();
    await open(user);

    expect(NXT007.body).toHaveLength(3);
    expect(NXT007_STRUCTURE.body).toHaveLength(1);

    for (const bullet of NXT007.body) {
      const text = typeof bullet === "string" ? bullet : bullet.text;
      expect(within(card()).getByText(text)).toBeInTheDocument();
    }
    expect(within(card()).getByText(NXT007_STRUCTURE.body[0] as string)).toBeInTheDocument();
  });

  /**
   * The two trials are a real sub-list, not two indented siblings — a screen
   * reader announces the nesting's depth and count, which is why `NestedBullet`
   * exists rather than a CSS class on positions 3–4.
   */
  it("nests the two trials under the bullet that introduces them", async () => {
    const user = userEvent.setup();
    await open(user);

    const trials = NXT007.body[2];
    expect(typeof trials).not.toBe("string");
    if (typeof trials === "string") return;

    const item = within(card()).getByText(trials.text).closest("li")!;
    for (const child of trials.children) {
      expect(within(item).getByText(child)).toBeInTheDocument();
    }
    expect(trials.children).toHaveLength(2);
  });

  /**
   * The artboard drops the "NXT007" the source puts in front of two of these
   * bullets, because the band already says it. Pinned as a prefix assertion
   * rather than as two literals: what would actually go wrong is someone
   * "restoring" the source's wording, and this fails on that without also
   * failing on a copy edit inside the sentence.
   */
  it("drops the agent prefix the card's band already states", async () => {
    const user = userEvent.setup();
    await open(user);

    for (const bullet of NXT007.body) {
      const text = typeof bullet === "string" ? bullet : bullet.text;
      expect(text.startsWith("NXT007")).toBe(false);
    }
    // The card names the agent exactly once, in its band — under the display
    // name, which carries the code name the bullets shed.
    expect(within(card()).getByRole("heading", { name: NXT007_CAPTION })).toBeInTheDocument();
  });

  /** The panel is a control, named the way every other expandable figure is. */
  it("offers the structure diagram as an expandable figure", async () => {
    const user = userEvent.setup();
    await open(user);

    expect(
      screen.getByRole("button", { name: `Expand ${NXT007_STRUCTURE.title}` }),
    ).toBeInTheDocument();
  });

  /**
   * The enlargement is **bare and carries no caption** — the picture alone, as on
   * the Denecimig card and for its two reasons: the raster paints its own
   * heading, so a band would state the title twice, and the sentence beneath is
   * already in the card behind the scrim.
   */
  it("enlarges bare, with no caption repeated from the card", async () => {
    const user = userEvent.setup();
    await open(user);
    await user.click(screen.getByRole("button", { name: `Expand ${NXT007_STRUCTURE.title}` }));

    expect(within(figure()).queryByRole("heading")).not.toBeInTheDocument();
    expect(figure()).toHaveAccessibleName(NXT007_STRUCTURE.title);
    expect(
      within(figure()).queryByText(NXT007_STRUCTURE.body[0] as string),
    ).not.toBeInTheDocument();
  });

  /**
   * The nesting guarantee, on this card as on the other two: enlarging the panel
   * and dismissing it leaves the reader on the card, not back on the chapter.
   */
  it("closes the enlarged diagram without closing the card behind it", async () => {
    const user = userEvent.setup();
    await open(user);

    await user.click(screen.getByRole("button", { name: `Expand ${NXT007_STRUCTURE.title}` }));
    expect(figure()).toHaveAttribute("open");
    expect(card()).toHaveAttribute("open");

    fireEvent.keyDown(figure(), { key: "Escape" });

    expect(figure()).not.toHaveAttribute("open");
    expect(card()).toHaveAttribute("open");
    expect(disclosure(`Close ${NXT007_CAPTION}`)).toBeInTheDocument();
  });

  /** The three cards cannot be up at once; see the Denecimig block's own pin. */
  it("closes the Denecimig card when NXT007 is opened", async () => {
    const user = userEvent.setup();
    render(<FviiiaMimetics />);

    await user.click(screen.getByRole("button", { name: `Expand ${DENECIMIG.title}` }));
    expect(dialogs()[1]).toHaveAttribute("open");

    await user.click(disclosure(`Expand ${NXT007_CAPTION}`));
    expect(dialogs()[1]).not.toHaveAttribute("open");
    expect(card()).toHaveAttribute("open");
  });
});

/**
 * Pop up 13 — the last of the four, and the chapter's fourth `Popup`.
 *
 * Three empty mounts precede it while it is open, so the dialogs are [emicizumab
 * (empty), denecimig (empty), nxt007 (empty), inno8, inno8's figure] in DOM
 * order.
 */
describe("the Inno8 card", () => {
  const dialogs = () => screen.getAllByRole("dialog", { hidden: true });
  const card = () => dialogs()[3];
  const figure = () => dialogs()[4];

  /** The source's caption for the diagram, stated in the chapter; see there. */
  const FIGURE_TITLE = "Inno8 Mechanism of Action";

  /** The panel's disclosure — see the NXT007 block, which needs the same scope. */
  const disclosure = (name: string) =>
    within(screen.getByRole("region", { name: PANEL_HEADING })).getByRole("button", { name });

  const open = async (user: ReturnType<typeof userEvent.setup>) => {
    render(<FviiiaMimetics />);
    await user.click(disclosure("Expand Inno8"));
  };

  /**
   * **No figure topic split off this overview**, where the other three cards each
   * needed one. This card draws no prose under its panel, so there is nothing to
   * move; asserted as an absence because the split is the pattern a reader of the
   * other three would expect to find repeated here.
   */
  it("reads one topic, with no figure topic split off it", () => {
    expect(topicById("inno8-overview")).toBeDefined();
    expect(topicById("inno8-moa")).toBeUndefined();
  });

  /**
   * The caption-vs-title split at its widest in this chapter: the `+` says
   * "Inno8" and the band says what Inno8 is. Pinned on both sides — the panel's
   * caption is a chapter literal and the band reads the topic, so nothing else
   * would notice the two converging.
   */
  it("opens a dialog named by the topic, not by the panel's one-word caption", async () => {
    const user = userEvent.setup();
    await open(user);

    expect(card()).toHaveAccessibleName("Inno8: Oral FVIII Mimetic for HA");
    expect(INNO8.title).toBe("Inno8: Oral FVIII Mimetic for HA");
    expect(disclosure("Close Inno8")).toBeInTheDocument();
  });

  /**
   * The band shouts everything except the agent's name, which is what the
   * artboard draws — so "Inno8" is carried in its own element to opt out of the
   * `uppercase`. Nothing about this is assertable by reading text: `uppercase` is
   * a CSS transform, and the element is the only mechanism.
   *
   * It is the band's only cased term since the 2026-08-05 terminology pass —
   * "FVIIIa Mimetic" became "FVIII Mimetic", every letter of which is already a
   * capital, so the transform has nothing left to destroy there.
   *
   * The sibling card lands the other way on the same authority — the designer
   * shouts "MIM8" — which is why this is worth pinning rather than reading as a
   * general rule about product names.
   */
  it("keeps Inno8 out of the band's uppercase transform", async () => {
    const user = userEvent.setup();
    await open(user);
    const band = within(card()).getByRole("heading", { name: INNO8.title });

    expect(within(band).getByText("Inno8")).toHaveClass("normal-case");
  });

  /**
   * Two bullets, both of which the artboard strips an "Inno8" off — the call
   * `NXT007` records one card earlier, and on the same authority.
   *
   * A prefix assertion rather than two literals, for that card's reason: what
   * would actually go wrong is someone "restoring" the source's wording, and this
   * fails on that without also failing on a copy edit inside the sentence.
   */
  it("renders both bullets with the agent prefix the band already states dropped", async () => {
    const user = userEvent.setup();
    await open(user);

    expect(INNO8.body).toHaveLength(2);
    for (const bullet of INNO8.body) {
      const text = typeof bullet === "string" ? bullet : bullet.text;
      expect(text.startsWith("Inno8")).toBe(false);
      expect(within(card()).getByText(text)).toBeInTheDocument();
    }
    // The card names the agent exactly once, in its band.
    expect(within(card()).getByRole("heading", { name: INNO8.title })).toBeInTheDocument();
  });

  /**
   * The panel is a control, named the way every other expandable figure is — and
   * named from the *source's* caption rather than the thirteen-word heading baked
   * into the raster, which reaches the reader through `alt` instead.
   */
  it("offers the diagram as an expandable figure", async () => {
    const user = userEvent.setup();
    await open(user);

    expect(screen.getByRole("button", { name: `Expand ${FIGURE_TITLE}` })).toBeInTheDocument();
    expect(INNO8.figures?.[0]).toBe(FIGURE_TITLE);
  });

  /**
   * The enlargement is **bare** — the picture on the scrim, no band and no
   * second ✕ — and still named, which is `Lightbox` labelling the dialog
   * directly where there is no heading to name it from.
   */
  it("enlarges bare, but still named", async () => {
    const user = userEvent.setup();
    await open(user);
    await user.click(screen.getByRole("button", { name: `Expand ${FIGURE_TITLE}` }));

    expect(within(figure()).queryByRole("heading")).not.toBeInTheDocument();
    expect(figure()).toHaveAccessibleName(FIGURE_TITLE);
  });

  /**
   * The nesting guarantee, on this card as on the other three: enlarging the
   * panel and dismissing it leaves the reader on the card, not back on the
   * chapter.
   */
  it("closes the enlarged diagram without closing the card behind it", async () => {
    const user = userEvent.setup();
    await open(user);

    await user.click(screen.getByRole("button", { name: `Expand ${FIGURE_TITLE}` }));
    expect(figure()).toHaveAttribute("open");
    expect(card()).toHaveAttribute("open");

    fireEvent.keyDown(figure(), { key: "Escape" });

    expect(figure()).not.toHaveAttribute("open");
    expect(card()).toHaveAttribute("open");
    expect(disclosure("Close Inno8")).toBeInTheDocument();
  });

  /** The four cards cannot be up at once; see the Denecimig block's own pin. */
  it("closes the NXT007 card when Inno8 is opened", async () => {
    const user = userEvent.setup();
    render(<FviiiaMimetics />);

    await user.click(disclosure(`Expand ${NXT007_CAPTION}`));
    expect(dialogs()[2]).toHaveAttribute("open");

    await user.click(disclosure("Expand Inno8"));
    expect(dialogs()[2]).not.toHaveAttribute("open");
    expect(card()).toHaveAttribute("open");
  });
});

/**
 * The responsive pass of 2026-08-05 — docs/styling.md §11.
 *
 * jsdom computes no layout, so a class string is the only thing in this block
 * that can fail; every pixel behind these values is arithmetic off the tokens
 * and the artboard, and open item 44 records it as unverified.
 */
describe("fviiia-mimetics — the responsive pass", () => {
  /** The bottom half's three boxes, reached through the one with a name. */
  const bottomHalf = () => {
    const panel = screen.getByRole("region", { name: PANEL_HEADING });
    return { panel, list: panel.previousElementSibling!, row: panel.parentElement! };
  };

  /**
   * **The pass's whole finding, in one assertion.** The row as drawn is 1122px
   * — 78 of indent, a 288px caption, `gap-4`, the package's `shrink-0` 65px
   * button, then the 675px panel — against content columns of 752 at `lg` and
   * 1008 at `xl` (§12), so it fits only at a 1394px viewport. As `lg:flex-row`
   * it overflowed its column by ~285px at 1024, which is `rebalancing-agents`'
   * failure on the same pixel.
   *
   * Both halves are pinned because either alone reopens it: the row must turn on
   * at `xl` and NOT at `lg`, the left group must stay `shrink-0` so the captions
   * keep the measure that produces their drawn line breaks, and the panel must
   * NOT be `shrink-0`, since it is the axis that absorbs the deficit (558px at
   * 1280, the drawn 675 from 1397).
   */
  it("turns the bottom half's row on at xl, with the panel as the axis that gives", () => {
    render(<FviiiaMimetics />);
    const { panel, list, row } = bottomHalf();

    expect(row).toHaveClass("flex-col", "xl:flex-row");
    expect(row).not.toHaveClass("lg:flex-row");

    expect(list).toHaveClass("xl:basis-112.5", "xl:shrink-0", "xl:ps-19.5");

    expect(panel).toHaveClass("grow", "xl:w-168.75", "xl:grow-0");
    expect(panel).not.toHaveClass("shrink-0");
    expect(panel).not.toHaveClass("lg:shrink-0");
  });

  /**
   * The radius keeps `lg` while the layout moves to `xl` — two questions, two
   * breakpoints. Between them the panel is full-width, 752 to 1008px, i.e. wider
   * than the 675 the drawn 117px corner was measured on.
   */
  it("keeps the panel's radius on its own breakpoint", () => {
    render(<FviiiaMimetics />);
    expect(bottomHalf().panel).toHaveClass("rounded-tl-[3.75rem]", "lg:rounded-tl-[7.3125rem]");
  });

  /**
   * Below `xl` the 78px indent is gone and the pairs sit under full-width prose,
   * so they centre on the panel beneath them rather than hugging a gutter the
   * artboard never drew them against. Invented, like the panel's small-screen
   * radius.
   */
  it("centres the two left pairs below xl, and left-aligns them above", () => {
    render(<FviiiaMimetics />);
    expect(bottomHalf().list).toHaveClass("items-center", "xl:items-start");
  });

  /**
   * **Below `sm` every pair is a column, centred** — all four, since they share
   * one `Disclosure`. Side by side they need 369px (the caption's drawn 288, plus
   * `gap-4` and the package's 65px button) where a 375px phone gives the content
   * column 311, so the caption was being squeezed to 230 and losing the line
   * breaks its `w-72` measure exists to produce.
   *
   * `items-center` is asserted with the direction because it is doing two jobs at
   * once: centring the two boxes in the column below `sm`, and centring the
   * caption against the button above it.
   */
  it("stacks each caption over its + below sm, centred", () => {
    render(<FviiiaMimetics />);
    const { panel, list } = bottomHalf();

    const pairs = [...list.querySelectorAll("li"), ...panel.querySelectorAll("li")];
    expect(pairs).toHaveLength(4);
    for (const pair of pairs) {
      expect(pair).toHaveClass("flex-col", "items-center", "sm:flex-row");
    }
  });

  /**
   * Every transcribed size on the page steps down one below `lg`, asserted
   * together because it is one decision rather than four.
   *
   * **This chapter is the fourth case of §2's body-copy exception**, with
   * `rebalancing-agents`, `prophylaxis-guidance` and `/wizard/scenario`: those
   * four transcribe their body at their artboards' 26px, so each has exactly one
   * step to give, where the other chapters sit on the 16px legibility floor.
   *
   * The two leadings are pinned as **ratios** because that is what survives a
   * size step: `leading-7.5` and `leading-6.5` were the drawn 30px and 26px, and
   * held against 20px type they would have rendered 1.5 and 1.3. Both ratios are
   * what the absolute values already rendered at `text-2xl`, so nothing moves at
   * 1440.
   */
  it("steps every transcribed size on the page down one below lg", () => {
    render(<FviiiaMimetics />);
    const { panel, list } = bottomHalf();

    expect(screen.getByRole("heading", { level: 1 })).toHaveClass("text-3xl", "lg:text-5xl");
    expect(screen.getByText(CHAPTER.body[0] as string).closest("ul")).toHaveClass(
      "text-xl",
      "lg:text-2xl",
    );

    const captions = [...list.querySelectorAll("p")];
    expect(captions).toHaveLength(2);
    for (const caption of captions) {
      expect(caption).toHaveClass("text-xl", "leading-tight", "lg:text-2xl");
    }

    expect(within(panel).getByRole("heading", { level: 2 })).toHaveClass(
      "text-xl",
      "leading-[1.08]",
      "lg:text-2xl",
    );
    for (const name of [NXT007_CAPTION, "Inno8"]) {
      expect(within(panel).getByText(name)).toHaveClass("text-xl", "leading-[1.08]", "lg:text-2xl");
    }
  });

  /**
   * The three two-column cards stack at `xl` too, and for a related reason: both
   * `Popup` widths are viewport-bound (`92vw`, and `96vw` for `wide`), so at 1024
   * the split turned on while the card was at its narrowest. It left the prose
   * 308px on Emicizumab, 332 on NXT007 and **241** on Denecimig — the chapter's
   * `wide` card, widened for a prose column that the extra width does not reach
   * below ~1417px.
   *
   * Each card's body type steps 20 → 16 below `lg` on `BenefitsChallengesCard`'s
   * rule: at 375 a `default` card's body is 303px against the page's own 311px
   * column, and a card may not set larger body type than the page that opened it
   * in a narrower measure.
   */
  it.each([
    [`Expand ${EMICIZUMAB.title}`, 0],
    [`Expand ${DENECIMIG.title}`, 1],
    [`Expand ${NXT007_CAPTION}`, 2],
  ])("stacks the %s card at xl and steps its body to 16px below lg", async (name, index) => {
    const user = userEvent.setup();
    render(<FviiiaMimetics />);
    await user.click(screen.getByRole("button", { name }));

    const card = screen.getAllByRole("dialog", { hidden: true })[index];
    const bullets = card.querySelector("ul")!;

    expect(bullets).toHaveClass("text-base", "lg:text-xl");
    expect(bullets.parentElement).toHaveClass("flex-col", "xl:flex-row");
    expect(bullets.parentElement).not.toHaveClass("lg:flex-row");
  });

  /**
   * Inno8 is the exception and stays one, at both breakpoints: its panel is
   * 2.6:1, so it is drawn as a single column at 1440 already (§11) and narrows to
   * 375 by doing the same thing. The type ramp still reaches it — that is a
   * question about measure, not about layout.
   */
  it("leaves the Inno8 card single-column, but ramps its type with the rest", async () => {
    const user = userEvent.setup();
    render(<FviiiaMimetics />);
    await user.click(screen.getByRole("button", { name: "Expand Inno8" }));

    const bullets = screen.getAllByRole("dialog", { hidden: true })[3].querySelector("ul")!;

    expect(bullets).toHaveClass("text-base", "lg:text-xl");
    expect(bullets.parentElement).toHaveClass("flex-col");
    expect(bullets.parentElement).not.toHaveClass("xl:flex-row");
  });
});
