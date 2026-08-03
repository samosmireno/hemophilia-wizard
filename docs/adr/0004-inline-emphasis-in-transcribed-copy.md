# Inline emphasis in transcribed copy, marked in the string

**Status:** accepted

Copy in `src/data/` that carries emphasis _inside_ a sentence marks it with a markdown
subset — `_word_` for `<em>`, `**word**` for `<strong>` — and pages render those strings
through `formatInline()` (`src/lib/formatInline.tsx`).

## Why there is a decision here at all

Every `font-bold` in `src/` before this styled a whole block: a heading, a caption, an
entire bullet. The emphasis was always a property of the _element_, so it lived in a
`className` and the data module held plain strings.

The `/wizard/scenario` artboards broke that. All four set the polarity word in italic —
"Therapeutic classes to consider for prophylaxis of HA _without_ inhibitors" — and that
emphasis is not decorative: with-vs-without is the branch the entire screen turns on, and
it is the one word distinguishing two otherwise near-identical sentences. It belongs to the
sentence, not to the paragraph, and there was nowhere in the model for it.

## Why the markup goes in the string

The alternative was to change the _shape_ of the data so emphasis is structural. Both
shapes were on the table and both were rejected:

**A `preserveCase`-style term list** — `emphasise(text, ["F8", "F9"])`, matching named terms
the way `preserveCase` matches cased ones. It works for gene symbols, which are always the
same tokens, and fails outright for this case: "with" is an ordinary English word, and
`education.ts` already ships "prolonged aPTT in conjunction **with** normal PT", which a
term match would emphasise. Which occurrence is stressed is a fact about one sentence, so
it has to be marked at that sentence.

**Structured parts** — `lead: ["…prophylaxis of HA ", "without", " inhibitors"]`. No
parsing, and the type can make the emphasis impossible to forget. Rejected because it
generalises badly: it encodes _exactly one_ emphasised run in a fixed position, so the
second string wanting two runs, or wanting bold as well as italic, forces a different shape
again. It also makes the data module unreadable at a glance — the sentence is no longer a
sentence.

Markup in the string costs a small parser and makes `_` and `**` meaningful in the strings
it is pointed at. In exchange the copy stays legible as copy, and the page never has to
change when a string gains or loses emphasis.

## Why these delimiters

`_em_` and `**strong**` are what Prettier emits in this repo's own markdown, and Prettier
owns formatting here. CONTEXT.md is where this copy is transcribed _from_, so it already
writes `_F8_` and `_with_` in exactly this form — transcription is a copy-paste rather than
a translation step, which is the whole point of a convention that has to survive being
retyped by whoever next reconciles the app against the source.

Asterisk-only italics (`*word*`) is the more widely recognised spelling, and was rejected
for that mismatch, plus the fussier parse of `*` and `**` sharing a character. An explicit
tag syntax (`[em]…[/em]`) is unambiguous and was rejected as unreadable in the data module
for a risk that does not exist: clinical copy in this domain contains no paired underscores
by accident.

## Consequences

- **Only paired delimiters match.** A lone `_` or `*` has no partner, falls out of the
  alternation, and passes through as text — so pointing `formatInline` at strings that were
  never marked up is free, and `/wizard/scenario` does exactly that for its class bullets
  and its caveat, neither of which carries markup today.
- **Body prose only.** The helper returns fragments, and the accessible-name algorithm
  joins an element's contributions with a separating space — so a heading or an
  `aria-label` built from them gains spaces the source string lacks. This is the hazard
  `preserveCase` documents and answers with an `aria-label` at both call sites; here the
  answer is that names simply do not get formatted. `/wizard/scenario` renders its `<h1>`
  raw for this reason.
- **No nesting.** `**_x_**` produces a `<strong>` containing the literal `_x_`. The
  exclusion that stops one run swallowing the next also stops the outer match containing a
  usable inner one. Nothing in this copy nests.
- **`preserveCase` and `formatInline` are not composed.** Both split a string into
  fragments, so running one over the other's output would need a single tokenizer rather
  than two passes. Nothing needs both today — `preserveCase` is used on shouted bands,
  where no source emphasis survives being uppercased anyway — and the first string that
  does is a rewrite of both, not a nesting of them.
- **`education.ts`'s gene symbols are now visibly unmarked.** `F8` and `F9` ship flat
  (lines 141, 142, 152, 707) where nomenclature convention and CONTEXT.md §7.2/§7.3 set
  them italic. This ADR makes that fixable in the data alone, but the fix is not taken
  here: those chapters were transcribed from their own artboards and it has not been
  checked whether the designer set them italic.
