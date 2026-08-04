/**
 * The size ramp worn by the ✕ that closes a modal — `Popup`'s card and
 * `Lightbox`'s enlargement, the app's two `ModalLayer` presentations.
 *
 * `PopupButton` ships one fixed scale, `size-16.25` (65px), and it is the drawn
 * one: §13's geometry table reads 65 off the export, and the glyph inside is
 * `size-[58%]` so it follows the box without a second class. 65px is a desktop
 * number, though. On a 375px phone the card is 345px wide, and a 65px button
 * plus its 22px inset takes 88px off *each* side of the crimson band — a quarter
 * of the card spent on the affordance that dismisses it.
 *
 * So the button steps down twice, at the breakpoints everything else in the card
 * steps at (`sm`, `lg` — the title's `text-2xl sm:text-3xl lg:text-5xl` and the
 * body's `px-4 sm:px-8 lg:px-16`):
 *
 *     base  size-11     44px
 *     sm:   size-14     56px
 *     lg:   size-16.25  65px, the drawn value
 *
 * **44px is the floor because it is the touch-target floor**, not because it
 * looked right — this is the primary dismiss on a phone, where the other two
 * routes (ESC, a backdrop click) are a keyboard and a strip of scrim beside a
 * card that is 92vw wide. It is also on Tailwind's scale, so the ramp keeps the
 * app's no-arbitrary-length invariant.
 *
 * `lg:size-16.25` restates the package's own value rather than letting it show
 * through: `className` is merged last inside `PopupButton`, so the base
 * `size-11` strips the package default at every width and the drawn size has to
 * be put back explicitly.
 *
 * **The inset the button sits at does NOT ramp.** 22px is the drawn value
 * (`right-5.5` on the card, `right-4 sm:right-6` on the scrim) and it is what
 * `Popup`'s band inset and band floor are each built from — see `BAND_INSET`
 * there, whose three steps are this ramp plus 22 at each one.
 *
 * A shared constant rather than a class on each caller because `Lightbox`'s
 * doc-comment claims the parity out loud — "so closing an enlargement looks like
 * closing anything else in this app" — and a claim two files have to remember
 * separately is one that stops being true.
 */
export const CLOSE_BUTTON_SIZE = "size-11 sm:size-14 lg:size-16.25";
