/**
 * GA4 → Google Sheets feed for the 1737 Hemophilia Wizard property.
 *
 * This file is pasted into the Apps Script bound to the client-facing Google Sheet; the
 * repo copy is the source of truth so it can be re-pasted, and reused for the next MLG
 * tool by changing the constants, SCREENS and LABELS. Event schema, custom-dimension
 * names and the seconds ÷ views rule: docs/analytics.md.
 *
 * What a run produces:
 *  - Five client tabs, rebuilt from scratch every run (edits to them are lost — keep
 *    notes in a tab of your own): Overview (key figures + how to read), Screens (views
 *    and time per screen in app order), Wizard (answers, recommendations, repeat runs),
 *    Engagement (drug sheets, outbound links), Audience (geography, devices, channels).
 *  - "Survey responses" is untouched — the survey endpoint (scripts/survey-endpoint.gs)
 *    owns it — and is kept right after the client tabs.
 *  - One hidden "Raw - …" tab per API query, at the end, for anyone who wants to pivot.
 *  - Three charts (Screens, Wizard ×2), inserted only when no chart with that title
 *    exists, so they survive the daily rebuild. Delete a chart to have it recreated.
 *
 * Setup. The feed runs as the ONE account that presses Run and creates the trigger, so
 * that account needs both: edit access to the Sheet (and permission to run Apps Script
 * on it — an org can block external editors) and at least Viewer on the GA property.
 * Who owns the Sheet does not matter — 1737 is an Impetus-owned Sheet in a Shared Drive,
 * run by an external Gmail that was given Viewer on the property. Check the avatar in
 * the Apps Script editor: a multi-account browser often opens it under the wrong one.
 * Never use Deploy — nothing here is a web app; Run once + a trigger is the whole install,
 * and the trigger's "Head" deployment runs whatever is saved, so edits need no redeploy.
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
 * Every run rewrites everything from START_DATE through yesterday, so GA4's 24–48 h
 * processing lag corrects itself and nothing incremental has to be tracked. Custom
 * dimensions (customEvent:*) fill from the moment they were registered in the console;
 * earlier hits show "(not set)".
 */

const PROPERTY_ID = "123456789"; // step 1 — numeric property ID
const START_DATE = "2026-09-01"; // launch date (YYYY-MM-DD)
const ROW_LIMIT = 10000;
const APP_NAME = "Hemophilia Treatment Wizard";

// ---------------------------------------------------------------------------------------
// Raw pulls: [key, tab title, dimensions, metrics, eventName filter (optional)]
// ---------------------------------------------------------------------------------------

const RAW = [
  ["totals", "Totals", [], ["activeUsers", "sessions", "screenPageViews"]],
  ["screens", "Screens", ["pagePath"], ["screenPageViews", "sessions"]],
  ["time", "Time on screen", ["customEvent:page"], ["customEvent:seconds"], "step_duration"],
  [
    "answers",
    "Wizard answers",
    ["customEvent:hemophilia_type", "customEvent:has_inhibitors", "customEvent:switch_reason"],
    ["eventCount"],
    "wizard_submit",
  ],
  [
    "recommendations",
    "Recommendations",
    ["customEvent:scenario", "customEvent:switch_reason"],
    ["eventCount"],
    "recommendation_reached",
  ],
  ["runs", "Wizard runs", ["customEvent:run"], ["eventCount"], "wizard_submit"],
  [
    "drugSheets",
    "Drug sheets",
    ["customEvent:agent", "customEvent:page"],
    ["eventCount"],
    "drug_sheet_open",
  ],
  ["links", "Link clicks", ["linkUrl"], ["eventCount"], "click"],
  ["geo", "Geography", ["country", "region"], ["activeUsers", "sessions"]],
  ["devices", "Devices", ["deviceCategory"], ["activeUsers", "sessions"]],
  [
    "channels",
    "Channels",
    ["sessionSource", "sessionMedium", "sessionCampaignName"],
    ["sessions", "activeUsers"],
  ],
];

const CLIENT_TABS = ["Overview", "Screens", "Wizard", "Engagement", "Audience"];
const SURVEY_TAB = "Survey responses";
/** Tabs an earlier version of this script created; removed on sight. */
const LEGACY_TABS = [
  "Screen views",
  "Wizard answers",
  "Recommendations",
  "Repeat runs",
  "Drug sheets",
  "Survey",
  "Link clicks",
  "Users",
  "Channel",
  "Time per screen",
  "About",
];

