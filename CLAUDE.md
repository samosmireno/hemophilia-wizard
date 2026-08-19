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

`npm run export:pdf` (`scripts/export-pdf.mjs`, Playwright + pdf-lib) builds the app with
`VITE_GA_MEASUREMENT_ID` forced empty, serves `dist/` on a local `vite preview`, and drives a
1440×800 Chromium through every screen in spine order: each page, every `<dialog>` overlay on its
first occurrence (keyed by title + body), every wizard branch via the real radios/Submit/Next with
the selection shown before each descent, both result-page panes per leaf, and 800 px scroll windows
for the pages that scroll. Output: `export/hemophilia-wizard-<date>.pdf` (one 1440×800 pt slide per
screen, 2× JPEG), `export/frames/NNN.png`, `export/manifest.json` (per-slide route/state/overlay,
the overlay ledger, skipped repeats, blocked external requests). Flags: `--scale 1`, `--quality N`,
`--out`, `--skip-build`. The browser context aborts every non-localhost request, so no GA hit or
survey POST can escape. Triggers are discovered generically (`button[aria-haspopup="dialog"]`,
nested `Expand …` lightboxes, the "View mechanism" step), so new popups are picked up without
touching the script; `/how-to`'s demo popups and drawers are deliberately not opened.

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
