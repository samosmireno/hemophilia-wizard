import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";

import { topicById } from "../../data/education";
import FviiiaMimetics from "./FviiiaMimetics";

const CHAPTER = topicById("fviiia-mimetics")!;
const EMICIZUMAB = topicById("emicizumab-overview")!;
const DENECIMIG = topicById("denecimig-overview")!;
/** The figure topics split out of the two overviews; see the data module. */
const MOA = topicById("emicizumab-moa")!;
const DENECIMIG_MOA = topicById("denecimig-moa")!;

/** The panel's group heading — a chapter literal, no topic holds it. */
const PANEL_HEADING = "Investigational FVIIIa-mimetic therapies in early-stage development:";

describe("fviiia-mimetics chapter", () => {
  /**
   * Read by id with non-null assertions in the chapter; a rename in the data
   * module fails here rather than as a render crash.
   */
  it("resolves the topics it reads", () => {
    expect(topicById("fviiia-mimetics")).toBeDefined();
    expect(topicById("emicizumab-overview")).toBeDefined();
    expect(topicById("denecimig-overview")).toBeDefined();
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
      "FVIIIa-Mimetic BsAbs: Approved and Emerging Agents for HA Prophylaxis",
    );
    expect(EMICIZUMAB.title).toBe("Emicizumab (FDA-approved)");
    expect(DENECIMIG.title).toBe("Denecimig (Mim8): Investigational; currently under FDA review");
    // The paren comes first in the string; the colon is the drawn break.
    expect(DENECIMIG.title.indexOf(" (")).toBeLessThan(DENECIMIG.title.indexOf(": "));
  });

  /**
   * `uppercase` is a CSS transform, so nothing here can be asserted by reading
   * text — what is assertable is that the two abbreviations are carried in their
   * own elements, which is the only way they can opt out of it. A heading that
   * shouted them would render "FVIIIA-MIMETIC BSABS" and destroy both.
   */
  it("keeps FVIIIa and BsAbs out of the heading's uppercase transform", () => {
    render(<FviiiaMimetics />);
    const heading = screen.getByRole("heading", { level: 1 });

    for (const term of ["FVIIIa", "BsAbs"]) {
      const span = within(heading).getByText(term);
      expect(span).toHaveClass("normal-case");
    }
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
    for (const name of [EMICIZUMAB.title, DENECIMIG.title, "NXT007", "Inno8"]) {
      expect(screen.getByRole("button", { name: `Expand ${name}` })).toBeInTheDocument();
    }
  });

  /** The two investigational agents sit inside the panel, under its heading. */
  it("groups NXT007 and Inno8 under the panel heading", () => {
    render(<FviiiaMimetics />);
    const panel = screen.getByRole("region", { name: PANEL_HEADING });

    expect(within(panel).getByRole("button", { name: "Expand NXT007" })).toBeInTheDocument();
    expect(within(panel).getByRole("button", { name: "Expand Inno8" })).toBeInTheDocument();
    // The other two are the chapter's, not the panel's.
    expect(
      within(panel).queryByRole("button", { name: `Expand ${EMICIZUMAB.title}` }),
    ).not.toBeInTheDocument();
  });

  /**
   * One open at a time. Asserted on the two that still open no card, so the ✕
   * is the whole of their open state: `DisclosureBand` makes the same guarantee,
   * and the two agent cards read this state rather than replacing it.
   */
  it("shows at most one disclosure open at a time", async () => {
    const user = userEvent.setup();
    render(<FviiiaMimetics />);

    await user.click(screen.getByRole("button", { name: "Expand NXT007" }));
    expect(screen.getByRole("button", { name: "Close NXT007" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Expand Inno8" }));
    expect(screen.getByRole("button", { name: "Close Inno8" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Expand NXT007" })).toBeInTheDocument();

    // Clicking the open one closes it, leaving all four shut.
    await user.click(screen.getByRole("button", { name: "Close Inno8" }));
    expect(screen.queryByRole("button", { name: /^Close / })).not.toBeInTheDocument();
  });

  /**
   * `aria-haspopup` is a promise, and two of the four still cannot keep it —
   * announcing a dialog that never appears is worse than announcing nothing,
   * which is the reason `DisclosureBand` makes the attribute conditional too.
   *
   * Both halves in one test because the pair is the fact: the attribute tracks
   * which disclosures actually have a card, so a third card wired in without its
   * `hasCard` fails here rather than shipping silent.
   */
  it("promises a dialog only where one opens", () => {
    render(<FviiiaMimetics />);

    for (const name of [`Expand ${EMICIZUMAB.title}`, `Expand ${DENECIMIG.title}`]) {
      expect(screen.getByRole("button", { name })).toHaveAttribute("aria-haspopup", "dialog");
    }
    for (const name of ["Expand NXT007", "Expand Inno8"]) {
      expect(screen.getByRole("button", { name })).not.toHaveAttribute("aria-haspopup");
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
 * denecimig, denecimig's figure] in DOM order.
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
    expect(DENECIMIG.title).toBe("Denecimig (Mim8): Investigational; currently under FDA review");
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
