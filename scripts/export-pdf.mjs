#!/usr/bin/env node
/**
 * Export the whole app as a PDF slide deck — one 1440×800 slide per screen,
 * in walkthrough order, every overlay opened once, every wizard branch walked.
 *
 *   npm run export:pdf                 # build → preview → capture → PDF
 *   npm run export:pdf -- --scale 1    # ~20 MB, emailable
 *   npm run export:pdf -- --skip-build # reuse the dist/ already on disk
 *
 * Flags: --out <file.pdf>  --scale 1|2 (default 2)  --quality 1..100 (default 90)
 *        --port <n> (default 4178)  --skip-build
 *
 * What it guarantees
 * - The build runs with VITE_GA_MEASUREMENT_ID forced empty, and the browser
 *   context aborts every non-localhost request, so no analytics hit and no
 *   survey POST can leave this machine. Blocked attempts are listed in the
 *   manifest; a non-empty list means the build guard failed and is reported.
 * - The viewport is exactly 1440×800 (the app's 1.00× reference board —
 *   docs/styling.md §19). Pages taller than 800 px are captured as successive
 *   800 px scroll windows, each its own slide.
 * - Every <video> is paused at t=0 before a shot; fonts, images and running
 *   CSS transitions are waited out.
 * - Overlays (native <dialog>) are opened on their first occurrence only. The
 *   ledger key is the dialog's title (plural-insensitive) plus a hash of its
 *   body, so the same drug sheet reached from three pages, or the same class
 *   table under "mimetic"/"mimetics", appears once. Wizard slides are never
 *   de-duplicated.
 *
 * Outputs: export/hemophilia-wizard-<date>.pdf, export/frames/NNN.png (lossless
 * masters at the capture scale) and export/manifest.json (one entry per slide).
 */
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { parseArgs } from "node:util";

import { PDFDocument } from "pdf-lib";
import { chromium } from "playwright";

// ---------------------------------------------------------------------------
// Configuration

const { values: flags } = parseArgs({
  options: {
    out: { type: "string" },
    scale: { type: "string", default: "2" },
    quality: { type: "string", default: "90" },
    port: { type: "string", default: "4178" },
    "skip-build": { type: "boolean", default: false },
  },
});

const SCALE = Number(flags.scale);
const QUALITY = Number(flags.quality);
const PORT = Number(flags.port);
if (![1, 2].includes(SCALE)) fail("--scale must be 1 or 2");
if (!(QUALITY >= 1 && QUALITY <= 100)) fail("--quality must be 1..100");

const ROOT = path.resolve(import.meta.dirname, "..");
const EXPORT_DIR = path.join(ROOT, "export");
const FRAMES_DIR = path.join(EXPORT_DIR, "frames");
const BASE_URL = `http://localhost:${PORT}`;
const VIEWPORT = { width: 1440, height: 800 };
const TODAY = new Date().toISOString().slice(0, 10);
const OUT_PDF = path.resolve(flags.out ?? path.join(EXPORT_DIR, `hemophilia-wizard-${TODAY}.pdf`));

/** Spine order (src/data/sectionOrder.ts), with the wizard expanded in place. */
const SPINE_BEFORE_WIZARD = [
  "/",
  "/education/disease-background",
  "/education/treatment-landscape",
  "/education/rebalancing-agents",
  "/education/fviii-mimetics",
  "/education/prophylaxis-guidance",
  "/wizard-intro",
];
const SPINE_AFTER_WIZARD = ["/explore", "/resources"]; // then /survey (two states)
const APPENDIX = ["/glossary", "/acronyms", "/references"]; // after /how-to (page only)

const TYPES = ["A", "B"];
const INHIBITORS = ["yes", "no"];
const REASONS = ["bleeding-control", "monitoring", "adherence", "treatment-burden"];

const SURVEY_SUBMITTED_KEY = "survey-submitted";

// ---------------------------------------------------------------------------
// State

