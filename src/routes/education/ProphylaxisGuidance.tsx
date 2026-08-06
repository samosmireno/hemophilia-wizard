import backdropUrl from "../../assets/images/bg_image.webp";
import BulletList from "../../components/BulletList";
import { topicById } from "../../data/education";

const CLOTTING = topicById("clotting-factor-replacement")!;

const [, HEADING_BULLET, ...BODY] = CLOTTING.body;

const HEADING = typeof HEADING_BULLET === "string" ? HEADING_BULLET : HEADING_BULLET.text;

export default function ProphylaxisGuidance() {
  return (
    <>
      <ChapterBackdrop />

      <section aria-labelledby="chapter-heading" className="flex flex-1 flex-col justify-center">
        {/* Uppercase is CSS, not copy — the accessible name stays sentence case. */}
        <h1
          id="chapter-heading"
          className="font-display text-3xl font-bold tracking-wide text-brand-crimson-50 uppercase lg:text-5xl"
        >
          {HEADING}
        </h1>

        <BulletList items={BODY} className="mt-8 text-xl leading-tight lg:text-2xl" />
      </section>
    </>
  );
}

function ChapterBackdrop() {
  return (
    <div aria-hidden="true" data-page-backdrop="prophylaxis" className="fixed inset-0 -z-10">
      <img
        src={backdropUrl}
        alt=""
        width={1920}
        height={1921}
        className="size-full object-cover opacity-15"
      />
    </div>
  );
}
