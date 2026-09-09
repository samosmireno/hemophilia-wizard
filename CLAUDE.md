# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Vite dev server with HMR
npm run build         # Type-check (tsc -b) then bundle (vite build)
npm run lint          # ESLint across all files (flat config)
npm run format        # Prettier write
npm test              # Vitest suite (jsdom + Testing Library)
npm run export:pdf    # PDF slide deck of every screen → export/ (see "PDF export" below)

npx vitest run src/routes/router.test.tsx   # single test file
npx vitest -t "renders"           # tests matching a name
npx vitest                        # watch mode
```

Test files live next to source as `*.test.ts`/`*.test.tsx` — the Vitest glob is
`src/**/*.test.{ts,tsx}`.

## Stack

- **React 19** + **TypeScript ~6** — component framework
- **Vite 8** — dev server and bundler (`@vitejs/plugin-react`)
- **Tailwind CSS v4** — via `@tailwindcss/vite`; **no `tailwind.config.*`**, configuration
  is CSS-native in `src/styles/tokens.css` (the `@theme` block defines tokens that become utilities).
  **`docs/styling.md` is the rationale for every token in that file** — read it before changing a
  colour, and update it when you do
- **Vitest** — jsdom environment, `@testing-library/react`, `jest-dom` matchers registered in `src/test/setup.ts`
- **react-ga4** — GA4, wrapped by `src/lib/analytics.ts` (the only module that may import it);
  runs in production builds only, and only when `VITE_GA_MEASUREMENT_ID` is set. Event schema
  and GA4-console setup: `docs/analytics.md`; privacy line: `docs/adr/0010`

## Conventions

- Merge classes with `cn()` from `src/lib/cn.ts` (clsx + tailwind-merge) — don't hand-concatenate `className` strings.
- SVGs: `import Icon from "./icon.svg?react"` gives a React component; a plain import stays a URL string for `<img>`.
- TypeScript is strict-ish (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly`) — use `import type` for type-only imports.
- Prettier owns formatting (2-space, double quotes, 100 print width, trailing commas). Run `npm run format` rather than hand-aligning.

## Reproducibility

The `package-lock.json` is committed and authoritative — installs are reproducible.
Bump dependencies deliberately with `npm run upgrade` (npm-check-updates), never ad hoc.

## PDF export

`npm run export:pdf` (`scripts/export-pdf.mjs`, Playwright + mlg-review-deck's core) is the
client review deck: builds the app with `VITE_GA_MEASUREMENT_ID` forced empty, serves `dist/`
on a local `vite preview`, drives a 1440×800 Chromium through every screen and hands the
manifest to review-deck's core, which draws the birds-eye map in front (the overview, then a
page per wizard branch, every thumbnail a link), the bookmark outline and the link annotations.
The walk is this app's, planned in the script — the generic `review-deck` crawl misreads the
accordion, the leaf notes and the Explore page (2026-09-09), so don't run it here: spine order
(`src/data/sectionOrder.ts`), then How to Use (demo popups never opened), Glossary, Acronyms,
References at the end; on each page first every other position of a switchable (a drawer, a
tab) beside the page, then every sheet it opens (lightboxes and "View mechanism" one level
down); a sheet seen again (title + body hash) is skipped, drawers and wizard screens never are;
the wizard depth-first through the real radios, Submit and Next, with the type-only and
both-picked input screens, the scenario page and its class sheets, the reason picked, the leaf
with Considerations then Strategies open, then its drug sheets; a page taller than 800 px is
one taller slide, the viewport-fixed page background stretched to its foot for the shot. Output (review-deck's standard §8): `documents/export/<name>-<date>-<sha7>.pdf`
plus a folder of the same name with the page JPEGs, `deck.json` (the manifest) and
`report.json` (ledger, skipped repeats, blocked external requests, warnings). Flags: `--scale 1`,
`--quality N`, `--out`, `--skip-build`, `--pages map|slides|both` (the map and branch pages alone, suffixed `-map` and unlinked; the slides alone, `-slides`; or the deck). The core is imported from a checkout of
`mlg-review-deck` beside this repo (or `REVIEW_DECK_DIR`) — its git-pinned package ships only
the crawl's bin. The browser context aborts every non-localhost request, so no GA hit or
survey POST can escape.

## Deploy

Static SPA. `npm run build` emits `dist/`, which works on any static host.
`vercel.json` ships a catch-all rewrite (`/(.*)` → `/index.html`) so client-side
routes resolve to the app instead of 404ing — keep it if you add a router.

## Notes

This started from a bare shell: no router, no global state library, no design system.
Add those per project as needed; keep this file updated when you do.

## Agent skills

### Issue tracker

Issues and specs live as markdown files under `.scratch/<feature>/` in this repo. See `docs/agents/issue-tracker.md`.

### Triage labels

The five canonical triage roles, using default label strings. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` + `docs/adr/` at the repo root. See `docs/agents/domain.md`.