// ---------------------------------------------------------------------------------------
// App vocabulary → client wording. Mirrors src/data/sectionOrder.ts, wizard.ts, jumpTargets.
// ---------------------------------------------------------------------------------------

/** The 14-step spine in presentation order, then the side-menu screens. */
const SPINE = [
  ["/", "Home"],
  ["/education/disease-background", "Education 1 · Disease background"],
  ["/education/treatment-landscape", "Education 2 · Treatment landscape"],
  ["/education/rebalancing-agents", "Education 3 · Rebalancing agents"],
  ["/education/fviii-mimetics", "Education 4 · FVIII mimetics"],
  ["/education/prophylaxis-guidance", "Education 5 · Prophylaxis guidance"],
  ["/wizard-intro", "Wizard · Introduction"],
  ["/wizard", "Wizard · Patient characteristics"],
  ["/wizard/scenario", "Wizard · Scenario"],
  ["/wizard/reason", "Wizard · Reason for switching"],
  ["/wizard/therapies", "Wizard · Recommended therapies"],
  ["/explore", "Explore · Treatment comparison"],
  ["/resources", "Resources"],
  ["/survey", "Survey"],
];
const SIDE_MENU = [
  ["/how-to", "How to use"],
  ["/glossary", "Glossary"],
  ["/acronyms", "Acronyms"],
  ["/references", "References"],
];
const SCREENS = [...SPINE, ...SIDE_MENU];
const SCREEN_NAME = new Map(SCREENS);

const LABELS = {
  type: { A: "Hemophilia A", B: "Hemophilia B" },
  inhibitors: { yes: "With inhibitors", no: "Without inhibitors" },
  reason: {
    "bleeding-control": "Improve bleeding control",
    monitoring: "Reduce monitoring requirement",
    adherence: "Increase adherence",
    "treatment-burden": "Reduce treatment burden",
  },
  scenario: {
    "A-without-inhibitors": "Hemophilia A without inhibitors",
    "A-with-inhibitors": "Hemophilia A with inhibitors",
    "B-without-inhibitors": "Hemophilia B without inhibitors",
    "B-with-inhibitors": "Hemophilia B with inhibitors",
  },
  device: { desktop: "Desktop", mobile: "Mobile", tablet: "Tablet" },
};
const TYPE_ORDER = ["A", "B"];
const INHIBITOR_ORDER = ["yes", "no"];
const REASON_ORDER = ["bleeding-control", "monitoring", "adherence", "treatment-burden"];
const SCENARIO_ORDER = [
  "A-without-inhibitors",
  "A-with-inhibitors",
  "B-without-inhibitors",
  "B-with-inhibitors",
];

/** Distribution channel from the UTM pair — see docs/analytics.md → Campaign links. */
function channelLabel(source, medium) {
  if (source === "qr" || medium === "print") return "Printed QR code";
  if (medium === "email") return "Email";
  if (medium === "referral") return `Website link (${source})`;
  if (source === "(direct)" || medium === "(none)") return "Direct / untagged link";
  return `${source} / ${medium}`;
}

// ---------------------------------------------------------------------------------------
// Entry point — run by hand once, then by the daily trigger.
// ---------------------------------------------------------------------------------------

function pullReports() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const raw = {};
  for (const [key, title, dims, mets, eventName] of RAW) {
    raw[key] = runReport(dims, mets, eventName);
    writeRawTab(ss, rawTabName(title), [...dims, ...mets], raw[key]);
  }

  removeLegacyTabs(ss);
  buildOverview(ss, raw);
  buildScreens(ss, raw);
  buildWizard(ss, raw);
  buildEngagement(ss, raw);
  buildAudience(ss, raw);
  arrangeTabs(ss);
}

// ---------------------------------------------------------------------------------------
// Client tabs
// ---------------------------------------------------------------------------------------

