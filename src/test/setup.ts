// jest-dom matchers on Vitest's expect, plus their TypeScript augmentation.
import "@testing-library/jest-dom/vitest";

// RTL's auto-cleanup only self-registers under `globals: true`, which this config
// does not use — register it explicitly or renders leak across tests.
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

import type { WizardAnswers } from "../state/wizardAnswers";
import { ANSWERS_STORAGE_KEY } from "../state/wizardAnswers";

afterEach(cleanup);

// jsdom shares `sessionStorage` across every test in a file, so one test answering
// the wizard would silently un-gate `/wizard/scenario` for the next.
beforeEach(() => sessionStorage.clear());

/**
 * Seed wizard answers as though the learner had filled the form in. Call before
 * rendering: `WizardAnswersProvider` reads the store once, in a lazy initializer.
 */
export function seedWizardAnswers(answers: Partial<WizardAnswers> = {}) {
  sessionStorage.setItem(
    ANSWERS_STORAGE_KEY,
    JSON.stringify({ type: "A", hasInhibitors: false, reason: "bleeding-control", ...answers }),
  );
}

// jsdom 25 has `<dialog open>` but neither `showModal()` nor `close()`. Shims the
// open/closed state machine only — not the top layer, focus trap or ESC.
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

// jsdom implements no `window.matchMedia`. Stubbed per query, not uniformly:
// `Sidebar` asks for a width and `Landing` for `prefers-reduced-motion`.
let wideViewport = true;
let reducedMotion = false;

/** Defaults to matching, i.e. the rail. Tests needing the bottom bar pass `false`. */
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
