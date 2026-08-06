import cascadeUrl from "../../assets/images/clotting_cascade_diagram.webp";
import { CLOTTING_CASCADE_CONCLUSION, CLOTTING_CASCADE_NOTES } from "../../data/education";
import { usePreloadImage } from "../../lib/preloadImage";

export default function ClottingCascadeFigure() {
  // The widest §7.7 asset — warmed on mount, see `preloadImage`.
  usePreloadImage(cascadeUrl);

  return (
    <figure className="mx-auto flex max-w-250 flex-col gap-6 py-4">
      <div className="grid items-center gap-6 md:grid-cols-[1fr_2fr]">
        <div className="flex flex-col gap-4">
          {CLOTTING_CASCADE_NOTES.map((note) => (
            <p
              key={note}
              className="rounded-2xl bg-figure-note px-5 py-4 text-center text-base text-black"
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
      <figcaption className="text-center font-display text-2xl font-semibold tracking-wide text-brand-crimson-50 uppercase">
        {CLOTTING_CASCADE_CONCLUSION}
      </figcaption>
    </figure>
  );
}
