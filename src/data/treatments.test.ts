import { describe, expect, it } from "vitest";

import { ALL_AGENT_NAMES, type AgentName } from "./agents";
import { TREATMENTS, treatmentFor } from "./treatments";

/*
  The roster's own seam. Its *coverage* — that `TREATMENTS` holds one row per name in
  `AGENT_NAMES` — stays in `content.test.ts`, because that is a join outward to
  `agents.ts` rather than a fact about this module. What is here is the lookup built
  over the array, and the transcription rule the rows are held to.
*/

describe("treatmentFor", () => {
  it.each(ALL_AGENT_NAMES)("resolves %s to the row bearing that name", (name) => {
    expect(treatmentFor(name).agent).toBe(name);
  });

  /*
    Reachable only through a cast, which is the point: `AgentName` is closed and
    `content.test.ts` pins that every member has a row, so the throw cannot be hit
    with a well-typed argument. What it pins is that the failure is loud — the
    predecessor carried an `unresolved: string[]` nothing read, and a mistyped name
    dropped an agent off a wizard leaf in silence.
  */
  it("throws rather than returning undefined when a row is missing", () => {
    expect(() => treatmentFor("Nonexistent agent" as AgentName)).toThrow(/No treatment row/);
  });
});

describe("the roster rows", () => {
  /*
    S1 pads cells to lay out its columns — three `monitoring` values opened with a
    space, two class labels closed with one, and Denecimig's parenthetical was
    aligned with a run of fourteen. Every one of these fields renders as-is in the
    §5 comparison table, so the padding is a rendering defect waiting on a caller
    rather than copy to transcribe. Asserted across all fields of all rows, so a
    row re-transcribed from the XLSX fails here.
  */
  it("carry no spreadsheet cell padding", () => {
    for (const t of TREATMENTS) {
      for (const [field, value] of Object.entries(t)) {
        if (typeof value !== "string") continue;
        expect(value, `${t.agent}.${field}`).toBe(value.trim());
        // `moa` sets a deliberate newline; only runs of spaces are the artifact.
        expect(value, `${t.agent}.${field}`).not.toMatch(/ {2}/);
      }
    }
  });
});