/** @type {{index:number,file:string,route:string,state:string,overlay:string|null,scrollY:number}[]} */
const frames = [];
/** @type {Buffer[]} */
const jpegs = [];
/** @type {Map<string,{title:string,firstSeen:number}>} */
const ledger = new Map();
/** @type {string[]} */
const skippedOverlays = [];
/** @type {string[]} */
const blockedRequests = [];
/** @type {string[]} */
const warnings = [];

function fail(message) {
  console.error(`✖ ${message}`);
  process.exit(1);
}

function warn(message) {
  warnings.push(message);
  console.warn(`⚠ ${message}`);
}

// ---------------------------------------------------------------------------
// Build + serve

function build() {
  if (flags["skip-build"]) {
    if (!existsSync(path.join(ROOT, "dist", "index.html")))
      fail("--skip-build but dist/ is missing");
    console.log("→ reusing dist/ (--skip-build)");
    return;
  }
  console.log("→ npm run build (VITE_GA_MEASUREMENT_ID forced empty)");
  const result = spawnSync("npm", ["run", "build"], {
    cwd: ROOT,
    stdio: "inherit",
    env: { ...process.env, VITE_GA_MEASUREMENT_ID: "" },
  });
  if (result.status !== 0) fail("build failed");
}

/** The real measurement id from .env, if any — we assert it never reached dist/. */
function assertNoAnalyticsInBundle() {
  const envFile = path.join(ROOT, ".env");
  if (!existsSync(envFile)) return;
  const match = readFileSync(envFile, "utf8").match(
    /VITE_GA_MEASUREMENT_ID\s*=\s*["']?(G-[A-Z0-9]+)/,
  );
  if (!match) return;
  const id = match[1];
  const assets = path.join(ROOT, "dist", "assets");
  for (const file of readdirSync(assets)) {
    if (!file.endsWith(".js")) continue;
    if (readFileSync(path.join(assets, file), "utf8").includes(id)) {
      fail(
        `dist/assets/${file} contains the GA measurement id ${id} — refusing to capture a build that would fire analytics`,
      );
    }
  }
  console.log(`→ verified ${id} is absent from dist/`);
}

async function serve() {
  const child = spawn("npx", ["vite", "preview", "--port", String(PORT), "--strictPort"], {
    cwd: ROOT,
    stdio: ["ignore", "pipe", "pipe"],
  });
  child.stderr.on("data", (d) => process.stderr.write(d));
  const deadline = Date.now() + 30_000;
  while (Date.now() < deadline) {
    try {
      const res = await fetch(BASE_URL + "/");
      if (res.ok) {
        console.log(`→ vite preview up at ${BASE_URL}`);
        return child;
      }
    } catch {
      /* not up yet */
    }
    if (child.exitCode !== null) fail(`vite preview exited with ${child.exitCode}`);
    await new Promise((r) => setTimeout(r, 200));
  }
  child.kill();
  fail("vite preview did not come up within 30 s");
}

// ---------------------------------------------------------------------------
// Browser helpers

/**
 * Wait until the page is visually at rest: network idle, fonts loaded, every
 * image decoded, every video paused on frame 0, no CSS transition/animation
 * still running. Then a short grace period.
 */
async function settle(page) {
  await page.waitForLoadState("networkidle").catch(() => {});
  await page.evaluate(async () => {
    await document.fonts.ready;
    await Promise.all(
      Array.from(document.images).map((img) =>
        img.complete
          ? null
          : new Promise((resolve) => {
              img.addEventListener("load", resolve, { once: true });
              img.addEventListener("error", resolve, { once: true });
            }),
      ),
    );
    await Promise.all(
      Array.from(document.querySelectorAll("video")).map(async (video) => {
        video.pause();
        if (video.readyState < 2) {
          await new Promise((resolve) => {
            video.addEventListener("loadeddata", resolve, { once: true });
            setTimeout(resolve, 2000);
          });
        }
        if (video.currentTime !== 0) {
          await new Promise((resolve) => {
            video.addEventListener("seeked", resolve, { once: true });
            setTimeout(resolve, 1000);
            video.currentTime = 0;
          });
        }
      }),
    );
    const deadline = performance.now() + 2000;
    while (performance.now() < deadline) {
      const running = document.getAnimations().filter((a) => a.playState === "running");
      if (running.length === 0) break;
      await new Promise((r) => setTimeout(r, 40));
    }
  });
  await page.waitForTimeout(150);
}

/** Park the pointer where nothing has a hover style, and drop keyboard focus. */
async function neutralise(page) {
  await page.mouse.move(2, 2);
  await page.evaluate(() => {
    if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
  });
}

async function assertPath(page, expected) {
  const actual = new URL(page.url()).pathname;
  if (actual !== expected) {
    throw new Error(`expected to be on ${expected}, but the app is on ${actual}`);
  }
}

async function goto(page, route) {
  await page.goto(BASE_URL + route, { waitUntil: "load" });
  await assertPath(page, route);
  await settle(page);
  await neutralise(page);
  await settle(page);
}

/** Take one slide: PNG master to disk, JPEG kept for the PDF, manifest entry. */
async function shoot(page, { route, state, overlay = null, scrollY = 0 }) {
  const index = frames.length + 1;
  const file = `${String(index).padStart(3, "0")}.png`;
  await page.screenshot({ path: path.join(FRAMES_DIR, file), type: "png" });
  jpegs.push(await page.screenshot({ type: "jpeg", quality: QUALITY }));
  frames.push({ index, file, route, state, overlay, scrollY });
  const label = [route, state, overlay && `⧉ ${overlay}`, scrollY ? `↓${scrollY}` : null]
    .filter(Boolean)
    .join("  ·  ");
  console.log(`  ${String(index).padStart(3, " ")}  ${label}`);
}

/** Shoot the viewport, then each further 800 px window if the page scrolls. */
async function shootWindows(page, meta) {
  await page.evaluate(() => window.scrollTo(0, 0));
  await settle(page);
  await shoot(page, { ...meta, scrollY: 0 });
  let previous = 0;
  for (;;) {
    const y = await page.evaluate((h) => {
      window.scrollTo(0, window.scrollY + h);
      return window.scrollY;
    }, VIEWPORT.height);
    if (y <= previous) break;
    previous = y;
    await settle(page);
    await shoot(page, { ...meta, scrollY: y });
  }
  if (previous > 0) await page.evaluate(() => window.scrollTo(0, 0));
}

// ---------------------------------------------------------------------------
// Overlays

/**
 * Identity of the top-most open dialog: its accessible title (for humans) and
 * a hash of its body — text with the header band removed, plus image sources —
 * (for the ledger).
 */
async function topDialogIdentity(page) {
  return page.evaluate(() => {
    const open = document.querySelectorAll("dialog[open]");
    if (open.length === 0) return null;
    const top = open[open.length - 1];
    const nameFrom = (el) => el.getAttribute("aria-label") ?? el.textContent ?? "";
    let title = top.getAttribute("aria-label") ?? "";
    const labelledBy = top.getAttribute("aria-labelledby");
    if (labelledBy) {
      title = labelledBy
        .split(/\s+/)
        .map((id) => document.getElementById(id))
        .filter(Boolean)
        .map(nameFrom)
        .join(" — ");
    }
    const clone = top.cloneNode(true);
    clone.querySelectorAll("header").forEach((h) => h.remove());
    const text = (clone.textContent ?? "").replace(/\s+/g, " ").trim();
    const images = Array.from(clone.querySelectorAll("img"))
      .map((img) => img.getAttribute("src"))
      .join("|");
    return { title: title.trim(), body: `${text}\n${images}`, depth: open.length };
  });
}

/**
 * Ledger key: title + body. The title is normalised (case, trailing plural
 * "s") so "Factor VIII mimetic" and "Factor VIII mimetics" — the same class
 * table under the two wordings the tree uses — count once, while "FIX
 * prophylaxis" and "Recombinant FVIII concentrates" (same rows, different
 * class) stay distinct.
 */
function keyOf(identity) {
  const title = identity.title.toLowerCase().replace(/s\b/g, "");
  return createHash("sha1").update(`${title}\n${identity.body}`).digest("hex").slice(0, 12);
}

/** Close the top-most dialog via its ✕ (a mouse close leaves no focus ring). */
async function closeTopDialog(page) {
  const top = page.locator("dialog[open]").last();
  const close = top.locator('button[aria-label^="Close "]').first();
  if (await close.count()) await close.click();
  else await page.keyboard.press("Escape");
  await settle(page);
  await neutralise(page);
}

async function closeAllDialogs(page) {
  for (let i = 0; i < 4 && (await page.locator("dialog[open]").count()) > 0; i++) {
    await closeTopDialog(page);
  }
  if (await page.locator("dialog[open]").count()) throw new Error("a dialog refused to close");
}

/**
 * Indices (into `button[aria-haspopup="dialog"]`) of the triggers that sit on
 * the page itself — not inside any dialog.
 */
async function pageTriggerIndices(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('button[aria-haspopup="dialog"]'))
      .map((b, i) => (b.closest("dialog") ? -1 : i))
      .filter((i) => i >= 0),
  );
}

