import { beforeEach, describe, expect, it, vi } from "vitest";

const { initialize, send, event } = vi.hoisted(() => ({
  initialize: vi.fn(),
  send: vi.fn(),
  event: vi.fn(),
}));

vi.mock("react-ga4", () => ({ default: { initialize, send, event } }));

/** The module keeps its enabled flag in module state, so every test gets a
 *  fresh copy — `initAnalytics` from one test must not leak into the next. */
async function loadAnalytics() {
  vi.resetModules();
  return import("./analytics");
}

const ANSWERS = { type: "A", hasInhibitors: false, reason: "adherence" } as const;

beforeEach(() => {
  vi.clearAllMocks();
});

describe("initAnalytics", () => {
  it("does not initialize without a measurement ID", async () => {
    const analytics = await loadAnalytics();
    analytics.initAnalytics(undefined, true);
    analytics.initAnalytics("", true);
    expect(initialize).not.toHaveBeenCalled();
  });

  it("does not initialize outside production, even with an ID", async () => {
    const analytics = await loadAnalytics();
    analytics.initAnalytics("G-TEST", false);
    expect(initialize).not.toHaveBeenCalled();
  });

  it("initializes with the automatic first pageview disabled", async () => {
    const analytics = await loadAnalytics();
    analytics.initAnalytics("G-TEST", true);
    expect(initialize).toHaveBeenCalledExactlyOnceWith("G-TEST", {
      gtagOptions: { send_page_view: false },
    });
  });
});

describe("tracking before init", () => {
  it("is a no-op across every tracker", async () => {
    const analytics = await loadAnalytics();
    analytics.trackPageview("/wizard");
    analytics.trackWizardSubmit(ANSWERS);
    analytics.trackRecommendationReached(ANSWERS);
    analytics.trackDrugSheetOpen("Fitusiran", "/explore");
    analytics.trackSurveySubmit();
    expect(send).not.toHaveBeenCalled();
    expect(event).not.toHaveBeenCalled();
  });
});

describe("tracking after init", () => {
  async function loadInitialized() {
    const analytics = await loadAnalytics();
    analytics.initAnalytics("G-TEST", true);
    return analytics;
  }

  it("sends a pageview per path", async () => {
    const analytics = await loadInitialized();
    analytics.trackPageview("/wizard");
    expect(send).toHaveBeenCalledExactlyOnceWith({ hitType: "pageview", page: "/wizard" });
  });

  it("maps the wizard answers onto three separate params", async () => {
    const analytics = await loadInitialized();
    analytics.trackWizardSubmit({ type: "B", hasInhibitors: true, reason: "monitoring" });
    expect(event).toHaveBeenCalledExactlyOnceWith("wizard_submit", {
      hemophilia_type: "B",
      has_inhibitors: "yes",
      switch_reason: "monitoring",
    });
  });

  it("derives the scenario for a recommendation, without agent names", async () => {
    const analytics = await loadInitialized();
    analytics.trackRecommendationReached(ANSWERS);
    expect(event).toHaveBeenCalledExactlyOnceWith("recommendation_reached", {
      scenario: "A-without-inhibitors",
      switch_reason: "adherence",
    });
  });

  it("tags a drug-sheet open with agent and page", async () => {
    const analytics = await loadInitialized();
    analytics.trackDrugSheetOpen("Emicizumab", "/wizard/therapies");
    expect(event).toHaveBeenCalledExactlyOnceWith("drug_sheet_open", {
      agent: "Emicizumab",
      page: "/wizard/therapies",
    });
  });

  it("ignores the /how-to legend's demo drug sheet", async () => {
    const analytics = await loadInitialized();
    analytics.trackDrugSheetOpen("Fitusiran", "/how-to");
    expect(event).not.toHaveBeenCalled();
  });

  it("sends a bare survey_submit", async () => {
    const analytics = await loadInitialized();
    analytics.trackSurveySubmit();
    expect(event).toHaveBeenCalledExactlyOnceWith("survey_submit", {});
  });
});
