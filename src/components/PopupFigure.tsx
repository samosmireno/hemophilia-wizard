export default function PopupFigure({
  src,
  alt,
  width,
  height,
  reserve = "10rem",
}: {
  src: string;
  alt: string;
  width: number;
  height: number;
  /**
   * `reserve`'s defaults are read off `Popup` — a coupling; move with `Popup`'s
   * card paddings.
   */
  reserve?: string;
}) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        aspectRatio: `${width} / ${height}`,
        /* `rem`, not `px`, so the cap rides the board above the canvas. */
        width: `min(${width / 16}rem, 100%)`,
        maxHeight: `calc(95dvh - ${reserve})`,
      }}
      // `object-contain` is load-bearing.
      className="mx-auto object-contain"
    />
  );
}
