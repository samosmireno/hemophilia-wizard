import cascadeUrl from "../../assets/images/clotting_cascade_diagram.webp";
import { CLOTTING_CASCADE_CONCLUSION, CLOTTING_CASCADE_NOTES } from "../../data/education";
import { usePreloadImage } from "../../lib/preloadImage";

/**
 * The §7.7 "Disease mechanism for HA/HB" figure, rebuilt as markup around the
 * diagram instead of being one flat raster.
 *
 * The designer's export composes three things: two annotation notes, the cascade
 * itself, and a conclusion under both. Only the middle one is genuinely a
 * picture — the arrows, the factor labels and the Initiation/Amplification
 * markers have no text equivalent (CONTEXT.md §7.7 records the whole figure as
 * image-borne). The other two are sentences, so they are sentences here: they
 * reflow instead of scaling with the image, they are selectable and
 * translatable, and they do not have to be duplicated into the diagram's `alt`.
 *
 * That is also why the `alt` below is shorter than it looks like it should be —
 * it describes the cascade and nothing else, because everything else on this
 * card is now text a screen reader reads directly.
 *
 * **Two columns at `md`, stacked below it**, mirroring the export's arrangement
 * (notes left, diagram right, conclusion spanning under both). The notes take a
 * third: they are two short paragraphs against a wide diagram, and giving them
 * half would set them at a measure the design does not draw.
 */
export default function ClottingCascadeFigure() {
  // The widest §7.7 asset, so the one whose decode is most visible as a flash of
  // empty card on open. Warmed on mount — see `preloadImage`.
  usePreloadImage(cascadeUrl);

  return (
    <figure className="mx-auto flex max-w-250 flex-col gap-6 py-4">
      <div className="grid items-center gap-6 md:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-4">
          {CLOTTING_CASCADE_NOTES.map((note) => (
            <p
              key={note}
              className="rounded-2xl bg-figure-note px-5 py-4 text-center text-body text-black"
            >
              {note}
            </p>
          ))}
        </div>

        <img
          src={cascadeUrl}
          alt="Vascular injury exposes tissue factor, which with FVIIa initiates coagulation. FVIIa and tissue factor drive FVa, FXa, calcium and phospholipid to generate thrombin, which forms a fibrin clot. Thrombin feeds back to amplify the cascade through FXa and the FVIIIa–FIXa complex."
          style={{ aspectRatio: "1220 / 650" }}
          className="w-full"
        />
      </div>

      {/* Uppercase is CSS, not copy — the data module stores it sentence-case,
          the way every other shouted string in this app is stored. */}
      <figcaption className="text-center font-display text-h3 tracking-wide text-brand-crimson-50 uppercase">
        {CLOTTING_CASCADE_CONCLUSION}
      </figcaption>
    </figure>
  );
}
