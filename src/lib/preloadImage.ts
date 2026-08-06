import { useEffect } from "react";

const warmed = new Set<string>();

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

export function usePreloadImage(src: string) {
  useEffect(() => preloadImage(src), [src]);
}

export function usePreloadImages(sources: readonly string[]) {
  const key = sources.join("\n");
  useEffect(() => {
    for (const src of key.split("\n")) preloadImage(src);
  }, [key]);
}
