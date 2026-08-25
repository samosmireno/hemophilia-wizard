import { afterEach, describe, expect, it, vi } from "vitest";

import { sanitizeLocation, sanitizeSearch } from "./sanitizeLocation";

describe("sanitizeSearch", () => {
  it("keeps the campaign params and drops everything else, in original order", () => {
    expect(sanitizeSearch("?utm_source=qr&mc_eid=abc123&utm_medium=print&_hsenc=x")).toBe(
      "?utm_source=qr&utm_medium=print",
    );
  });

  it("keeps every standard campaign param", () => {
    const all = "?utm_source=a&utm_medium=b&utm_campaign=c&utm_content=d&utm_term=e&utm_id=f";
    expect(sanitizeSearch(all)).toBe(all);
  });

  it("returns an empty string when nothing survives — never a bare `?`", () => {
    expect(sanitizeSearch("?mc_eid=abc123&fbclid=xyz")).toBe("");
    expect(sanitizeSearch("?")).toBe("");
    expect(sanitizeSearch("")).toBe("");
  });

  it("preserves values, including encoded ones", () => {
    const out = new URLSearchParams(sanitizeSearch("?utm_campaign=spring%20launch%202026"));
    expect(out.get("utm_campaign")).toBe("spring launch 2026");
  });

  it("is case-sensitive, as GA4's campaign params are", () => {
    expect(sanitizeSearch("?UTM_SOURCE=qr")).toBe("");
  });
});

describe("sanitizeLocation", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    window.history.replaceState(null, "", "/");
  });

  it("strips non-campaign params from the address bar, keeping path and hash", () => {
    window.history.replaceState(null, "", "/?utm_source=qr&mc_eid=abc123#top");
    sanitizeLocation();
    expect(window.location.pathname).toBe("/");
    expect(window.location.search).toBe("?utm_source=qr");
    expect(window.location.hash).toBe("#top");
  });

  it("empties the query string when only tokens arrived", () => {
    window.history.replaceState(null, "", "/wizard?mc_eid=abc123");
    sanitizeLocation();
    expect(window.location.pathname).toBe("/wizard");
    expect(window.location.search).toBe("");
    expect(window.location.href.endsWith("?")).toBe(false);
  });

  it("leaves history alone when nothing needs stripping", () => {
    const replaceState = vi.spyOn(window.history, "replaceState");
    sanitizeLocation(); // bare "/"
    window.history.replaceState.call(window.history, null, "", "/wizard?utm_source=email");
    replaceState.mockClear();
    sanitizeLocation();
    expect(replaceState).not.toHaveBeenCalled();
    expect(window.location.search).toBe("?utm_source=email");
  });

  it("preserves history state, which the router keeps its index in", () => {
    window.history.replaceState({ idx: 3 }, "", "/?mc_eid=abc123");
    sanitizeLocation();
    expect(window.history.state).toEqual({ idx: 3 });
    expect(window.location.search).toBe("");
  });
});