/**
 * Triggers inside the top-most open dialog, as accessible labels: real nested
 * dialogs (`aria-haspopup`) and in-place steps ("View mechanism").
 */
async function nestedTriggerLabels(page) {
  return page.evaluate(() => {
    const open = document.querySelectorAll("dialog[open]");
    const top = open[open.length - 1];
    const out = [];
    for (const b of top.querySelectorAll("button")) {
      if (b.closest("dialog[open]") !== top) continue;
      const label = b.getAttribute("aria-label") ?? b.textContent?.trim() ?? "";
      if (b.getAttribute("aria-haspopup") === "dialog" && !label.startsWith("Close ")) {
        out.push({ kind: "dialog", label });
      } else if (/^view mechanism$/i.test(label)) {
        out.push({ kind: "step", label });
      }
    }
    return out;
  });
}

/** Capture the current top dialog if its content hasn't been seen; returns true if shot. */
async function captureTopDialogOnce(page, route, state) {
  const identity = await topDialogIdentity(page);
  if (!identity) return false;
  const key = keyOf(identity);
  if (ledger.has(key)) {
    skippedOverlays.push(
      `${route} (${state}) → "${identity.title}" already shown as slide ${ledger.get(key).firstSeen}`,
    );
    return false;
  }
  await shoot(page, { route, state, overlay: identity.title });
  ledger.set(key, { title: identity.title, firstSeen: frames.length });
  return true;
}

