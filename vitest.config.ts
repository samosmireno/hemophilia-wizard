import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

// Component tests run in jsdom with the React plugin for JSX transform; the
// setup file registers @testing-library/jest-dom matchers. Pure-logic tests
// (`.test.ts`) run in the same config with no extra ceremony.
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
