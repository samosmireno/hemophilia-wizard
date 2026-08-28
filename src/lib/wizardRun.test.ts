import { afterEach, describe, expect, it, vi } from "vitest";

/** The module keeps the counter in module state, so every test gets a fresh copy —
 *  `vi.resetModules` + re-import is also what a page reload looks like to it. */
async function loadWizardRun() {
  vi.resetModules();
  return import("./wizardRun");
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("wizardRun", () => {
  it("is 0 before any submit", async () => {
    const { currentWizardRun } = await loadWizardRun();
    expect(currentWizardRun()).toBe(0);
  });

  it("counts submits from 1, and current reports the latest", async () => {
    const { currentWizardRun, nextWizardRun } = await loadWizardRun();

    expect(nextWizardRun()).toBe(1);
    expect(nextWizardRun()).toBe(2);
    expect(nextWizardRun()).toBe(3);
    expect(currentWizardRun()).toBe(3);
  });

  it("persists the count in sessionStorage under the versioned key", async () => {
    const { RUNS_STORAGE_KEY, nextWizardRun } = await loadWizardRun();

    nextWizardRun();
    nextWizardRun();

    expect(sessionStorage.getItem(RUNS_STORAGE_KEY)).toBe("2");
  });

  it("survives a reload: a re-imported module continues where storage left off", async () => {
    const first = await loadWizardRun();
    first.nextWizardRun();
    first.nextWizardRun();

    const reloaded = await loadWizardRun();

    expect(reloaded.currentWizardRun()).toBe(2);
    expect(reloaded.nextWizardRun()).toBe(3);
  });

  it("treats garbage in storage as a fresh session", async () => {
    for (const garbage of ["abc", "-1", "2.5", "0", "", "[object Object]"]) {
      const { RUNS_STORAGE_KEY, currentWizardRun, nextWizardRun } = await loadWizardRun();
      sessionStorage.setItem(RUNS_STORAGE_KEY, garbage);

      expect(currentWizardRun(), garbage).toBe(0);
      expect(nextWizardRun(), garbage).toBe(1);
    }
  });

  it("keeps counting in memory when storage throws", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const { currentWizardRun, nextWizardRun } = await loadWizardRun();

    expect(currentWizardRun()).toBe(0);
    expect(nextWizardRun()).toBe(1);
    expect(nextWizardRun()).toBe(2);
    expect(currentWizardRun()).toBe(2);
  });

  it("keeps counting in memory when only the write fails", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    const { nextWizardRun } = await loadWizardRun();

    expect(nextWizardRun()).toBe(1);
    expect(nextWizardRun()).toBe(2);
  });
});
