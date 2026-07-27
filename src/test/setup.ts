// Registers @testing-library/jest-dom matchers (toBeInTheDocument, etc.) on
// Vitest's expect, including their TypeScript augmentation.
import "@testing-library/jest-dom/vitest";

// Unmount and clear the DOM after each test. React Testing Library's automatic
// cleanup only self-registers when Vitest runs with `globals: true`; this config
// does not, so register it explicitly to keep renders from leaking across tests.
import { cleanup } from "@testing-library/react";
import { afterEach } from "vitest";

afterEach(cleanup);
