#!/usr/bin/env node
/**
 * The client review deck of the whole app, in this app's own walk: one 1440 × 800 slide per
 * screen in spine order, every switchable state and every sheet beside the page that shows
 * it, the wizard walked branch by branch through the real radios, and the review map in
 * front — the overview, then a page per branch, every thumbnail a link to its page. The deck
 * is mlg-review-deck's standard (its docs/format.md) drawn by its core; the walk is planned
 * here, because the generic crawl cannot read this app's shape (2026-09-09).
 *
 *   npm run export:pdf                  # build → preview → capture → PDF
 *   npm run export:pdf -- --scale 1     # mail-sized copy
 *   npm run export:pdf -- --skip-build  # reuse the dist/ already on disk
 *
 * Flags: --out <file.pdf>  --scale 1|2 (default 2)  --quality 1..100 (default 90)
 *        --port <n> (default 4178)  --skip-build
 *        --pages map|slides|both (default both): the map and its branch pages alone (the
 *        file suffixed -map, its thumbnails unlinked), the slides alone (-slides), or the deck
 *
 * The walk
 * - The spine in src/data/sectionOrder.ts order: the landing, the five education pages, the
 *   wizard intro, the wizard, Explore (the table as it loads — its filters are not walked),
 *   Resources, Survey (the form, then the thank-you as its state). Then the rail's off-spine
 *   pages: How to Use (its demo popups and drawers deliberately not opened), Glossary,
 *   Acronyms, References. A page taller than 800 px is one taller slide.
 * - A page, then what it can switch to or open, then the flow goes on. First every other
 *   position of a switchable — an accordion drawer, a tab — each a state beside the page,
 *   never a state of another position; then every sheet the page opens, and the lightboxes
 *   and "View mechanism" steps inside a sheet, one level down.
 * - A sheet seen again is not re-shot: it is keyed by its title plus a hash of its body, so
 *   the same drug sheet reached from three pages appears once. A switchable's positions are
 *   the page's own content and are always shot — every leaf shows its Strategies drawer.
 * - The wizard, depth-first: the input screen empty once; per disease type, the screen with
 *   the type picked; per inhibitors answer, the screen with both picked, Submit, the scenario
 *   page and its class sheets, Next; per reason, the question with the reason picked (the
 *   blank question is not a slide — the standard's rule 3), Submit, the leaf with
 *   Considerations open, then Strategies open, then its drug sheets. Wizard screens are never
 *   de-duplicated.
 * - Never a GA hit or a survey POST: the build runs with VITE_GA_MEASUREMENT_ID forced empty
 *   and the browser context aborts every non-localhost request. Attempts are listed in
 *   report.json and reported.
 *
 * Output (the standard's §8): documents/export/<name>-<date>-<sha7>.pdf, a folder of the same
 * name beside it with the page images (NNN-<slide>--<crumbs>.jpg), deck.json (the manifest
 * the core drew from) and report.json (the ledger, the skipped re-openings, blocked requests,
 * warnings).
 *
 * The core is imported from a checkout of mlg-review-deck beside this repo (or
 * REVIEW_DECK_DIR): its git-pinned package ships only the crawl's bin, not the core.
 */
import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { parseArgs } from "node:util";

import { PDFDocument, PDFName } from "pdf-lib";
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
    pages: { type: "string", default: "both" },
  },
});

const SCALE = Number(flags.scale);
const QUALITY = Number(flags.quality);
const PORT = Number(flags.port);
if (![1, 2].includes(SCALE)) fail("--scale must be 1 or 2");
if (!(QUALITY >= 1 && QUALITY <= 100)) fail("--quality must be 1..100");
/** What the PDF holds: the map pages, the slides, or both. */
const PAGES = flags.pages;
if (!["map", "slides", "both"].includes(PAGES)) fail("--pages must be map, slides or both");

