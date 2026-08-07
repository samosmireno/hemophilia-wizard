# 0008 — Bibliographic defects are repaired; authored copy is transcribed

Date: 2026-08-07
Status: Accepted

## Context

This repo transcribes. The rule has never been written down, but it has been applied
consistently and the notes recording each application are scattered across `CONTEXT.md`:

- §8 — the glossary defines "Nonfactor therapy" as including _"homeostatic balancing
  agents"_ where the term everywhere else is _hemostatic rebalancing_ agents. Shipped
  verbatim, marked `sic` in `src/data/glossary.ts`.
- §6 — the Denecimig sheet lists trial **FRONTEIR5**. Shipped as spelled.
- §5.1 — the roster and the drug sheets write **`mAB`**. Shipped as drawn, even though the
  app corrected the same string to `mAb` in its own 12 occurrences.
- §8 — `aPCC` sorts before `APC`, which no ordering rule produces. Source order ships.

The stated reason each time is the same: the source files in `documents/` are the record
this app is checked against, and a silent correction destroys the re-verifiability that
`CONTEXT.md` exists to provide. The `mAb` correction is the one departure, and it was
argued narrowly — monoclonal antibody _is_ `mAb`, the source's own §8 acronym list says
so, and the two spellings could not both be right.

Building `/references` put five more defects in front of that rule at once:

| id    | source form                   | class                  |
| ----- | ----------------------------- | ---------------------- |
| `r2`  | `…/media/165594/download..`   | stray period           |
| `r12` | `healthy male participant`    | singular for plural    |
| `r14` | `2017:117:1348-1357`          | colon for a semicolon  |
| `r16` | `et al.··J Thromb …2341-2354` | doubled space; no stop |
| `r21` | `Oldenberg J`                 | misspelled author      |

`r21` is the one that forces the question. §6 records the same author, cited on the
Denecimig sheet for the same FRONTIER5 study, as **Oldenburg** — so the source contradicts
itself, and "transcribe both" is not available to a single list.

## Decision

**A defect in a citation is repaired. A defect in authored copy is transcribed.**

All five above are repaired in `src/data/references.ts`. `homeostatic`, `FRONTEIR5`,
`mAB` and the `aPCC`/`APC` inversion are untouched and stay untouched.

Every repair is recorded with its source form — in `CONTEXT.md` §9, in the `Reference`
doc comment, and pinned in `src/routes/references.test.tsx` against the string it
replaced.

## Rationale

**A citation is a pointer, not a claim.** Its correctness is a property of the external
artifact it names, and it can be checked against that artifact by anyone. `…/download..`
resolves to nothing. `J Thromb Haemost. 2017:117` names no issue. `Oldenberg J` retrieves
no paper. These are not the client's opinions rendered in prose — they are broken
addresses, and shipping them faithfully means shipping a bibliography that does not work
as a bibliography.

**Authored copy is the opposite.** "Homeostatic balancing agents" is a definition somebody
wrote for a CME activity. It reads wrong, but only the client can say whether it is a typo
or an intended coinage, and the app's job is to render the definition it was given. The
same goes for the acronym ordering: order is content in a reference list.

**The line is where the checkability is.** Ask whether a reader outside this project could
settle the question with the artifact in hand. For a DOI, a volume number, an author's
name, a URL — yes. For what a term means or which items come first — no, that needs the
author. This is the same distinction `mAb` turned on, generalised: `mAb` was repaired
because the source's own acronym list settled it, not because it looked wrong.

**Why not raise all five as client questions and ship as drawn.** Considered, and it is
what §8 does for its six unglossed abbreviations. The difference is that those questions
cannot be answered without authoring new copy, so there is nothing to do but ask. These
five have a single correct answer available today, and holding a broken link hostage to a
review cycle serves nobody.

## Consequences

- **`CONTEXT.md` §9 now disagrees with `[PDF-V]` on five strings**, and says so explicitly
  with both forms in a table. Anyone re-verifying the list against the PDF will find the
  differences documented rather than discovering them as drift.
- **The reference list is no longer verbatim**, which makes it the first content array in
  the app that is not. A future re-transcription pass would look correct while reverting
  all five, so `references.test.tsx` pins each repair against the string it replaced.
- **`r14` may have a sixth defect this ADR does not license.** _Kitazawa T, et al._ volume
  117 belongs to _Thromb Haemost_, not _J Thromb Haemost_ — a journal name is checkable,
  but changing one rewrites which artifact the citation points at rather than fixing how it
  points there. Raised as a client question in §9 instead.
- **The rule is now available to `/resources`**, which is unbuilt and whose `RESOURCES`
  array is the same kind of content.
- **It does not reach the drug sheets or the roster.** Their trial names, journal strings
  and `mAB` are inside authored copy blocks, and `FRONTEIR5` in particular is recorded in
  §6 as a source spelling worth preserving.

## Alternatives considered

- **Repair the punctuation only** (`r2`, `r14`, `r16`), leaving `Oldenberg` and
  `participant`. Rejected: it splits the list into corrected and uncorrected halves with no
  rule a reader could infer, and it leaves the one defect that actually breaks retrieval.
- **Repair nothing, log all five.** Rejected as above — it is the right answer for
  questions that need an author and the wrong one for questions that need a lookup.
- **Repair `Oldenberg` only**, on the narrow §5.1 `mAb` precedent (the source contradicts
  itself, so one form must be wrong). Rejected: it is a defensible minimum, but it decides
  the hardest of the five without giving the other four a rule, which is the situation this
  ADR exists to end.
