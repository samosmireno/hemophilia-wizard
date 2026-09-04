import type { ReactNode } from "react";

import type { Bullet } from "../data/education";
import { bindUnits } from "../lib/bindUnits";
import { cn } from "../lib/cn";

export default function BulletList({
  items,
  className,
  childClassName,
  format,
}: {
  items: readonly Bullet[];
  className?: string;
  childClassName?: (child: string) => string | undefined;
  format?: (text: string) => ReactNode;
}) {
  /*
    `bindUnits` is the default rather than a wrapper around `format`: a
    bibliography passes `formatCitation`, whose URL arm matches `\S+` — and an
    NBSP is not whitespace, so one glued beside a link would be swallowed into
    the `href`. A call site that formats its own text opts out by saying so.
  */
  const render = format ?? bindUnits;

  return (
    <ul className={cn("list-disc pl-6 text-base text-black", className)}>
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
