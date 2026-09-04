import { afterEach, describe, expect, it, vi } from "vitest";

import { submitSurvey } from "./submitSurvey";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("submitSurvey", () => {
  it("posts each answer under its question id to the survey endpoint, opaquely", async () => {
    const fetchSpy = vi
      .spyOn(globalThis, "fetch")
      .mockResolvedValue(new Response(null, { status: 200 }));

    await submitSurvey({
      q1: "Strongly agree",
      q2: "Neutral",
      q3: "For general education",
    });

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, init] = fetchSpy.mock.calls[0];
    expect(url).toBe(
      "https://script.google.com/macros/s/AKfycbwIIJj6Mv8naCMDhwVro31FcbhDIB1CiLEiAZGx3PoLHfCGdIg17VDk6Sxveg68XB8/exec",
    );
    // `no-cors` is load-bearing: with CORS the browser would block the response
    // and reject, and the submission semantics (opaque handoff) are the seam's
    // contract with the page's optimistic confirmation.
    expect(init?.mode).toBe("no-cors");
    expect(init?.method).toBe("POST");

    const body = init?.body as URLSearchParams;
    expect(body.get("q1")).toBe("Strongly agree");
    expect(body.get("q2")).toBe("Neutral");
    expect(body.get("q3")).toBe("For general education");
    expect([...body.keys()]).toHaveLength(3);
  });
});
