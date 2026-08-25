import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * What actually reaches gtag. `analytics.test.ts` mocks react-ga4; this file runs
 * it for real against jsdom's `window.dataLayer`, because react-ga4 rewrites some
 * param names on the way through — `ReactGA.event` maps `page` to `page_path` via
 * its Universal-Analytics field table — which a mock cannot see and which left the
 * `page` dimension empty until 2026-08-25. The script tag it injects never loads
 * under jsdom, so nothing leaves the process.
 */
type Win = Window & { dataLayer?: IArguments[]; gtag?: unknown };
const win = window as Win;

async function loadInitialized() {
  vi.resetModules();
  const analytics = await import("./analytics");
  analytics.initAnalytics("G-TEST", true);
  return analytics;
}

const pushed = () => (win.dataLayer ?? []).map((a) => Array.from(a) as unknown[]);
const events = () => pushed().filter(([kind]) => kind === "event");

beforeEach(() => {
  win.dataLayer = [];
  delete win.gtag;
});

describe("analytics on the wire", () => {
  it("configures the property with the automatic pageview off", async () => {
    await loadInitialized();
    expect(pushed()).toContainEqual(["config", "G-TEST", { send_page_view: false }]);
  });

  it("sends the pageview path as page_path", async () => {
    const analytics = await loadInitialized();
    analytics.trackPageview("/wizard");
    expect(events()).toContainEqual(["event", "page_view", { page_path: "/wizard" }]);
  });

  it("delivers event params exactly as written — `page` stays `page`", async () => {
    const analytics = await loadInitialized();
    analytics.trackDrugSheetOpen("Emicizumab", "/explore");
    analytics.trackStepDuration("/wizard/reason", 12);
    expect(events()).toContainEqual([
      "event",
      "drug_sheet_open",
      { agent: "Emicizumab", page: "/explore" },
    ]);
    expect(events()).toContainEqual([
      "event",
      "step_duration",
      { page: "/wizard/reason", seconds: 12 },
    ]);
    expect(JSON.stringify(events())).not.toContain('page_path":"/explore');
  });

  it("keeps the wizard params and the numeric metric intact", async () => {
    const analytics = await loadInitialized();
    analytics.trackWizardSubmit({ type: "B", hasInhibitors: true, reason: "monitoring" });
    const [, , params] = events().find(([, name]) => name === "wizard_submit")!;
    expect(params).toEqual({
      hemophilia_type: "B",
      has_inhibitors: "yes",
      switch_reason: "monitoring",
    });
    analytics.trackStepDuration("/education/disease-background", 42);
    const [, , step] = events().find(([, name]) => name === "step_duration")! as [
      string,
      string,
      { seconds: unknown },
    ];
    expect(typeof step.seconds).toBe("number");
  });
});