/** Open every overlay reachable from the page (one level of nesting), first occurrence only. */
async function captureOverlays(page, route, state) {
  const indices = await pageTriggerIndices(page);
  for (const i of indices) {
    const trigger = page.locator('button[aria-haspopup="dialog"]').nth(i);
    await trigger.click();
    await settle(page);
    await neutralise(page);
    await settle(page);
    if ((await page.locator("dialog[open]").count()) === 0) {
      warn(`${route}: trigger #${i} opened no dialog`);
      continue;
    }
    const shot = await captureTopDialogOnce(page, route, state);

    if (shot) {
      // One level of nesting: lightboxes over a card, and in-place steps.
      const nested = await nestedTriggerLabels(page);
      for (const { kind, label } of nested) {
        const top = page.locator("dialog[open]").last();
        const inner =
          kind === "dialog"
            ? top.locator(`button[aria-label="${label}"]`).first()
            : top.getByRole("button", { name: label, exact: true }).first();
        if ((await inner.count()) === 0) continue;
        const depthBefore = await page.locator("dialog[open]").count();
        await inner.click();
        await settle(page);
        await neutralise(page);
        await settle(page);
        await captureTopDialogOnce(page, route, state);
        const depthAfter = await page.locator("dialog[open]").count();
        if (depthAfter > depthBefore) {
          await closeTopDialog(page);
        } else {
          // Content swapped in place — step back if the card offers it.
          const back = page
            .locator("dialog[open]")
            .last()
            .locator('button[aria-label^="Back to "]');
          if (await back.count()) {
            await back.first().click();
            await settle(page);
            await neutralise(page);
          }
        }
      }
    }
    await closeAllDialogs(page);
  }
}