const ROOT = path.resolve(import.meta.dirname, "..");
const BASE_URL = `http://localhost:${PORT}`;
const VIEWPORT = { width: 1440, height: 800 };

const CORE_DIR = process.env.REVIEW_DECK_DIR ?? path.resolve(ROOT, "..", "mlg-review-deck");
const CORE_ENTRY = path.join(CORE_DIR, "core", "src", "index.ts");
if (!existsSync(CORE_ENTRY)) {
  fail(
    `mlg-review-deck's core not found at ${CORE_ENTRY} — clone mlg-review-deck beside this repo (and npm install it), or point REVIEW_DECK_DIR at a checkout`,
  );
}
const { ReviewPdf, validateManifest, slideFileName, deckFileName, normaliseHeading, logLine } =
  await import(pathToFileURL(CORE_ENTRY).href);

const PKG = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8"));
const SHA = spawnSync("git", ["rev-parse", "--short=7", "HEAD"], {
  cwd: ROOT,
  encoding: "utf8",
}).stdout?.trim();
/** The manifest's head — the standard's name, date and sha name the file. */
const META = {
  name: PKG.name,
  date: new Date().toISOString().slice(0, 10),
  ...(SHA ? { sha: SHA } : {}),
  source: BASE_URL,
  creator: `${PKG.name}/scripts/export-pdf.mjs`,
  scale: SCALE,
  title: "Hemophilia Treatment Wizard",
};
const OUT_PDF = flags.out
  ? path.resolve(flags.out)
  : path.join(
      ROOT,
      "documents",
      "export",
      `${deckFileName(META)}${PAGES === "both" ? "" : `-${PAGES}`}.pdf`,
    );
/** The page images, deck.json and report.json: one folder per deck, whatever --pages holds. */
const OUT_DIR = path.join(ROOT, "documents", "export", deckFileName(META));

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
const SPINE_AFTER_WIZARD = ["/explore", "/resources"]; // then /survey (form + thank-you)
/** The rail's off-spine pages, after the survey: How to Use (page only), then the references. */
const RAIL = ["/how-to", "/glossary", "/acronyms", "/references"];

const TYPES = ["A", "B"];
const INHIBITORS = ["yes", "no"];
const REASONS = ["bleeding-control", "monitoring", "adherence", "treatment-burden"];

const SURVEY_SUBMITTED_KEY = "survey-submitted";

/** A switchable's other positions (closed drawers, unselected tabs) and its position at load. */
const SWITCH_CLOSED = '[aria-expanded="false"][aria-controls], [role="tab"][aria-selected="false"]';
const SWITCH_OPEN = '[aria-expanded="true"][aria-controls], [role="tab"][aria-selected="true"]';

// ---------------------------------------------------------------------------
// State

/** The manifest's slides, in deck order. @type {object[]} */
const slides = [];
/** One JPEG per slide. @type {Buffer[]} */
const images = [];
/** With --pages map: a 720 px copy of each shot, all the map-only deck's slides need. @type {Buffer[]} */
const thumbs = [];
/** The map draws a slide at 180 pt; 720 px keeps it crisp when zoomed. */
const THUMB_WIDTH = 720;
/** A state's key (title + body hash) → the slide that shows it. @type {Map<string,{title:string,page:number}>} */
const ledger = new Map();
/** @type {{what:string,host:string,at:number}[]} */
const skipped = [];
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

