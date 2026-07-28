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
 * jsdom implements no `window.matchMedia`, and `mlg-components`' `Sidebar` —
 * mounted by `AppShell`, so present in *every* routed render — calls it to pick
 * its layout. Without this stub the whole suite throws.
 *
 * Defaults to matching, i.e. the rail: its DOM is the simplest of the two
 * (a flat list of buttons, no hidden wrapper and no "More" trigger). Tests that
 * need the bottom bar call `setViewport(false)`.
 */
export function setViewport(matches: boolean) {
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query: string) => ({
      matches,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  );
}

beforeEach(() => setViewport(true));
afterEach(() => vi.unstubAllGlobals());
