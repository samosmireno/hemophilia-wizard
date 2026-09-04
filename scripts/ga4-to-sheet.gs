/**
 * GA4 → Google Sheets feed for the 1737 Hemophilia Wizard property.
 *
 * This file is pasted into the Apps Script bound to the client-facing Google Sheet; the
 * repo copy is the source of truth so it can be re-pasted, and reused for the next MLG
 * tool by changing the constants and the REPORTS table. Event schema, custom-dimension
 * names and the seconds ÷ views rule: docs/analytics.md.
 *
 * Setup. The feed runs as the ONE account that presses Run and creates the trigger, so
 * that account needs both: edit access to the Sheet (and permission to run Apps Script
 * on it — an org can block external editors) and at least Viewer on the GA property.
 * Who owns the Sheet does not matter — 1737 is an Impetus-owned Sheet in a Shared Drive,
 * run by an external Gmail that was given Viewer on the property. Check the avatar in
 * the Apps Script editor: a multi-account browser often opens it under the wrong one.
 * Never use Deploy — nothing here is a web app; Run once + a trigger is the whole install.
 *  1. GA4 → Admin → Property settings → Property details → copy the numeric Property ID
 *     (nine digits — NOT the G-… measurement ID).
 *  2. Open the Sheet → Extensions → Apps Script.
 *  3. Left sidebar → Services (+) → "Google Analytics Data API" → Add (it appears as
 *     `AnalyticsData`; no API keys or OAuth config needed).
 *  4. Paste this file over Code.gs; set PROPERTY_ID and START_DATE; save.
 *  5. Toolbar → select `pullReports` → Run → Review permissions → Allow. Tabs appear.
 *  6. Left sidebar → Triggers (clock) → Add Trigger → function `pullReports`,
 *     Time-driven, Day timer, 6–7am → Save.
 *  7. Share → General access → Anyone with the link → Viewer → send the link. In a Shared
 *     Drive this is governed by the drive's settings, so a drive manager may have to do it.
 *
 * Every run rewrites every tab from START_DATE through yesterday, so GA4's 24–48 h
 * processing lag corrects itself and nothing incremental has to be tracked. Custom
 * dimensions (customEvent:*) fill from the moment they were registered in the console;
 * earlier hits show "(not set)".
 */

const PROPERTY_ID = "123456789"; // step 1 — numeric property ID
const START_DATE = "2026-09-01"; // launch date (YYYY-MM-DD)
const ROW_LIMIT = 10000;

/** One tab per row: [tab name, dimensions, metrics, eventName filter (optional)]. */
const REPORTS = [
  ["Screen views", ["pagePath"], ["screenPageViews"]],
  [
    "Wizard answers",
    ["customEvent:hemophilia_type", "customEvent:has_inhibitors", "customEvent:switch_reason"],
    ["eventCount"],
    "wizard_submit",
  ],
  [
    "Recommendations",
    ["customEvent:scenario", "customEvent:switch_reason"],
    ["eventCount"],
    "recommendation_reached",
  ],
  ["Repeat runs", ["customEvent:run"], ["eventCount"], "wizard_submit"],
  ["Drug sheets", ["customEvent:agent", "customEvent:page"], ["eventCount"], "drug_sheet_open"],
  ["Survey", ["date"], ["eventCount"], "survey_submit"],
  ["Link clicks", ["linkUrl"], ["eventCount"], "click"],
  ["Users", ["country", "region", "deviceCategory"], ["activeUsers", "sessions"]],
  [
    "Channel",
    ["sessionSource", "sessionMedium", "sessionCampaignName"],
    ["sessions", "activeUsers"],
  ],
];

/** Entry point — run by hand once, then by the daily trigger. */
function pullReports() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  for (const [tab, dims, mets, eventName] of REPORTS) {
    writeTab(ss, tab, [...dims, ...mets], runReport(dims, mets, eventName));
  }

  writeTab(ss, "Time per screen", ["route", "stepSeconds", "views", "avgSeconds"], timePerScreen());

  writeTab(
    ss,
    "About",
    ["", ""],
    [
      ["Last updated", new Date()],
      ["Date range", `${START_DATE} → yesterday (rewritten daily)`],
      ["Property", PROPERTY_ID],
      [
        "Time per screen",
        "avgSeconds = stepSeconds ÷ views — step_duration events are split by tab-hides, so their count is not a visit count",
      ],
    ],
  );
}

/**
 * Use time per route, per docs/analytics.md: Step seconds ÷ Views, where Views is the
 * route's pageviews — never an average of the step_duration event values.
 */
function timePerScreen() {
  const seconds = new Map(
    runReport(["customEvent:page"], ["customEvent:seconds"], "step_duration").map(([route, s]) => [
      route,
      s,
    ]),
  );
  const views = new Map(
    runReport(["pagePath"], ["screenPageViews"]).map(([route, v]) => [route, v]),
  );
  const routes = [...new Set([...seconds.keys(), ...views.keys()])].sort();

  return routes.map((route) => {
    const s = seconds.get(route) || 0;
    const v = views.get(route) || 0;
    return [route, s, v, v ? Math.round(s / v) : ""];
  });
}

/** One Data API call → array of rows, dimension values as strings, metrics as numbers. */
function runReport(dims, mets, eventName) {
  const request = {
    dateRanges: [{ startDate: START_DATE, endDate: "yesterday" }],
    dimensions: dims.map((name) => ({ name })),
    metrics: mets.map((name) => ({ name })),
    limit: ROW_LIMIT,
  };
  if (eventName) {
    request.dimensionFilter = {
      filter: { fieldName: "eventName", stringFilter: { matchType: "EXACT", value: eventName } },
    };
  }

  const res = AnalyticsData.Properties.runReport(request, `properties/${PROPERTY_ID}`);
  return (res.rows || []).map((r) => [
    ...r.dimensionValues.map((d) => d.value),
    ...r.metricValues.map((m) => Number(m.value)),
  ]);
}

/** Replace a tab's contents with a header row plus data rows (creates the tab if missing). */
function writeTab(ss, name, header, rows) {
  const sheet = ss.getSheetByName(name) || ss.insertSheet(name);
  sheet.clearContents();
  sheet.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight("bold");
  if (rows.length) sheet.getRange(2, 1, rows.length, header.length).setValues(rows);
  sheet.setFrozenRows(1);
}
