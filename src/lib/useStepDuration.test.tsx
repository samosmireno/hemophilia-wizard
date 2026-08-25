import { renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { trackStepDuration } from "./analytics";
import { useStepDuration } from "./useStepDuration";

vi.mock("./analytics", () => ({ trackStepDuration: vi.fn() }));

let t = 0;
let visibility: DocumentVisibilityState = "visible";

function setVisibility(next: DocumentVisibilityState) {
  visibility = next;
  document.dispatchEvent(new Event("visibilitychange"));
}

beforeEach(() => {
  t = 0;
  visibility = "visible";
  vi.spyOn(performance, "now").mockImplementation(() => t);
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => visibility,
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  delete (document as { visibilityState?: unknown }).visibilityState;
});

const mount = (pathname = "/a") =>
  renderHook(({ pathname }) => useStepDuration(pathname), { initialProps: { pathname } });

describe("useStepDuration", () => {
  it("reports the route just left when the pathname changes", () => {
    const { rerender } = mount("/a");
    t = 5000;
    rerender({ pathname: "/b" });
    expect(trackStepDuration).toHaveBeenCalledExactlyOnceWith("/a", 5);
  });

  it("reports on tab-hide, pauses while hidden, resumes on show", () => {
    const { rerender } = mount("/a");
    t = 3000;
    setVisibility("hidden");
    expect(trackStepDuration).toHaveBeenCalledExactlyOnceWith("/a", 3);
    t = 30_000;
    setVisibility("visible");
    t = 32_000;
    rerender({ pathname: "/b" });
    expect(trackStepDuration).toHaveBeenNthCalledWith(2, "/a", 2);
    expect(trackStepDuration).toHaveBeenCalledTimes(2);
  });

  it("reports on pagehide and resumes on pageshow", () => {
    const { rerender } = mount("/a");
    t = 4000;
    window.dispatchEvent(new Event("pagehide"));
    expect(trackStepDuration).toHaveBeenCalledExactlyOnceWith("/a", 4);
    t = 9000;
    window.dispatchEvent(new Event("pageshow"));
    t = 10_000;
    rerender({ pathname: "/b" });
    expect(trackStepDuration).toHaveBeenNthCalledWith(2, "/a", 1);
  });

  it("reports the current route on unmount and detaches its listeners", () => {
    const { unmount } = mount("/a");
    t = 2000;
    unmount();
    expect(trackStepDuration).toHaveBeenCalledExactlyOnceWith("/a", 2);
    t = 9000;
    setVisibility("hidden");
    window.dispatchEvent(new Event("pagehide"));
    expect(trackStepDuration).toHaveBeenCalledTimes(1);
  });

  it("reports nothing for a sub-second hop", () => {
    const { rerender } = mount("/education");
    t = 300;
    rerender({ pathname: "/education/disease-background" });
    expect(trackStepDuration).not.toHaveBeenCalled();
  });
});
