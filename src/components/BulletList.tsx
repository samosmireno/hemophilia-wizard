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
}: {
  items: readonly Bullet[];
  className?: string;
}) {
  return (
    <ul className={cn("list-disc pl-6 text-body text-black", className)}>
      {items.map((item) =>
        typeof item === "string" ? (
          <li key={item}>{item}</li>
        ) : (
          <li key={item.text}>
            {item.text}
            <ul className="list-disc ps-7">
              {item.children.map((child) => (
                <li key={child}>{child}</li>
              ))}
            </ul>
          </li>
        ),
      )}
    </ul>
  );
}
