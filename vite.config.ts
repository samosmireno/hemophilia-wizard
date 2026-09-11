import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  // Relative asset URLs: the build also ships as a folder the client serves
  // wherever they like, typically a subdirectory of their own site, in an
  // iframe. The default `base: "/"` emits absolute `/assets/…` references that
  // only resolve at a domain root; `"./"` makes the bundle path-agnostic.
  //
  // This holds only while the document URL stays at the install root, and it
  // does: routing is hash-based (`createHashRouter` in main.tsx), so the path
  // never changes and `./assets/…` always resolves against the install
  // directory. The two are a matched pair — moving back to a history router
  // means pinning an absolute `base` to the install path here.
  base: "./",

  // svgr only transforms imports with the `?react` suffix into components; plain
  // `import x from "./y.svg"` imports stay URL strings for <img> usage.
  // `dimensions: false` strips the fixed width/height (keeping viewBox) so the
  // inline SVG scales proportionally under CSS max-w/max-h like an <img> would.
  plugins: [react(), tailwindcss(), svgr({ svgrOptions: { dimensions: false } })],
});