// ---------------------------------------------------------------------------
// Page recipes

/** A plain page: base (with scroll windows), then its overlays. */
async function capturePage(page, route, { overlays = true, state = "page" } = {}) {
  await goto(page, route);
  await shootWindows(page, { route, state });
  if (overlays) await captureOverlays(page, route, state);
}

/** Click a radio's label only if it isn't already the selection (a second click deselects). */
async function choose(page, name, value) {
  const input = page.locator(`input[type="radio"][name="${name}"][value="${value}"]`);
  if (await input.isChecked()) return;
  await page.locator(`label:has(input[name="${name}"][value="${value}"])`).click();
  await neutralise(page);
  await settle(page);
}

async function submit(page, nextRoute) {
  await page.getByRole("button", { name: "Submit inputs", exact: true }).click();
  await page.waitForURL(`**${nextRoute}`);
  await assertPath(page, nextRoute);
  await settle(page);
  await neutralise(page);
  await settle(page);
}

async function railNext(page, nextRoute) {
  await page.getByRole("button", { name: "Next", exact: true }).click();
  await page.waitForURL(`**${nextRoute}`);
  await assertPath(page, nextRoute);
  await settle(page);
  await neutralise(page);
  await settle(page);
}

/** /wizard/therapies: base (Considerations open), its drug sheets, then the Strategies pane. */
async function captureLeaf(page, state) {
  const route = "/wizard/therapies";
  await shootWindows(page, { route, state });
  await captureOverlays(page, route, state);
  const closedPanes = page.locator('button[aria-expanded="false"][aria-controls]');
  const n = await closedPanes.count();
  for (let i = 0; i < n; i++) {
    const pane = page.locator('button[aria-expanded="false"][aria-controls]').first();
    const label = (await pane.textContent())?.trim() ?? `pane ${i + 1}`;
    await pane.click();
    await neutralise(page);
    await settle(page);
    await shoot(page, { route, state: `${state} · ${label}` });
  }
}

/** The whole wizard, depth-first, driven through the real UI. */
async function captureWizard(page) {
  await goto(page, "/wizard");
  await shootWindows(page, { route: "/wizard", state: "unselected" });

  let reasonPageShown = false;
  for (const type of TYPES) {
    for (const inhibitors of INHIBITORS) {
      const scenario = `${type}-${inhibitors === "yes" ? "with" : "without"}-inhibitors`;
      await goto(page, "/wizard");
      await choose(page, "hemophilia-type", type);
      await choose(page, "inhibitors", inhibitors);
      await shootWindows(page, { route: "/wizard", state: `selected ${scenario}` });

      await submit(page, "/wizard/scenario");
      await shootWindows(page, { route: "/wizard/scenario", state: scenario });
      await captureOverlays(page, "/wizard/scenario", scenario);

      await railNext(page, "/wizard/reason");
      if (!reasonPageShown) {
        const anyChecked = await page.locator('input[name="switch-reason"]:checked').count();
        if (anyChecked) warn("/wizard/reason had a pre-selected reason on first visit");
        await shootWindows(page, { route: "/wizard/reason", state: "unselected" });
        reasonPageShown = true;
      }

      for (const reason of REASONS) {
        await goto(page, "/wizard/reason");
        await choose(page, "switch-reason", reason);
        await shootWindows(page, {
          route: "/wizard/reason",
          state: `${scenario} · selected ${reason}`,
        });
        await submit(page, "/wizard/therapies");
        await captureLeaf(page, `${scenario} · ${reason}`);
      }
    }
  }
}

