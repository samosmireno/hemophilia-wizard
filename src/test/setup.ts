// Registers @testing-library/jest-dom matchers (toBeInTheDocument, etc.) on
// Vitest's expect, including their TypeScript augmentation.
import "@testing-library/jest-dom/vitest";

// Unmount and clear the DOM after each test. React Testing Library's automatic
// cleanup only self-registers when Vitest runs with `globals: true`; this config
// does not, so register it explicitly to keep renders from leaking across tests.
import { cleanup } from "@testing-library/react";
import { afterEach, beforeEach, vi } from "vitest";

afterEach(cleanup);

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
