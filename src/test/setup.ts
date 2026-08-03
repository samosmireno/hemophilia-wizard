// Registers @testing-library/jest-dom matchers (toBeInTheDocument, etc.) on
// Vitest's expect, including their TypeScript augmentation.
import "@testing-library/jest-dom/vitest";

// Unmount and clear the DOM after each test. React Testing Library's automatic
// cleanup only self-registers when Vitest runs with `globals: true`; this config
// does not, so register it explicitly to keep renders from leaking across tests.
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

import type { WizardAnswers } from "../state/wizardAnswers";
import { ANSWERS_STORAGE_KEY } from "../state/wizardAnswers";

afterEach(cleanup);

/**
 * The wizard's answers outlive a render — they are in `sessionStorage`, which
 * jsdom shares across every test in a file. Without this, one test answering the
 * wizard silently un-gates `/wizard/scenario` for the next.
 */
beforeEach(() => sessionStorage.clear());

/**
 * Put a complete (or partial) set of wizard answers in session state, as though
 * the learner had already filled the form in. Writes the store rather than
 * driving the UI, because the tests that need it — the sidebar's spine walk, the
 * pages past the gate — are not about the form.
 *
 * Call before rendering: `WizardAnswersProvider` reads the store once, in a lazy
 * initializer.
 */
export function seedWizardAnswers(answers: Partial<WizardAnswers> = {}) {
  sessionStorage.setItem(
    ANSWERS_STORAGE_KEY,
    JSON.stringify({ type: "A", hasInhibitors: false, reason: "bleeding-control", ...answers }),
  );
}

/**
 * jsdom 25 implements `<dialog>`'s `open` attribute but neither `showModal()`
 * nor `close()` — they arrived in jsdom 26, and `CLAUDE.md`'s reproducibility
 * rule says dependency bumps are deliberate, not incidental to a feature. So
 * `Popup` gets a stand-in.
 *
 * **This shim is only the state machine.** The three things `showModal()` is
 * actually chosen for — the top layer, the focus trap and focus restoration —
 * are not reproduced, because a fake of them would only ever assert itself.
 * Nothing in the suite tests them; they are the platform's contract, verified
 * in a browser. What the shim does support is "is it open", which is what the
 * component's own logic turns on. ESC is in the same category: jsdom fires no
 * `cancel` event, so `Popup.test.tsx` dispatches one directly and says so.
 */
if (!HTMLDialogElement.prototype.showModal) {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.open = true;
  };
  HTMLDialogElement.prototype.close = function close(returnValue?: string) {
    if (returnValue !== undefined) this.returnValue = returnValue;
    this.open = false;
    this.dispatchEvent(new Event("close"));
  };
}

/**
 * jsdom implements no `window.matchMedia`, and two different things ask for it:
 *
 * - `mlg-components`' `Sidebar` — mounted by `AppShell`, so present in *every*
 *   routed render — queries a width to pick its layout. Without a stub the whole
 *   suite throws.
 * - `Landing`'s backdrop queries `prefers-reduced-motion` to decide whether to
 *   mount the video at all.
 *
 * So the stub has to answer per query rather than uniformly. A single `matches`
 * for everything would report reduced-motion as ON in every test (the viewport
 * default is `true`) and the video would never mount anywhere.
 *
 * `matches` is read when the component calls `matchMedia`, not when the stub is
 * installed, so the setters below only move this state — callers set it before
 * rendering.
 */
let wideViewport = true;
let reducedMotion = false;

/**
 * Sidebar layout. Defaults to matching, i.e. the rail: its DOM is the simplest
 * of the two (a flat list of buttons, no hidden wrapper and no "More" trigger).
 * Tests that need the bottom bar call `setViewport(false)`.
 */
export function setViewport(matches: boolean) {
  wideViewport = matches;
}

/** Defaults to `false`, so the motion-bearing path is what tests see by default. */
export function setReducedMotion(matches: boolean) {
  reducedMotion = matches;
}

beforeEach(() => {
  wideViewport = true;
  reducedMotion = false;

  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches: query.includes("prefers-reduced-motion") ? reducedMotion : wideViewport,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
});

afterEach(() => vi.unstubAllGlobals());