/** A click, then the page at rest. */
async function click(page, locator) {
  await locator.click();
  await neutralise(page);
  await settle(page);
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

/** The slide's name: the page heading (its accessible name where the markup garbles the text). */
async function headingOf(page) {
  const raw = await page.evaluate(() => {
    const el =
      document.querySelector('[data-review="title"]') ??
      document.querySelector("main h1") ??
      document.querySelector("h1");
    return el ? (el.getAttribute("aria-label") ?? el.textContent ?? "") : "";
  });
  if (!raw.trim()) throw new Error(`no heading on ${page.url()}`);
  return normaliseHeading(raw);
}

/** External anchors on the page, their rectangles from the page's top-left — the standard's 6. */
async function externalLinks(page, size) {
  const raw = await page.evaluate((origin) => {
    return Array.from(document.querySelectorAll("a[href]"))
      .filter((a) => {
        try {
          return new URL(a.href).origin !== origin;
        } catch {
          return false;
        }
      })
      .map((a) => {
        const r = a.getBoundingClientRect();
        return {
          url: a.href,
          rect: { x: r.left + window.scrollX, y: r.top + window.scrollY, w: r.width, h: r.height },
        };
      });
  }, new URL(BASE_URL).origin);
  const links = [];
  for (const { url, rect } of raw) {
    const x1 = Math.max(0, rect.x);
    const y1 = Math.max(0, rect.y);
    const x2 = Math.min(size.w, rect.x + rect.w);
    const y2 = Math.min(size.h, rect.y + rect.h);
    if (x2 - x1 > 0 && y2 - y1 > 0)
      links.push({ url, rect: { x: x1, y: y1, w: x2 - x1, h: y2 - y1 } });
  }
  return links;
}

/**
 * One slide: the viewport, or the whole document when the page is taller than it (a dialog
 * is always a viewport shot — it sits in the top layer). The manifest entry follows the
 * standard's naming; `crumbs` is the outline path the slide nests under.
 */
async function shoot(page, { name, path: crumbs, kind }) {
  const n = slides.length + 1;
  const dialogOpen = (await page.locator("dialog[open]").count()) > 0;
  const height = dialogOpen
    ? VIEWPORT.height
    : Math.max(VIEWPORT.height, await page.evaluate(() => document.documentElement.scrollHeight));
  const size = { w: VIEWPORT.width, h: height };
  if (!dialogOpen) await page.evaluate(() => window.scrollTo(0, 0));
  const tall = height > VIEWPORT.height;
  if (tall) await extendFixedBackdrops(page, height);
  const bytes = await page.screenshot({ type: "jpeg", quality: QUALITY, fullPage: tall });
  if (tall) await restoreFixedBackdrops(page);
  const links = dialogOpen ? [] : await externalLinks(page, size);
  slides.push({
    page: n,
    name,
    path: [...crumbs],
    image: `${slideFileName(n, name, crumbs)}.jpg`,
    size,
    links,
    kind,
  });
  images.push(bytes);
  if (PAGES === "map") thumbs.push(await thumbnail(page, bytes));
  console.log(`  ${logLine(n, name, crumbs, links.length)}`);
}

/**
 * A full-page shot paints a viewport-fixed layer once, over the first 800 px — the app's page
 * background (`fixed inset-0 -z-10 bg-page` in AppShell) would leave the rest white. For the
 * shot, every fixed layer that sits behind the content becomes document-tall; the chrome
 * that sits in front (the top rule, the rail) is left as it is.
 */
async function extendFixedBackdrops(page, height) {
  await page.evaluate((h) => {
    for (const el of document.body.querySelectorAll("*")) {
      const cs = getComputedStyle(el);
      if (cs.position !== "fixed" || !(Number(cs.zIndex) < 0)) continue;
      el.dataset.exportFixed = el.getAttribute("style") ?? "";
      el.style.position = "absolute";
      el.style.top = "0";
      el.style.bottom = "auto";
      el.style.height = `${h}px`;
    }
  }, height);
}

async function restoreFixedBackdrops(page) {
  await page.evaluate(() => {
    for (const el of document.querySelectorAll("[data-export-fixed]")) {
      el.setAttribute("style", el.dataset.exportFixed);
      delete el.dataset.exportFixed;
    }
  });
}

/** A THUMB_WIDTH-wide copy of a shot, drawn on a canvas in the page. */
async function thumbnail(page, bytes) {
  const dataUrl = await page.evaluate(
    async ({ src, width }) => {
      const img = new Image();
      img.src = src;
      await img.decode();
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = Math.round((img.naturalHeight * width) / img.naturalWidth);
      canvas.getContext("2d").drawImage(img, 0, 0, canvas.width, canvas.height);
      return canvas.toDataURL("image/jpeg", 0.8);
    },
    { src: `data:image/jpeg;base64,${bytes.toString("base64")}`, width: THUMB_WIDTH },
  );
  // A copy of its own: pdf-lib reads a buffer from the start of its underlying memory, and
  // Node decodes a small base64 string into a slice of a shared pool.
  const out = new Uint8Array(Buffer.from(dataUrl.slice(dataUrl.indexOf(",") + 1), "base64"));
  if (out[0] === 0xff && out[1] === 0xd8) return out;
  // Not a JPEG (the canvas gave "data:," or a PNG): say so, and take a 1× shot instead.
  warn(
    `slide ${slides.length + 1}: thumbnail came back as "${dataUrl.slice(0, 24)}" (${out.length} bytes) — using a 1× screenshot`,
  );
  const dialogOpen = (await page.locator("dialog[open]").count()) > 0;
  return page.screenshot({
    type: "jpeg",
    quality: 80,
    scale: "css",
    fullPage:
      !dialogOpen &&
      (await page.evaluate(() => document.documentElement.scrollHeight)) > VIEWPORT.height,
  });
}

/** Ledger key: a title (normalised: case, trailing plural "s") plus a hash of the body. */
function keyOf(title, body) {
  const t = title.toLowerCase().replace(/s\b/g, "");
  return createHash("sha1").update(`${t}\n${body}`).digest("hex").slice(0, 12);
}

/** True when the state is new — recorded as shot at the next slide; else listed as skipped. */
function firstSighting(title, body, host) {
  const key = keyOf(title, body);
  const seen = ledger.get(key);
  if (seen) {
    skipped.push({ what: title, host: host.join(" › "), at: seen.page });
    return false;
  }
  ledger.set(key, { title, page: slides.length + 1 });
  return true;
}

// ---------------------------------------------------------------------------
// Switchables — an accordion's drawers, a tab strip: every other position, beside the page

/** Labels of the switchables in `state` position on the page itself (not in a dialog, not in a skip region). */
async function switchLabels(page, selector) {
  return page.evaluate(
    (sel) =>
      Array.from(document.querySelectorAll(sel))
        .filter((el) => !el.closest("dialog") && !el.closest('[data-review="skip"]'))
        .map((el) => (el.getAttribute("aria-label") ?? el.textContent ?? "").trim())
        .filter(Boolean),
    selector,
  );
}

const switchButton = (page, selector, label) =>
  page.locator(selector).filter({ hasText: label }).first();

/**
 * Every other position of the page's switchables, each shot from the page as loaded and the
 * page put back before the next — a position is a state of the page, never of another
 * position. `host` is the page's outline path (its own name last).
 */
async function captureSwitchables(page, host) {
  const atLoad = await switchLabels(page, SWITCH_OPEN);
  const others = await switchLabels(page, SWITCH_CLOSED);
  for (const label of others) {
    await click(page, switchButton(page, SWITCH_CLOSED, label));
    // Every position is shot: a drawer is its page's own content, so a leaf whose Strategies
    // text repeats another's still shows it (unlike a sheet, kept once by the ledger).
    await shoot(page, { name: normaliseHeading(label), path: host, kind: "state" });
    // back to the position at load — an accordion closes the drawer we opened by itself
    for (const original of atLoad) {
      const button = switchButton(page, SWITCH_CLOSED, original);
      if (await button.count()) await click(page, button);
    }
  }
}

// ---------------------------------------------------------------------------
// Overlays — the sheets a page opens, and what stacks over them

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
    // The name is the first labelling element alone — a sheet's subtitle is in the body
    // hash, and " — " in a name would read as an option label to the map.
    let title = top.getAttribute("aria-label") ?? "";
    const labelledBy = top.getAttribute("aria-labelledby");
    if (labelledBy) {
      const first = labelledBy
        .split(/\s+/)
        .map((id) => document.getElementById(id))
        .find(Boolean);
      if (first) title = nameFrom(first);
    }
    const clone = top.cloneNode(true);
    clone.querySelectorAll("header").forEach((h) => h.remove());
    const text = (clone.textContent ?? "").replace(/\s+/g, " ").trim();
    const imgs = Array.from(clone.querySelectorAll("img"))
      .map((img) => img.getAttribute("src"))
      .join("|");
    return { title: title.trim(), body: `${text}\n${imgs}` };
  });
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

