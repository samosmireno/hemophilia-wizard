import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import svgr from "vite-plugin-svgr";

// https://vite.dev/config/
export default defineConfig({
  // svgr only transforms imports with the `?react` suffix into components; plain
  // `import x from "./y.svg"` imports stay URL strings for <img> usage.
  // `dimensions: false` strips the fixed width/height (keeping viewBox) so the
  // inline SVG scales proportionally under CSS max-w/max-h like an <img> would.
  plugins: [react(), tailwindcss(), svgr({ svgrOptions: { dimensions: false } })],
});