function buildOverview(ss, raw) {
  const [users, sessions, views] = raw.totals[0] || [0, 0, 0];
  const runs = tally(raw.runs, (r) => r[0], 1);
  const reached = (k) => runs.get(String(k)) || 0; // sessions that got to run k
  const started = (raw.screens.find((r) => r[0] === "/wizard") || [0, 0, 0])[2];
  const surveyRows = surveyRowCount(ss);

  // [metric, value, meaning, number format]
  const kpis = [
    ["Users", users, "Distinct visitors in the period (GA4 active users).", "0"],
    ["Sessions", sessions, "Visits. A new session starts after 30 minutes of inactivity.", "0"],
    ["Screen views", views, "Screens shown, summed over all sessions.", "0"],
    [
      "Sessions that started the wizard",
      started,
      "Sessions that reached the patient-characteristics screen.",
      "0",
    ],
    [
      "Sessions that completed the wizard",
      reached(1),
      "Sessions that submitted all three answers at least once.",
      "0",
    ],
    ["Wizard completion rate", pct(reached(1), started), "Completed ÷ started.", "0%"],
    [
      "Wizard completions, total",
      sum(raw.answers, 3),
      "Every submission, including repeat runs within the same session.",
      "0",
    ],
    [
      "Sessions that ran the wizard again",
      reached(2),
      "Sessions with a second submission — a changed answer or a reset. Detail on the Wizard tab.",
      "0",
    ],
    [
      "Recommendation screens shown",
      sum(raw.recommendations, 2),
      "Times the recommended-therapies screen was displayed.",
      "0",
    ],
    [
      "Drug sheets opened",
      sum(raw.drugSheets, 2),
      "Every opening of an agent's drug sheet, from any screen.",
      "0",
    ],
    [
      "Outbound link clicks",
      sum(raw.links, 1),
      "Clicks on reference and resource links that leave the app.",
      "0",
    ],
    [
      "Survey responses",
      surveyRows,
      `Completed surveys — the rows on the "${SURVEY_TAB}" tab.`,
      "0",
    ],
  ];

  const sh = freshTab(ss, "Overview");
  sh.getRange(1, 1).setValue(`${APP_NAME} — usage report`).setFontSize(14).setFontWeight("bold");
  sh.getRange(2, 1)
    .setValue(
      `Data from ${START_DATE} to ${isoDate(-1)} · refreshed daily · last refresh ${isoDate(0)}`,
    )
    .setFontColor("#666666");

  let row = block(
    sh,
    4,
    1,
    "Key figures",
    ["Metric", "Value", "What it means"],
    kpis.map((k) => k.slice(0, 3)),
  );
  kpis.forEach((k, i) => sh.getRange(6 + i, 2).setNumberFormat(k[3]));

  sh.getRange(row, 1).setValue("How to read this workbook").setFontWeight("bold").setFontSize(12);
  row += 1;
  const notes = [
    "Avg seconds on screen (Screens tab) is total foreground seconds ÷ views. Time while the browser tab is hidden is not counted, and a single stay is capped at 30 minutes.",
    "Wizard runs are counted per browser tab. Opening the app in a second tab starts again at run 1, so repeat-run figures are a slight undercount.",
    "GA4 finalises data within 24–48 hours, so the most recent day may still grow.",
    "Analytics figures exclude visitors whose browsers block analytics; the Survey responses tab is unaffected by that.",
    "The hidden 'Raw - …' tabs at the end hold the unformatted exports behind every table (View → Hidden sheets).",
  ];
  for (const n of notes) sh.getRange(row++, 1, 1, 3).merge().setValue(`• ${n}`).setWrap(true);

  sh.setColumnWidth(1, 300);
  sh.setColumnWidth(2, 110);
  sh.setColumnWidth(3, 620);
  sh.getRange(6, 3, kpis.length, 1).setWrap(true);
}

function buildScreens(ss, raw) {
  const views = new Map(raw.screens.map(([p, v, s]) => [p, [v, s]]));
  const secs = new Map(raw.time.map(([p, s]) => [p, s]));
  const known = SCREENS.map(([route]) => route);
  const extra = [...new Set([...views.keys(), ...secs.keys()])]
    .filter((r) => !known.includes(r))
    .sort();
  const rows = [...known, ...extra].map((route) => {
    const [v, s] = views.get(route) || [0, 0];
    const t = secs.get(route) || 0;
    return [screenName(route), route, v, s, v ? Math.round(t / v) : ""];
  });

  const sh = freshTab(ss, "Screens");
  const row = block(
    sh,
    1,
    1,
    "Screens, in the order the app presents them",
    ["Screen", "Route", "Views", "Sessions", "Avg seconds on screen"],
    rows,
    [null, null, "0", "0", "0"],
  );
  note(
    sh,
    row,
    1,
    "Avg seconds = total foreground seconds ÷ views. Screens after the survey are reached from the side menu and sit outside the main sequence; anything below those is a redirect or a mistyped address.",
  );
  sh.setFrozenRows(2);
  sh.autoResizeColumns(1, 5);
  chartOnce(
    sh,
    [sh.getRange(2, 1, SPINE.length + 1, 1), sh.getRange(2, 3, SPINE.length + 1, 1)],
    Charts.ChartType.COLUMN,
    "Views per screen (main sequence)",
    2,
    7,
  );
}

