import { beforeEach, describe, expect, it, vi } from "vitest";

import { MAX_STEP_SECONDS, createStepTimer } from "./stepTimer";

let t = 0;
const report = vi.fn();
const timer = () => createStepTimer(report, () => t);

beforeEach(() => {
  t = 0;
  report.mockClear();
});

describe("createStepTimer", () => {
  it("reports the previous route's whole seconds when a new one is entered", () => {
    const s = timer();
    s.enter("/a", true);
    t = 5400;
    s.enter("/b", true);
    expect(report).toHaveBeenCalledExactlyOnceWith("/a", 5);
  });

  it("reports nothing for the first route until it is left", () => {
    const s = timer();
    s.enter("/a", true);
    t = 5000;
    expect(report).not.toHaveBeenCalled();
  });

  it("pauses while hidden: hide reports the chunk so far, show resumes, the rest comes on leave", () => {
    const s = timer();
    s.enter("/a", true);
    t = 3000;
    s.hide();
    expect(report).toHaveBeenCalledExactlyOnceWith("/a", 3);
    t = 60_000; // an hour away from the tab would count the same
    s.show();
    t = 62_000;
    s.enter("/b", true);
    expect(report).toHaveBeenNthCalledWith(2, "/a", 2);
    expect(report).toHaveBeenCalledTimes(2);
  });

  it("does not start the clock for a route entered while hidden", () => {
    const s = timer();
    s.enter("/a", false);
    t = 10_000;
    s.show();
    t = 14_000;
    s.enter("/b", true);
    expect(report).toHaveBeenCalledExactlyOnceWith("/a", 4);
  });

  it("ignores a redundant show while already running", () => {
    const s = timer();
    s.enter("/a", true);
    t = 2000;
    s.show();
    t = 4000;
    s.end();
    expect(report).toHaveBeenCalledExactlyOnceWith("/a", 4);
  });

  it("drops sub-second chunks, so redirect hops report nothing", () => {
    const s = timer();
    s.enter("/education", true);
    t = 40;
    s.enter("/education/disease-background", true);
    t = 1540;
    s.enter("/b", true);
    expect(report).toHaveBeenCalledExactlyOnceWith("/education/disease-background", 2);
  });

  it("caps a chunk at MAX_STEP_SECONDS", () => {
    const s = timer();
    s.enter("/a", true);
    t = 3 * 60 * 60 * 1000;
    s.hide();
    expect(report).toHaveBeenCalledExactlyOnceWith("/a", MAX_STEP_SECONDS);
  });

  it("end reports what accrued and forgets the route", () => {
    const s = timer();
    s.enter("/a", true);
    t = 2000;
    s.end();
    expect(report).toHaveBeenCalledExactlyOnceWith("/a", 2);
    t = 9000;
    s.show();
    s.hide();
    expect(report).toHaveBeenCalledTimes(1);
  });
});
