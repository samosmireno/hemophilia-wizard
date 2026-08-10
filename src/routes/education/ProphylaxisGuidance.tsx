import backdropUrl from "../../assets/images/bg_image.webp";
import BulletList from "../../components/BulletList";
import PageSection from "../../components/PageSection";
import { EDUCATION_TOPICS } from "../../data/education";

const CHAPTER = EDUCATION_TOPICS["prophylaxis-guidance"];

export default function ProphylaxisGuidance() {
  return (
    <>
      <ChapterBackdrop />

      <PageSection title={CHAPTER.title} className="flex flex-1 flex-col justify-center">
        <BulletList items={CHAPTER.body} className="mt-8 text-xl leading-tight lg:text-2xl" />
      </PageSection>
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