function buildWizard(ss, raw) {
  const completions = sum(raw.answers, 3);
  const dist = (order, labels, m) =>
    withUnexpected(order, m).map((k) => [
      labelOf(labels, k),
      m.get(k) || 0,
      pct(m.get(k) || 0, completions),
    ]);
  const fmt = [null, "0", "0%"];

  const sh = freshTab(ss, "Wizard");
  block(
    sh,
    1,
    1,
    "Hemophilia type",
    ["Answer", "Completions", "%"],
    dist(
      TYPE_ORDER,
      LABELS.type,
      tally(raw.answers, (r) => r[0], 3),
    ),
    fmt,
  );
  block(
    sh,
    1,
    5,
    "Inhibitors",
    ["Answer", "Completions", "%"],
    dist(
      INHIBITOR_ORDER,
      LABELS.inhibitors,
      tally(raw.answers, (r) => r[1], 3),
    ),
    fmt,
  );
  block(
    sh,
    1,
    9,
    "Reason for switching",
    ["Answer", "Completions", "%"],
    dist(
      REASON_ORDER,
      LABELS.reason,
      tally(raw.answers, (r) => r[2], 3),
    ),
    fmt,
  );

  // Recommendations: scenario × reason grid with totals. Fixed shape, zero-filled.
  const cell = new Map(raw.recommendations.map(([sc, re, n]) => [`${sc}|${re}`, n]));
  const gridRows = SCENARIO_ORDER.map((sc) => {
    const cells = REASON_ORDER.map((re) => cell.get(`${sc}|${re}`) || 0);
    return [LABELS.scenario[sc], ...cells, cells.reduce((a, b) => a + b, 0)];
  });
  const totals = [
    "Total",
    ...REASON_ORDER.map((_, i) => gridRows.reduce((a, r) => a + r[i + 1], 0)),
  ];
  totals.push(totals.slice(1).reduce((a, b) => a + b, 0));
  let row = block(
    sh,
    9,
    1,
    "Recommendations reached — scenario × reason for switching",
    ["Scenario", ...REASON_ORDER.map((r) => LABELS.reason[r]), "Total"],
    [...gridRows, totals],
    [null, "0", "0", "0", "0", "0"],
  );
  sh.getRange(row - 2, 1, 1, 6).setFontWeight("bold");

  // Repeat runs. Each session passes run k exactly once, so "run = k" counts sessions.
  const runs = tally(raw.runs, (r) => r[0], 1);
  const reached = (k) => runs.get(String(k)) || 0;
  const runRows = [
    ["Once", Math.max(0, reached(1) - reached(2))],
    ["Twice", Math.max(0, reached(2) - reached(3))],
    ["Three times or more", reached(3)],
  ].map(([l, n]) => [l, n, pct(n, reached(1))]);
  const runsHeaderRow = row + 1;
  row = block(
    sh,
    row,
    1,
    "How many times a session ran the wizard",
    ["Runs", "Sessions", "% of completing sessions"],
    runRows,
    fmt,
  );
  note(
    sh,
    row,
    1,
    "A run is one submission of all three answers; going back to change an answer and resubmitting is a second run. Counted per browser tab.",
  );

  chartOnce(
    sh,
    [sh.getRange(2, 9, REASON_ORDER.length + 1, 2)],
    Charts.ChartType.BAR,
    "Reason for switching",
    1,
    13,
  );
  chartOnce(
    sh,
    [sh.getRange(runsHeaderRow, 1, runRows.length + 1, 2)],
    Charts.ChartType.BAR,
    "Wizard runs per session",
    row + 2,
    1,
  );
  sh.autoResizeColumns(1, 11);
}

