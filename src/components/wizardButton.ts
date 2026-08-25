/**
 * The one skin every form button in the app wears — both wizard submits,
 * `/wizard`'s Reset and the survey's three (docs/styling.md §14, §27, §29): the
 * lagoon ground on the wizard submit's size ramp. The package `Button` is a
 * fixed 26px/`px-16` at every width, and the ramp is what makes a form button
 * step with the page; `px-7.5` is a compensation, not a conversion — it holds
 * the drawn 223px width (styling item 51). One string, so they cannot drift.
 */
export const WIZARD_BUTTON_SKIN =
  "bg-brand-lagoon-50 px-6 leading-5 hover:bg-brand-lagoon-25 active:bg-brand-lagoon-75 max-lg:text-lg lg:px-7.5 lg:py-4.5 lg:text-2xl";
