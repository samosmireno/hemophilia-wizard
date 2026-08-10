import type { ReactNode } from "react";

import type { PopupCard, PopupWidth } from "./Popup";

/**
 * One "Click here:" disclosure — the caption under the button, and the card it
 * opens. The card half mirrors `PopupCard` with `content` optional: a
 * disclosure without one is a placeholder trigger that toggles and opens
 * nothing (the §7.7 assets that do not exist yet).
 *
 * Its own module rather than a component's: `DisclosureBand` lays disclosures
 * out one way, but pages with drawn layouts of their own (`TreatmentLandscape`)
 * hold the same records and make the same join.
 */
export interface Disclosure {
  /** Caption beside the `+`, the button's accessible name, and the card's default title. */
  label: string;
  /** The card band's heading, where it differs from the caption. */
  title?: string;
  subtitle?: string;
  width?: PopupWidth;
  content?: ReactNode;
}

/**
 * The one join from a disclosure to the card `Popup` paints: the band heading
 * falls back to the caption, and the card fields travel as one record — which
 * is what keeps `width` and `subtitle` inside `Popup`'s exit-fade hold (see
 * `PopupCard` for the snap that taught it). A disclosure with no `content`
 * maps to `null`, which is `Popup`'s "closed" — "opens nothing" and "there is
 * no card" are the same statement.
 */
export function disclosureCard(disclosure: Disclosure | undefined): PopupCard | null {
  if (!disclosure?.content) return null;
  return {
    title: disclosure.title ?? disclosure.label,
    subtitle: disclosure.subtitle,
    width: disclosure.width,
    content: disclosure.content,
  };
}