function buildEngagement(ss, raw) {
  const agents = tally(raw.drugSheets, (r) => r[0], 2);
  const pages = [...new Set(raw.drugSheets.map((r) => r[1]))].sort(byScreenOrder);
  const cell = new Map(raw.drugSheets.map(([a, p, n]) => [`${a}|${p}`, n]));
  const rows = [...agents.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([agent, total]) => [agent, ...pages.map((p) => cell.get(`${agent}|${p}`) || 0), total]);

  const sh = freshTab(ss, "Engagement");
  let row = block(
    sh,
    1,
    1,
    "Drug sheets opened — by agent and the screen it was opened from",
    ["Agent", ...pages.map(screenName), "Total"],
    rows,
    [null, ...pages.map(() => "0"), "0"],
  );
  const links = raw.links.map(([url, n]) => [url, n]).sort((a, b) => b[1] - a[1]);
  block(sh, row, 1, "Outbound link clicks — references and resources", ["Link", "Clicks"], links, [
    null,
    "0",
  ]);
  sh.autoResizeColumns(1, Math.max(3, pages.length + 2));
}

function buildAudience(ss, raw) {
  const [, tSessions] = raw.totals[0] || [0, 0, 0];
  const share = (s) => pct(s, tSessions);

  const countries = group(raw.geo, (r) => r[0], [2, 3]);
  const countryRows = [...countries.entries()]
    .sort((a, b) => b[1][1] - a[1][1])
    .map(([c, [u, s]]) => [c, u, s, share(s)]);
  const regionRows = raw.geo.map(([c, r, u, s]) => [c, r, u, s]).sort((a, b) => b[3] - a[3]);
  const deviceRows = raw.devices
    .map(([d, u, s]) => [labelOf(LABELS.device, d), u, s, share(s)])
    .sort((a, b) => b[2] - a[2]);
  const channels = group(raw.channels, (r) => `${channelLabel(r[0], r[1])}|${r[2]}`, [3, 4]);
  const channelRows = [...channels.entries()]
    .sort((a, b) => b[1][0] - a[1][0])
    .map(([k, [s, u]]) => {
      const [channel, campaign] = k.split("|");
      return [channel, campaign === "(not set)" ? "—" : campaign, s, u, share(s)];
    });

  const sh = freshTab(ss, "Audience");
  let left = block(
    sh,
    1,
    1,
    "Countries",
    ["Country", "Users", "Sessions", "% of sessions"],
    countryRows,
    [null, "0", "0", "0%"],
  );
  block(sh, left, 1, "Regions", ["Country", "Region", "Users", "Sessions"], regionRows, [
    null,
    null,
    "0",
    "0",
  ]);
  let right = block(
    sh,
    1,
    7,
    "Devices",
    ["Device", "Users", "Sessions", "% of sessions"],
    deviceRows,
    [null, "0", "0", "0%"],
  );
  right = block(
    sh,
    right,
    7,
    "How visitors arrived",
    ["Channel", "Campaign", "Sessions", "Users", "% of sessions"],
    channelRows,
    [null, null, "0", "0", "0%"],
  );
  note(
    sh,
    right,
    7,
    "Channels come from the tagged links: printed QR code, the client website and email each carry their own tag. Untagged visits show as direct.",
  );
  sh.autoResizeColumns(1, 11);
}

// ---------------------------------------------------------------------------------------
// Sheet plumbing
// ---------------------------------------------------------------------------------------

/** Get-or-create a tab and wipe its contents and formatting. Charts are kept. */
function freshTab(ss, name) {
  const sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clear();
  sh.setFrozenRows(0);
  return sh;
}

/**
 * Title row, bold header row, data rows, optional per-column number formats.
 * Returns the row after the block plus one blank line.
 */
function block(sh, row, col, title, header, rows, formats) {
  sh.getRange(row, col).setValue(title).setFontWeight("bold").setFontSize(12);
  row += 1;
  sh.getRange(row, col, 1, header.length)
    .setValues([header])
    .setFontWeight("bold")
    .setBackground("#f1f3f4");
  row += 1;
  if (rows.length) {
    sh.getRange(row, col, rows.length, header.length).setValues(rows);
    (formats || []).forEach((f, i) => {
      if (f) sh.getRange(row, col + i, rows.length, 1).setNumberFormat(f);
    });
    row += rows.length;
  } else {
    sh.getRange(row, col).setValue("No data yet").setFontStyle("italic").setFontColor("#666666");
    row += 1;
  }
  return row + 1;
}

function note(sh, row, col, text) {
  sh.getRange(row, col, 1, 5)
    .merge()
    .setValue(text)
    .setFontStyle("italic")
    .setFontColor("#666666")
    .setWrap(true);
}

