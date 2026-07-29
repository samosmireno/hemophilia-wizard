import { useEffect } from "react";

/**
 * URLs already handed to `preloadImage`. Warming is idempotent per URL for the
 * life of the page: the browser's own caches make a second call harmless, but
 * two `PopupFigure`s sharing an asset should not each build an `Image` for it.
 *
 * A failed decode is dropped again so a later attempt can retry.
 */
const warmed = new Set<string>();

/**
 * Warms the browser's **decoded** image cache for `src`.
 *
 * The bytes are usually already there. A closed `Popup` is a `<dialog>` the UA
 * hides with `display: none`, and that does not suppress an image request — so
 * every §7.7 figure is fetched during the chapter's first render, long before
 * anyone clicks. `<link rel="preload">` would therefore buy nothing here.
 *
 * What the pop-up actually pays on open is the *decode*. `decoding` defaults to
 * async, so the card paints on the frame the dialog opens and the picture lands
 * a frame or two later — visible as a flash of empty card, and worst on the
 * 1894px-wide cascade. Decoding ahead of time removes that gap.
 *
 * **A detached `new Image()` rather than `decode()` on the real element.**
 * Calling `decode()` on an image inside a `display: none` subtree rejects in
 * some Chrome versions; a detached decode is unconditionally safe and populates
 * the same URL-keyed cache. That sharing is an implementation detail of the
 * browser rather than a guarantee of the spec — but in the case where it does
 * not hold, this still leaves the *fetch* warm and priority-raised, which is
 * strictly better than doing nothing.
 *
 * `decode()` resolves off the main thread, so this does not compete with the
 * page's own paint and needs no idle scheduling.
 */
export function preloadImage(src: string) {
  if (warmed.has(src)) return;
  warmed.add(src);

  const image = new Image();
  image.src = src;
  // Optional-chained because jsdom implements no `decode()` — and short-circuits
  // the whole chain when it is absent, so `.catch` is never reached there.
  image.decode?.().catch(() => {
    warmed.delete(src);
  });
}

/**
 * `preloadImage` as an effect.
 *
 * **Only useful where the caller is mounted while the pop-up is shut**, which is
 * the whole subtlety of using this. `ExpandableFigure` renders its card's body
 * unconditionally, so a figure inside it can warm its own URL; `DisclosureBand`
 * mounts `content` only for the open disclosure (`{open?.content}`), so a figure
 * inside *that* first runs its effects on the frame it is already needed. There,
 * the warming has to happen a level up — see `DiseaseBackground`.
 */
export function usePreloadImage(src: string) {
  useEffect(() => preloadImage(src), [src]);
}

/**
 * `usePreloadImage` for a fixed set of URLs — the shape a chapter needs when it
 * warms the figures its disclosures will open.
 *
 * Keyed on the joined URLs rather than the array's identity, so a caller may
 * pass a literal without re-warming on every render.
 */
export function usePreloadImages(sources: readonly string[]) {
  const key = sources.join("\n");
  useEffect(() => {
    for (const src of key.split("\n")) preloadImage(src);
  }, [key]);
}
