import { afterEach, describe, expect, it, vi } from "vitest";

import { submitSurvey } from "./submitSurvey";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("submitSurvey", () => {
  it("posts each answer under its Form entry id, opaquely", async () => {
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
      "https://docs.google.com/forms/d/e/1FAIpQLSdu_UpSaNkYniW-5CqcfhReX-bIUh_GID7Sh1UC6cowrYru6Q/formResponse",
    );
    // `no-cors` is load-bearing: with CORS the browser would block the response
    // and reject, and the submission semantics (opaque handoff) are the seam's
    // contract with the page's optimistic confirmation.
    expect(init?.mode).toBe("no-cors");
    expect(init?.method).toBe("POST");

    const body = init?.body as URLSearchParams;
    expect(body.get("entry.1950198496")).toBe("Strongly agree");
    expect(body.get("entry.2071602327")).toBe("Neutral");
    expect(body.get("entry.561719209")).toBe("For general education");
    expect([...body.keys()]).toHaveLength(3);
  });
});
