/**
 * The agent roster's names, written once.
 *
 * Five modules used to spell these independently — `TREATMENTS`, `DRUG_SHEETS`,
 * `EXPLORE_SEGMENTS`, the wizard's `AGENTS`, and `REBALANCING_AGENTS` — and all of
 * them are joined at runtime by exact string match: `recommend()` looks a
 * `Treatment` up by name, `sheetFor()` looks a sheet up by name. A typo in any one
 * of them dropped an agent from a recommendation or opened an empty card, silently.
 * `content.test.ts` pinned three of those joins; `AgentName` makes all of them the
 * compiler's problem instead.
 *
 * Names are `[XLSX]` S1 verbatim (CONTEXT.md §5.1) — the join key, not display copy.
 * Where a screen draws something else (Denecimig's "(emerging/investigational)"
 * heading, `/explore`'s arch labels), that string lives with the screen.
 */
export const AGENT_NAMES = {
  shl: "SHL",
  ehl: "EHL",
  efanesoctocog: "Efanesoctocog alfa",
  emicizumab: "Emicizumab",
  denecimig: "Denecimig",
  concizumab: "Concizumab",
  marstacimab: "Marstacimab",
  fitusiran: "Fitusiran",
  etranacogene: "Etranacogene dezaparvovec-drlb",
} as const;

/** One of the nine. Anything else is not an agent this activity knows about. */
export type AgentName = (typeof AGENT_NAMES)[keyof typeof AGENT_NAMES];

export const ALL_AGENT_NAMES: readonly AgentName[] = Object.values(AGENT_NAMES);
