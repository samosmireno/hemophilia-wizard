import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { WizardAnswersProvider } from "./WizardAnswersProvider";
import { ANSWERS_STORAGE_KEY, isComplete, useWizardAnswers } from "./wizardAnswers";

/**
 * A probe that renders the answers as text and offers a button per mutation —
 * the store's whole surface, without a route or a form in the way.
 */
function Probe() {
  const { answers, setAnswer, reset, scenarioComplete, complete } = useWizardAnswers();

  return (
    <>
      <output>{JSON.stringify(answers)}</output>
      <span data-testid="scenario-complete">{String(scenarioComplete)}</span>
      <span data-testid="complete">{String(complete)}</span>
      <button onClick={() => setAnswer("type", "B")}>set type</button>
      <button onClick={() => setAnswer("hasInhibitors", true)}>set inhibitors</button>
      <button onClick={() => setAnswer("reason", "monitoring")}>set reason</button>
      <button onClick={() => setAnswer("type", null)}>clear type</button>
      <button
        onClick={() => {
          setAnswer("type", "B");
          setAnswer("hasInhibitors", true);
        }}
      >
        set two at once
      </button>
      <button onClick={reset}>reset</button>
    </>
  );
}

function renderProbe() {
  render(
    <WizardAnswersProvider>
      <Probe />
    </WizardAnswersProvider>,
  );
}

const shown = () => JSON.parse(screen.getByRole("status").textContent!) as unknown;
const stored = () => JSON.parse(sessionStorage.getItem(ANSWERS_STORAGE_KEY)!) as unknown;
const press = (name: string) => userEvent.click(screen.getByRole("button", { name }));

const EMPTY = { type: null, hasInhibitors: null, reason: null };
const FULL = { type: "B", hasInhibitors: true, reason: "monitoring" };

describe("wizard answers", () => {
  it("starts empty and incomplete", () => {
    renderProbe();

    expect(shown()).toEqual(EMPTY);
    expect(screen.getByTestId("complete")).toHaveTextContent("false");
  });

  it("records an answer and persists it", async () => {
    renderProbe();

    await press("set type");

    expect(shown()).toEqual({ ...EMPTY, type: "B" });
    expect(stored()).toEqual({ ...EMPTY, type: "B" });
  });

  it("clears one answer without touching the others", async () => {
    renderProbe();
    await press("set type");
    await press("set reason");

    await press("clear type");

    expect(shown()).toEqual({ ...EMPTY, reason: "monitoring" });
  });

  /**
   * Two `setAnswer` calls in one handler must both land. A `setAnswer` built
   * over the render's `answers` drops the first — each call spreads the same
   * stale snapshot, so the last write wins alone.
   */
  it("keeps both answers when one handler sets two", async () => {
    renderProbe();

    await press("set two at once");

    expect(shown()).toEqual({ ...EMPTY, type: "B", hasInhibitors: true });
    expect(stored()).toEqual({ ...EMPTY, type: "B", hasInhibitors: true });
  });

  it("is complete only once all three are answered", async () => {
    renderProbe();
    const complete = () => screen.getByTestId("complete");

    await press("set type");
    await press("set inhibitors");
    expect(complete()).toHaveTextContent("false");

    await press("set reason");
    expect(complete()).toHaveTextContent("true");
  });

  /**
   * The two-level gate's lower door: the patient answers alone resolve a
   * scenario, which is what `/wizard`'s Submit and the pages before the reason
   * question run on. The reason must not factor in — that is `complete`'s job.
   */
  it("is scenario-complete on the two patient answers alone", async () => {
    renderProbe();
    const scenarioComplete = () => screen.getByTestId("scenario-complete");

    await press("set type");
    expect(scenarioComplete()).toHaveTextContent("false");

    await press("set inhibitors");
    expect(scenarioComplete()).toHaveTextContent("true");
    expect(screen.getByTestId("complete")).toHaveTextContent("false");
  });

  it("reset clears all three", async () => {
    renderProbe();
    await press("set type");
    await press("set inhibitors");
    await press("set reason");

    await press("reset");

    expect(shown()).toEqual(EMPTY);
    expect(stored()).toEqual(EMPTY);
  });

  /**
   * The point of `sessionStorage` over in-memory state: a reload mid-flow keeps
   * the answers, which is also what lets the guarded pages be deep-linked.
   */
  it("restores answers written by an earlier mount", () => {
    sessionStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(FULL));

    renderProbe();

    expect(shown()).toEqual(FULL);
    expect(screen.getByTestId("complete")).toHaveTextContent("true");
  });

  /**
   * The store is writable by anything on the origin and survives a deploy, so a
   * stale or hand-edited value has to be treated as absent rather than trusted —
   * an unknown `reason` would otherwise index `RECOMMENDATIONS` to `undefined`
   * and take a page down.
   */
  it.each([
    ["not JSON", "{{{"],
    ["a JSON scalar", '"nope"'],
    ["null", "null"],
    ["an unknown reason", JSON.stringify({ ...FULL, reason: "vibes" })],
    ["a type outside A/B", JSON.stringify({ ...FULL, type: "C" })],
    ["a non-boolean inhibitor answer", JSON.stringify({ ...FULL, hasInhibitors: "yes" })],
  ])("ignores %s in the store", (_case, raw) => {
    sessionStorage.setItem(ANSWERS_STORAGE_KEY, raw);

    renderProbe();

    expect(isComplete(shown() as never)).toBe(false);
  });

  /** Partial junk loses only the bad field, not the session. */
  it("keeps the valid answers beside an invalid one", () => {
    sessionStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify({ ...FULL, reason: "vibes" }));

    renderProbe();

    expect(shown()).toEqual({ ...FULL, reason: null });
  });

  it("throws when used outside the provider", () => {
    // React logs the error boundary-less throw; silence it for this one case.
    const error = vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() => render(<Probe />)).toThrow(/WizardAnswersProvider/);

    error.mockRestore();
  });
});
