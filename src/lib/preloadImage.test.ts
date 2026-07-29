import { afterEach, expect, test, vi } from "vitest";

import { preloadImage } from "./preloadImage";

/**
 * jsdom fetches nothing and implements no `decode()`, so what is testable here
 * is the bookkeeping rather than the warming: that a URL builds one `Image`,
 * that a missing `decode()` does not throw, and that a rejected decode is
 * forgotten so a later call can retry. The warming itself is a browser fact.
 *
 * Every test uses a distinct URL — the dedupe set is module-level and lives for
 * the whole file, which is the behaviour under test.
 */

function stubImage(decode?: () => Promise<void>) {
  const constructed: string[] = [];
  class FakeImage {
    set src(value: string) {
      constructed.push(value);
    }
    decode = decode;
  }
  vi.stubGlobal("Image", FakeImage);
  return constructed;
}

afterEach(() => vi.unstubAllGlobals());

test("builds one Image per URL, however many times it is asked", () => {
  const constructed = stubImage(() => Promise.resolve());

  preloadImage("/one.webp");
  preloadImage("/one.webp");
  preloadImage("/two.webp");

  expect(constructed).toEqual(["/one.webp", "/two.webp"]);
});

test("survives an Image with no decode(), as in jsdom", () => {
  const constructed = stubImage(undefined);

  expect(() => preloadImage("/no-decode.webp")).not.toThrow();
  expect(constructed).toEqual(["/no-decode.webp"]);
});

test("forgets a URL whose decode rejected, so it can be retried", async () => {
  const constructed = stubImage(() => Promise.reject(new Error("EncodingError")));

  preloadImage("/broken.webp");
  await vi.waitFor(() => expect(constructed).toEqual(["/broken.webp"]));

  // The retry: a second call after the rejection settles builds a second Image,
  // where a successful decode would have been remembered and skipped.
  await vi.waitFor(() => {
    preloadImage("/broken.webp");
    expect(constructed).toEqual(["/broken.webp", "/broken.webp"]);
  });
});
