/**
 * Colour analysis for the mlg-components re-skin. No dependencies.
 *
 *   node .scratch/mlg-reskin/color-delta.mjs                       # worked example
 *   node .scratch/mlg-reskin/color-delta.mjs '#d63a52' '#f4a0ab'   # compare two
 *
 * Why this exists: Figma exports state changes that look like "slightly
 * lighter" but are usually hue rotations at constant lightness. Mapping those
 * onto a brand scale's -25 step (a pastel tint) silently destroys them. Measure
 * before mapping. See spec.md → "Method", step 3.
 */

const s2l = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);
const l2s = (c) => (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
const hex2rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255);

/** sRGB hex → OKLab [L, a, b] */
export function oklab(hex) {
  const [r, g, b] = hex2rgb(hex).map(s2l);
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b);
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b);
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b);
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ];
}

/** sRGB hex → OKLCH [L, C, H°] */
export function oklch(hex) {
  const [l, a, b] = oklab(hex);
  return [l, Math.hypot(a, b), ((Math.atan2(b, a) * 180) / Math.PI + 360) % 360];
}

/** OKLab [L, a, b] → sRGB hex (clamped to gamut) */
export function lab2hex([l, a, bb]) {
  const L = (l + 0.3963377774 * a + 0.2158037573 * bb) ** 3;
  const M = (l - 0.1055613458 * a - 0.0638541728 * bb) ** 3;
  const S = (l - 0.0894841775 * a - 1.291485548 * bb) ** 3;
  const rgb = [
    4.0767416621 * L - 3.3077115913 * M + 0.2309699292 * S,
    -1.2684380046 * L + 2.6097574011 * M - 0.3413193965 * S,
    -0.0041960863 * L - 0.7034186147 * M + 1.707614701 * S,
  ];
  const hex = rgb
    .map((v) =>
      Math.round(Math.min(1, Math.max(0, l2s(v))) * 255)
        .toString(16)
        .padStart(2, "0"),
    )
    .join("");
  return `#${hex}`;
}

/** WCAG relative luminance */
export const lum = (hex) => {
  const [r, g, b] = hex2rgb(hex).map(s2l);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};

/** WCAG contrast ratio. Thresholds: 3:1 icon strokes / large text, 4.5:1 body. */
export const contrast = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/** Interpolate two hexes in OKLab — matches CSS `color-mix(in oklab, a p%, b)`. */
export const mix = (a, b, p) => lab2hex(oklab(a).map((v, i) => v * p + oklab(b)[i] * (1 - p)));

export function describe(label, hex) {
  const [l, c, h] = oklch(hex);
  console.log(
    `${label.padEnd(24)} ${hex}  L=${l.toFixed(3)} C=${c.toFixed(3)} ` +
      `H=${h.toFixed(1).padStart(5)}  lum=${lum(hex).toFixed(3)}`,
  );
}

/** Default → state delta, the number that matters most. */
export function delta(label, from, to) {
  const [l0, c0, h0] = oklch(from);
  const [l1, c1, h1] = oklch(to);
  let dh = h1 - h0;
  if (dh > 180) dh -= 360;
  if (dh < -180) dh += 360;
  console.log(
    `${label.padEnd(24)} ${from} -> ${to}   ` +
      `dL=${(l1 - l0 >= 0 ? "+" : "") + (l1 - l0).toFixed(3)} ` +
      `dC=${(c1 - c0 >= 0 ? "+" : "") + (c1 - c0).toFixed(3)} ` +
      `dH=${(dh >= 0 ? "+" : "") + dh.toFixed(1)}deg  ` +
      `lum x${(lum(to) / lum(from)).toFixed(2)}`,
  );
}

const args = process.argv.slice(2);

if (args.length >= 2) {
  const [a, b] = args;
  describe("a", a);
  describe("b", b);
  delta("delta", a, b);
  console.log(`\ncontrast a/b: ${contrast(a, b).toFixed(2)}:1`);
} else if (args.length === 1) {
  describe("colour", args[0]);
} else {
  // Worked example: the NavArrowButton hover mis-mapping (issue 00).
  console.log("Figma's intent vs. the first (wrong) mapping:\n");
  delta("Figma default->hover", "#ef4444", "#f43f5e");
  delta("crimson-50 -> -25", "#d63a52", "#f4a0ab");
  console.log("\n^ 1.03x vs 2.64x luminance. The -25 step is a pastel tint,");
  console.log("  not a lighter sibling. The design rotates hue, it does not lighten.\n");

  const fixed = mix("#d63a52", "#f4a0ab", 0.96);
  delta("corrected (96% mix)", "#d63a52", fixed);
  console.log(
    `\nchevron #eef8f6 on crimson-25 : ${contrast("#f4a0ab", "#eef8f6").toFixed(2)}:1  (fails 3:1)`,
  );
  console.log(
    `chevron #eef8f6 on corrected  : ${contrast(fixed, "#eef8f6").toFixed(2)}:1  (passes)`,
  );
}
