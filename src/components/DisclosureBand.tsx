import { useState } from "react";
import { PopupButton } from "mlg-components";

import ArchBand from "./ArchBand";
import { type Disclosure, disclosureCard } from "./disclosures";
import Popup from "./Popup";

/** Three, enforced by the type — the prop is a 3-tuple, not an array. */
export default function DisclosureBand({
  title,
  disclosures,
}: {
  title: string;
  disclosures: readonly [Disclosure, Disclosure, Disclosure];
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const open = openIndex === null ? undefined : disclosures[openIndex];

  return (
    <ArchBand title={title}>
      <ul className="mt-10 grid justify-items-center gap-10 md:grid-cols-3">
        {disclosures.map((disclosure, index) => (
          <li key={disclosure.label} className="flex flex-col items-center">
            <PopupButton
              label={disclosure.label}
              open={openIndex === index}
              // Not `aria-controls`: a modal dialog lives in the top layer, so
              // it is not a region of the page this button expands.
              aria-haspopup={disclosure.content ? "dialog" : undefined}
              onClick={(next) => setOpenIndex(next ? index : null)}
            />
            <p className="mt-4 flex max-w-68 flex-1 items-center text-center text-xl font-bold text-popup-caption lg:text-2xl">
              {disclosure.label}
            </p>
          </li>
        ))}
      </ul>

      <Popup card={disclosureCard(open)} onClose={() => setOpenIndex(null)} />
    </ArchBand>
  );
}
