/**
 * The campaign params GA4 reads for source/medium attribution — the only query
 * params allowed to survive page load. Everything else is dropped from the
 * address bar before the router or gtag can read it: email tools append a
 * per-recipient token (`mc_eid`, `_hsenc`, …) to every link, and a token in the
 * URL is a token in `page_location` on every hit, in browser history and in
 * outbound referrers. An allowlist rather than a blocklist, so which tool sends
 * the campaign never matters (docs/adr/0010, amendment; docs/analytics.md).
 */
const CAMPAIGN_PARAMS: ReadonlySet<string> = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "utm_id",
]);

/** `location.search` with only campaign params kept, in their original order.
 *  Empty string when nothing survives — never a bare `?`. */
export function sanitizeSearch(search: string): string {
  const kept = new URLSearchParams();
  for (const [key, value] of new URLSearchParams(search)) {
    if (CAMPAIGN_PARAMS.has(key)) kept.append(key, value);
  }
  const out = kept.toString();
  return out ? `?${out}` : "";
}

/**
 * Rewrite the current URL in place, keeping path, hash and history state. Call
 * before anything captures `window.location` — `main.tsx` runs it before the
 * router is built and before GA initializes. A no-op when nothing needs
 * stripping, so a clean load never touches history.
 */
export function sanitizeLocation(): void {
  const { location, history } = window;
  const search = sanitizeSearch(location.search);
  if (search === location.search) return;
  try {
    history.replaceState(history.state, "", location.pathname + search + location.hash);
  } catch {
    /* Sandboxed or opaque origin: leave the URL alone rather than crash the app. */
  }
}
