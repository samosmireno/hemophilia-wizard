import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ArchBand from "./ArchBand";

/**
 * One test, and it is a regression guard rather than coverage.
 *
 * **The arch's rule and its two radii are rem, not px** (docs/styling.md §19):
 * a drawn edge is shape, so it has to scale with the object it edges when the
 * root steps up above the 1440 canvas. `border-t-4` computes the same 4px at a
 * 16px root and pins the rule at 4px everywhere above it, which is the failure
 * this asserts against.
 *
 * It exists because that swap has already happened once, on the same day the
 * conversion landed and to two of its four call sites: the Tailwind language
 * server offers `suggestCanonicalClasses` on every one of them, and accepting
 * it reverts the change silently while the comment forbidding it sits directly
 * above. The site that had a test went red; the site that had none did not. So
 * this is what a comment cannot do.
 *
 * jsdom computes no layout, so the class string is the only thing here that can
 * fail — no pixel is being checked, and none could be.
 */
describe("ArchBand", () => {
  it("draws its rule and curve in rem, so both scale with the board", () => {
    const { container } = render(<ArchBand title="Severity and bleeding">{null}</ArchBand>);
    const band = container.firstElementChild;

    expect(band).toHaveClass(
      "border-t-[0.25rem]",
      "rounded-t-[9.375rem]",
      "xl:rounded-t-[18.75rem]",
    );
  });
});
