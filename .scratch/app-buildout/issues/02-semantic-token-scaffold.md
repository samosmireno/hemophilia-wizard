# 02 — Semantic design-token scaffold in tokens.css

Status: ready-for-agent — **decide: rewrite or wontfix**
Phase: 0

## Goal

Define a semantic token layer (surface / text / border / brand / state slots) so markup names
roles rather than raw colours.

## Premise likely overtaken

The real palette shipped without this layer: components paint from **component-scoped
`--color-ui-*` tokens**, and `tokens.css` still records "No semantic aliases yet". This
issue's old claim that a `--text-*` type scale had landed is now explicitly forbidden —
`tokens.css:19-24` says there is no house type scale, sizes are Tailwind's own `--text-*`
defaults, and overriding one silently changes every utility of that name app-wide.

So the issue as written cannot be executed. Someone must decide whether to rewrite it against
what actually shipped, or close it wontfix. Issue 14 carries the same open question.

Still live if it is rewritten: if the page gets a **dark** surface, the sidebar rail's focus
ring fails — `NavBarButton` draws its outline with no `outline-offset`, and `SidebarRail`
paints no background, so the ring resolves against the page. See `.scratch/mlg-reskin/issues/04-sidebar.md`.