async function captureSurvey(page) {
  await capturePage(page, "/survey", { overlays: false, state: "form" });
  await page.evaluate((key) => sessionStorage.setItem(key, "true"), SURVEY_SUBMITTED_KEY);
  await goto(page, "/survey");
  await shootWindows(page, { route: "/survey", state: "thank-you" });
  await page.evaluate((key) => sessionStorage.removeItem(key), SURVEY_SUBMITTED_KEY);
}

// ---------------------------------------------------------------------------
// PDF + manifest

async function writePdf() {
  const pdf = await PDFDocument.create();
  pdf.setTitle("Hemophilia Treatment Wizard");
  pdf.setProducer("scripts/export-pdf.mjs");
  for (const jpeg of jpegs) {
    const image = await pdf.embedJpg(jpeg);
    const slide = pdf.addPage([VIEWPORT.width, VIEWPORT.height]);
    slide.drawImage(image, { x: 0, y: 0, width: VIEWPORT.width, height: VIEWPORT.height });
  }
  const bytes = await pdf.save();
  mkdirSync(path.dirname(OUT_PDF), { recursive: true });
  writeFileSync(OUT_PDF, bytes);
  return bytes.byteLength;
}

function writeManifest() {
  const manifest = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    viewport: VIEWPORT,
    scale: SCALE,
    jpegQuality: QUALITY,
    pdf: path.relative(ROOT, OUT_PDF),
    slides: frames.length,
    frames,
    overlayLedger: Array.from(ledger.values()),
    skippedOverlays,
    blockedRequests,
    warnings,
  };
  writeFileSync(path.join(EXPORT_DIR, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n");
}

// ---------------------------------------------------------------------------
// Main

async function main() {
  build();
  assertNoAnalyticsInBundle();

  rmSync(FRAMES_DIR, { recursive: true, force: true });
  mkdirSync(FRAMES_DIR, { recursive: true });

  const server = await serve();
  const browser = await chromium.launch();
  try {
    const context = await browser.newContext({
      viewport: VIEWPORT,
      deviceScaleFactor: SCALE,
      colorScheme: "light",
    });
    await context.route("**/*", (route) => {
      const url = new URL(route.request().url());
      if (url.hostname === "localhost" || url.hostname === "127.0.0.1") return route.continue();
      blockedRequests.push(url.href);
      return route.abort();
    });
    const page = await context.newPage();
    page.on("pageerror", (err) => warn(`page error: ${err.message}`));

    console.log(`→ capturing at ${VIEWPORT.width}×${VIEWPORT.height} @${SCALE}x, JPEG q${QUALITY}`);
    for (const route of SPINE_BEFORE_WIZARD) await capturePage(page, route);
    await captureWizard(page);
    for (const route of SPINE_AFTER_WIZARD) await capturePage(page, route);
    await captureSurvey(page);
    await capturePage(page, "/how-to", { overlays: false });
    for (const route of APPENDIX) await capturePage(page, route);

    await context.close();
  } finally {
    await browser.close();
    server.kill();
  }

  const bytes = await writePdf();
  writeManifest();

  console.log("");
  console.log(
    `✔ ${frames.length} slides → ${path.relative(ROOT, OUT_PDF)} (${(bytes / 1e6).toFixed(1)} MB)`,
  );
  console.log(`  frames: ${path.relative(ROOT, FRAMES_DIR)}/  ·  manifest: export/manifest.json`);
  console.log(
    `  overlays shown once: ${ledger.size}  ·  repeat openings skipped: ${skippedOverlays.length}`,
  );
  if (blockedRequests.length) {
    warn(
      `${blockedRequests.length} external request(s) were attempted and blocked — see manifest.blockedRequests`,
    );
  } else {
    console.log("  external requests: none attempted");
  }
  if (warnings.length) {
    console.log(`  ${warnings.length} warning(s) — see manifest.warnings`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
