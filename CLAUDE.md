# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev           # Vite dev server with HMR
npm run build         # Type-check (tsc -b) then bundle (vite build)
npm run lint          # ESLint across all files (flat config)
npm run format        # Prettier write
npm test              # Vitest suite (jsdom + Testing Library)

npx vitest run src/App.test.tsx   # single test file
npx vitest -t "renders"           # tests matching a name
npx vitest                        # watch mode
```

Test files live next to source as `*.test.ts`/`*.test.tsx` — the Vitest glob is
`src/**/*.test.{ts,tsx}`.

## Stack

- **React 19** + **TypeScript ~6** — component framework
- **Vite 8** — dev server and bundler (`@vitejs/plugin-react`)
- **Tailwind CSS v4** — via `@tailwindcss/vite`; **no `tailwind.config.*`**, configuration
  is CSS-native in `src/styles/tokens.css` (the `@theme` block defines tokens that become utilities)
- **Vitest** — jsdom environment, `@testing-library/react`, `jest-dom` matchers registered in `src/test/setup.ts`
- **react-ga4** — optional GA4; only initialized when `VITE_GA_MEASUREMENT_ID` is set (see `src/main.tsx`)

## Conventions

- Merge classes with `cn()` from `src/lib/cn.ts` (clsx + tailwind-merge) — don't hand-concatenate `className` strings.
- SVGs: `import Icon from "./icon.svg?react"` gives a React component; a plain import stays a URL string for `<img>`.
- TypeScript is strict-ish (`noUnusedLocals`, `noUnusedParameters`, `verbatimModuleSyntax`, `erasableSyntaxOnly`) — use `import type` for type-only imports.
- Prettier owns formatting (2-space, double quotes, 100 print width, trailing commas). Run `npm run format` rather than hand-aligning.

## Reproducibility

The `package-lock.json` is committed and authoritative — installs are reproducible.
Bump dependencies deliberately with `npm run upgrade` (npm-check-updates), never ad hoc.

## Deploy

Static SPA. `npm run build` emits `dist/`, which works on any static host.
`vercel.json` ships a catch-all rewrite (`/(.*)` → `/index.html`) so client-side
routes resolve to the app instead of 404ing — keep it if you add a router.

## Notes

This started from a bare shell: no router, no global state library, no design system.
Add those per project as needed; keep this file updated when you do.
