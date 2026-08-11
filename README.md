# react-vite-tailwind-starter

A reproducible bare-shell starter: React 19 + TypeScript + Vite + Tailwind v4, with
ESLint, Prettier, and Vitest (jsdom + Testing Library) wired and ready. No router,
no state library, no design system — just the plumbing, so a new project starts from
known-good conventions instead of a blank canvas.

## Use it

```bash
npx degit <your-github>/react-vite-tailwind-starter my-app
cd my-app
npm install
npm run dev
```

The committed `package-lock.json` makes installs reproducible: you get the exact
versions this starter was pinned at, not whatever is newest today. Run `npm run
upgrade` when you _want_ to jump to latest — deliberately, in one place.

## Commands

```bash
npm run dev           # Vite dev server with HMR
npm run build         # tsc -b (type-check) then vite build
npm run preview       # serve the production build
npm run lint          # ESLint (flat config)
npm run format        # Prettier write
npm run format:check  # Prettier check (CI-friendly)
npm test              # Vitest (jsdom + Testing Library)
npm run upgrade       # bump every dep to latest, then reinstall
```

## What's included

- **React 19** + **TypeScript ~6** (strict-ish: `noUnusedLocals`, `verbatimModuleSyntax`, `erasableSyntaxOnly`)
- **Vite 8** — `@vitejs/plugin-react`, `@tailwindcss/vite`, `vite-plugin-svgr`
  (import `./icon.svg?react` for a component; plain import stays a URL)
- **Tailwind v4** — CSS-native config in `src/styles/tokens.css` (`@theme`), no JS config file;
  see [`docs/styling.md`](docs/styling.md) for the design-token rationale
- **`cn()`** helper — `clsx` + `tailwind-merge` (`src/lib/cn.ts`)
- **ESLint 10** flat config + typescript-eslint + react-hooks + react-refresh
- **Prettier 3** + `prettier-plugin-tailwindcss` (aware of `cn`/`clsx`/`twMerge`)
- **Vitest 3** — jsdom, Testing Library, `jest-dom` matchers; example test in `src/App.test.tsx`
- **Analytics (optional)** — `react-ga4` behind `src/lib/analytics.ts`; production builds only,
  and only when `VITE_GA_MEASUREMENT_ID` is set in the host's env (see [`docs/analytics.md`](docs/analytics.md))
- **Vercel** SPA-rewrite config (`vercel.json`)

## Deploying

Static SPA. `vercel.json` ships an SPA rewrite for client routing. Any static host
works — point it at `npm run build`'s `dist/`.