/** Indices (into `button[aria-haspopup="dialog"]`) of the triggers on the page itself. */
async function pageTriggerIndices(page) {
  return page.evaluate(() =>
    Array.from(document.querySelectorAll('button[aria-haspopup="dialog"]'))
      .map((b, i) => (b.closest("dialog") || b.closest('[data-review="skip"]') ? -1 : i))
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

/** Shoot the top dialog as a state under `host` if its content is new; returns its title when shot. */
async function captureTopDialogOnce(page, host) {
  const identity = await topDialogIdentity(page);
  if (!identity) return null;
  if (!firstSighting(identity.title, identity.body, host)) return null;
  const name = normaliseHeading(identity.title);
  await shoot(page, { name, path: host, kind: "state" });
  return name;
}

/** Every sheet the page opens (one level of nesting inside each), first occurrence only. */
async function captureOverlays(page, host) {
  const indices = await pageTriggerIndices(page);
  for (const i of indices) {
    await click(page, page.locator('button[aria-haspopup="dialog"]').nth(i));
    if ((await page.locator("dialog[open]").count()) === 0) {
      warn(`${host.join(" › ")}: trigger #${i} opened no dialog`);
      continue;
    }
    const shot = await captureTopDialogOnce(page, host);

    if (shot) {
      // One level of nesting: lightboxes over a card, and in-place steps.
      const inner = [...host, shot];
      for (const { kind, label } of await nestedTriggerLabels(page)) {
        const top = page.locator("dialog[open]").last();
        const trigger =
          kind === "dialog"
            ? top.locator(`button[aria-label="${label}"]`).first()
            : top.getByRole("button", { name: label, exact: true }).first();
        if ((await trigger.count()) === 0) continue;
        const depthBefore = await page.locator("dialog[open]").count();
        await click(page, trigger);
        await captureTopDialogOnce(page, inner);
        const depthAfter = await page.locator("dialog[open]").count();
        if (depthAfter > depthBefore) {
          await closeTopDialog(page);
        } else {
          // Content swapped in place — step back if the card offers it.
          const back = page
            .locator("dialog[open]")
            .last()
            .locator('button[aria-label^="Back to "]');
          if (await back.count()) await click(page, back.first());
        }
      }
    }
    await closeAllDialogs(page);
  }
}

// ---------------------------------------------------------------------------
// Page recipes

/** A plain page: the page, then its switchables' other positions, then its sheets. */
async function capturePage(page, route, { states = true, kind = "page", path: crumbs = [] } = {}) {
  await goto(page, route);
  const name = await headingOf(page);
  await shoot(page, { name, path: crumbs, kind });
  if (states) {
    await captureSwitchables(page, [...crumbs, name]);
    await captureOverlays(page, [...crumbs, name]);
  }
  return name;
}

/**
 * Pick a radio by its group name and value (a second click would deselect, so only when it
 * isn't the selection). Returns the outline segment the standard names the choice by:
 * "<option> — <prompt>", the pill's label and its fieldset's legend.
 */
async function pick(page, name, value) {
  const input = page.locator(`input[type="radio"][name="${name}"][value="${value}"]`);
  if (!(await input.isChecked())) {
    await click(page, page.locator(`label:has(input[name="${name}"][value="${value}"])`));
  }
  const { label, legend } = await page.evaluate(
    ({ name, value }) => {
      const input = document.querySelector(`input[type="radio"][name="${name}"][value="${value}"]`);
      const label = input?.closest("label")?.textContent ?? "";
      const legend = input?.closest("fieldset")?.querySelector("legend")?.textContent ?? "";
      return {
        label: label.replace(/\s+/g, " ").trim(),
        legend: legend.replace(/\s+/g, " ").trim(),
      };
    },
    { name, value },
  );
  if (!label || !legend) throw new Error(`radio ${name}=${value}: no label or legend`);
  return `${label} — ${legend}`;
}

async function advance(page, buttonName, nextRoute) {
  await page.getByRole("button", { name: buttonName, exact: true }).click();
  await page.waitForURL(`**${nextRoute}`);
  await assertPath(page, nextRoute);
  await settle(page);
  await neutralise(page);
  await settle(page);
}

const submit = (page, next) => advance(page, "Submit inputs", next);
const railNext = (page, next) => advance(page, "Next", next);

/** The whole wizard, depth-first, driven through the real UI. */
async function captureWizard(page) {
  await goto(page, "/wizard");
  const root = await headingOf(page);
  await shoot(page, { name: root, path: [], kind: "wizard" });

  for (const type of TYPES) {
    await goto(page, "/wizard");
    const typeSeg = await pick(page, "hemophilia-type", type);
    const typePath = [root, typeSeg];
    await shoot(page, { name: root, path: typePath, kind: "wizard" });

    for (const inhibitors of INHIBITORS) {
      await goto(page, "/wizard");
      await pick(page, "hemophilia-type", type);
      const inhibitorsSeg = await pick(page, "inhibitors", inhibitors);
      const scenarioPath = [...typePath, inhibitorsSeg];
      await shoot(page, { name: root, path: scenarioPath, kind: "wizard" });

      await submit(page, "/wizard/scenario");
      const scenario = await headingOf(page);
      await shoot(page, { name: scenario, path: scenarioPath, kind: "wizard" });
      await captureSwitchables(page, [...scenarioPath, scenario]);
      await captureOverlays(page, [...scenarioPath, scenario]);

      await railNext(page, "/wizard/reason");
      for (const reason of REASONS) {
        await goto(page, "/wizard/reason");
        const reasonSeg = await pick(page, "switch-reason", reason);
        const leafPath = [...scenarioPath, reasonSeg];
        await shoot(page, { name: await headingOf(page), path: leafPath, kind: "wizard" });

        await submit(page, "/wizard/therapies");
        const leaf = await headingOf(page);
        await shoot(page, { name: leaf, path: leafPath, kind: "wizard" });
        await captureSwitchables(page, [...leafPath, leaf]);
        await captureOverlays(page, [...leafPath, leaf]);
      }
    }
  }
}

/** The survey form, then the thank-you it turns into — a state of the page. */
async function captureSurvey(page) {
  const name = await capturePage(page, "/survey", { states: false });
  await page.evaluate((key) => sessionStorage.setItem(key, "true"), SURVEY_SUBMITTED_KEY);
  await goto(page, "/survey");
  await shoot(page, { name: "Thank you (submitted)", path: [name], kind: "state" });
  await page.evaluate((key) => sessionStorage.removeItem(key), SURVEY_SUBMITTED_KEY);
}

// ---------------------------------------------------------------------------
// The deck

async function writeDeck(startedAt) {
  const manifest = validateManifest({ ...META, slides });

  // the image folder holds this run's pages alone
  mkdirSync(OUT_DIR, { recursive: true });
  for (const file of readdirSync(OUT_DIR)) {
    if (/^\d{3}-.*\.jpg$/.test(file) || file === "deck.json" || file === "report.json") {
      rmSync(path.join(OUT_DIR, file));
    }
  }
  manifest.slides.forEach((slide, i) => writeFileSync(path.join(OUT_DIR, slide.image), images[i]));
  writeFileSync(path.join(OUT_DIR, "deck.json"), `${JSON.stringify(manifest, null, 2)}\n`);

  const { slides: _slides, ...meta } = manifest;
  // The map-only deck is drawn from the thumbnail copies: its pages share their image
  // objects with the slides they are cut from, so full-size slides would stay in the file.
  const sources = PAGES === "map" ? thumbs : images;
  const pdf = await ReviewPdf.create(meta);
  for (const slide of manifest.slides) {
    await pdf.add(slide, { kind: "jpeg", bytes: sources[slide.page - 1] });
  }
  let bytes = await pdf.finish({ map: PAGES !== "slides" });
  if (PAGES === "map") bytes = await mapPagesOnly(bytes, pdf.mapCount);
  writeFileSync(OUT_PDF, bytes);

  const report = {
    generatedAt: new Date().toISOString(),
    baseUrl: BASE_URL,
    viewport: VIEWPORT,
    scale: SCALE,
    jpegQuality: QUALITY,
    seconds: Math.round((performance.now() - startedAt) / 100) / 10,
    pdf: path.relative(ROOT, OUT_PDF),
    slides: slides.length,
    mapPages: pdf.mapCount,
    statesShownOnce: Array.from(ledger.values()),
    skippedRepeats: skipped,
    blockedRequests,
    warnings,
  };
  writeFileSync(path.join(OUT_DIR, "report.json"), `${JSON.stringify(report, null, 2)}\n`);
  const pages =
    PAGES === "map"
      ? pdf.mapCount
      : PAGES === "slides"
        ? slides.length
        : slides.length + pdf.mapCount;
  return { bytes: bytes.byteLength, mapPages: pdf.mapCount, pages };
}

/**
 * The first `count` pages of a finished deck — the overview and the branch pages — as a PDF
 * of their own. The core draws the map only in front of the slides its thumbnails link to,
 * so the map alone is cut from a deck built on the thumbnail copies: the link annotations go
 * (their targets are not in the file), the "p.N" captions stay and name the slide in the
 * full deck.
 */
async function mapPagesOnly(bytes, count) {
  const full = await PDFDocument.load(bytes);
  const out = await PDFDocument.create();
  out.setTitle(full.getTitle() ?? META.title);
  out.setSubject(full.getSubject() ?? "");
  out.setCreator(full.getCreator() ?? META.creator);
  out.setProducer("pdf-lib");
  const indices = Array.from({ length: count }, (_, i) => i);
  for (const i of indices) full.getPage(i).node.delete(PDFName.of("Annots"));
  for (const page of await out.copyPages(full, indices)) out.addPage(page);
  return out.save();
}

// ---------------------------------------------------------------------------
// Main

async function main() {
  const startedAt = performance.now();
  build();
  assertNoAnalyticsInBundle();

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
    for (const route of RAIL) await capturePage(page, route, { states: route !== "/how-to" });

    await context.close();
  } finally {
    await browser.close();
    server.kill();
  }

  const { bytes, mapPages, pages } = await writeDeck(startedAt);

  console.log("");
  console.log(
    `✔ ${pages} pages (${PAGES === "map" ? `the map alone, ${mapPages} pages` : PAGES === "slides" ? `${slides.length} slides, no map` : `${slides.length} slides + ${mapPages} map`}) → ${path.relative(ROOT, OUT_PDF)} (${(bytes / 1e6).toFixed(1)} MB)`,
  );
  console.log(`  page images + deck.json + report.json → ${path.relative(ROOT, OUT_DIR)}/`);
  console.log(`  states shown once: ${ledger.size}  ·  repeat openings skipped: ${skipped.length}`);
  if (blockedRequests.length) {
    warn(
      `${blockedRequests.length} external request(s) were attempted and blocked — see report.json`,
    );
  }
  if (warnings.length) console.log(`  warnings: ${warnings.length}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