/** Insert a chart unless one with this title exists, so charts survive the daily rebuild. */
function chartOnce(sh, ranges, type, title, anchorRow, anchorCol) {
  if (sh.getCharts().some((c) => c.getOptions().get("title") === title)) return;
  const builder = sh
    .newChart()
    .setChartType(type)
    .setNumHeaders(1)
    .setPosition(anchorRow, anchorCol, 0, 0)
    .setOption("title", title)
    .setOption("legend", { position: "none" })
    .setOption("width", 560)
    .setOption("height", 320);
  ranges.forEach((r) => builder.addRange(r));
  sh.insertChart(builder.build());
}

function writeRawTab(ss, name, header, rows) {
  const sh = ss.getSheetByName(name) || ss.insertSheet(name);
  sh.clearContents();
  sh.getRange(1, 1, 1, header.length).setValues([header]).setFontWeight("bold");
  if (rows.length) sh.getRange(2, 1, rows.length, header.length).setValues(rows);
  sh.setFrozenRows(1);
}

function rawTabName(title) {
  return `Raw - ${title}`;
}

function removeLegacyTabs(ss) {
  for (const name of LEGACY_TABS) {
    const sh = ss.getSheetByName(name);
    if (sh) ss.deleteSheet(sh);
  }
  const s1 = ss.getSheetByName("Sheet1");
  if (s1 && s1.getLastRow() === 0 && ss.getSheets().length > 1) ss.deleteSheet(s1);
}

/** Client tabs first, then the survey tab, then the raw tabs — hidden. */
function arrangeTabs(ss) {
  const order = [...CLIENT_TABS, SURVEY_TAB, ...RAW.map(([, title]) => rawTabName(title))];
  let pos = 1;
  for (const name of order) {
    const sh = ss.getSheetByName(name);
    if (!sh) continue;
    if (sh.isSheetHidden()) sh.showSheet();
    ss.setActiveSheet(sh);
    ss.moveActiveSheet(pos++);
  }
  for (const [, title] of RAW) {
    const sh = ss.getSheetByName(rawTabName(title));
    if (sh) sh.hideSheet();
  }
  ss.setActiveSheet(ss.getSheetByName(CLIENT_TABS[0]));
}

/** Rows on the survey tab with a timestamp — the endpoint may leave gaps above row 7. */
function surveyRowCount(ss) {
  const sh = ss.getSheetByName(SURVEY_TAB);
  if (!sh || sh.getLastRow() < 2) return 0;
  return sh
    .getRange(2, 1, sh.getLastRow() - 1, 1)
    .getValues()
    .filter((r) => r[0] !== "").length;
}

// ---------------------------------------------------------------------------------------
// Data helpers
// ---------------------------------------------------------------------------------------

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
    ...(r.dimensionValues || []).map((d) => d.value),
    ...(r.metricValues || []).map((m) => Number(m.value)),
  ]);
}

/** Map of key → summed value at `valueIndex`. */
function tally(rows, keyOf, valueIndex) {
  const m = new Map();
  for (const r of rows) m.set(keyOf(r), (m.get(keyOf(r)) || 0) + r[valueIndex]);
  return m;
}

/** Map of key → array of sums, one per index in `valueIndexes`. */
function group(rows, keyOf, valueIndexes) {
  const m = new Map();
  for (const r of rows) {
    const k = keyOf(r);
    const acc = m.get(k) || valueIndexes.map(() => 0);
    valueIndexes.forEach((vi, i) => (acc[i] += r[vi]));
    m.set(k, acc);
  }
  return m;
}

const sum = (rows, i) => rows.reduce((a, r) => a + r[i], 0);
const pct = (n, d) => (d ? n / d : 0);
const labelOf = (labels, key) => labels[key] || key;
const screenName = (route) => SCREEN_NAME.get(route) || route;

/** Known keys in their fixed order, then anything unexpected (e.g. "(not set)") that has data. */
function withUnexpected(order, m) {
  return [...order, ...[...m.keys()].filter((k) => !order.includes(k)).sort()];
}

function byScreenOrder(a, b) {
  const ia = SCREENS.findIndex(([r]) => r === a);
  const ib = SCREENS.findIndex(([r]) => r === b);
  return (ia === -1 ? 1e9 : ia) - (ib === -1 ? 1e9 : ib) || a.localeCompare(b);
}

function isoDate(offsetDays) {
  return Utilities.formatDate(
    new Date(Date.now() + offsetDays * 864e5),
    Session.getScriptTimeZone(),
    "yyyy-MM-dd",
  );
}
