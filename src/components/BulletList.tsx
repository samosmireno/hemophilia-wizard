import type { ReactNode } from "react";

import type { Bullet } from "../data/education";
import { cn } from "../lib/cn";

/**
 * An education topic's `body` as the chapters draw it: a disc list at
 * `text-body`, with `NestedBullet`'s children as a second list inside their own
 * `<li>` rather than as siblings.
 *
 * The nesting is markup, not indentation — a child bullet is inside the item it
 * belongs to, so a screen reader announces the sub-list's depth and count
 * instead of reading five flat items. That is the whole reason `NestedBullet`
 * exists in the data module (see its comment there): the relationship is a
 * property of the content, and array position would lose it.
 *
 * Lives here rather than in a chapter because two chapters now draw the same
 * list — `disease-background`'s mechanism/diagnosis prose and
 * `treatment-landscape`'s three blocks. The second copy is what moved it.
 */
export default function BulletList({
  items,
  className,
  childClassName,
  format,
}: {
  items: readonly Bullet[];
  className?: string;
  /**
   * Classes for one nested child, chosen per child.
   *
   * A function rather than a string because the one caller that needs it —
   * `rebalancing-agents`, which draws its two anti-TFPI mABs in blue and its
   * AT-directed siRNA in crimson — needs the children to differ from each
   * other. Returning nothing leaves a child styled like every other, which is
   * what every other caller gets by omitting the prop.
   *
   * The child's *text* stays the caller's, not this component's: it is handed
   * back the string it authored, so the decision is made on content it already
   * knows rather than on a position in an array.
   */
  childClassName?: (child: string) => string | undefined;
  /**
   * How a bullet's text becomes nodes. Omitted, it stays the string.
   *
   * The seam exists for `formatInline` (ADR 0004): `/wizard/scenario` renders its
   * class labels through it so the data module can emphasise a word in one
   * without a page edit. Passed a function rather than a boolean so this
   * component keeps knowing nothing about markup — the same shape, and the same
   * reason, as `childClassName` above.
   *
   * Applied to nested text and children too: a list is one kind of content, and
   * a rule that reached the top level only would be a trap at the depth where
   * nobody is looking.
   */
  format?: (text: string) => ReactNode;
}) {
  const render = format ?? ((text: string) => text);

  return (
    <ul className={cn("list-disc pl-6 text-body text-black", className)}>
      {items.map((item) =>
        typeof item === "string" ? (
          <li key={item}>{render(item)}</li>
        ) : (
          <li key={item.text}>
            {render(item.text)}
            <ul className="list-disc ps-7">
              {item.children.map((child) => (
                <li key={child} className={childClassName?.(child)}>
                  {render(child)}
                </li>
              ))}
            </ul>
          </li>
        ),
      )}
    </ul>
  );
}
