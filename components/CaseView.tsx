import { GuideLayout } from "@/components/GuideLayout";
import type { Brand, Lang, Stage, Video } from "@/lib/types";
import { lines, text } from "@/lib/lang";

export function CaseView({
  lang,
  brand,
  stages,
  videos,
  current,
}: {
  lang: Lang;
  brand: Brand;
  stages: Stage[];
  videos: Video[];
  current: Video;
}) {
  const es = lang === "es";
  const viewingIndex = stages.findIndex((stage) => stage.id === current.stageId);
  const related = videos
    .filter((video) => video.stageId === current.stageId && video.slug !== current.slug)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug));

  return (
    <GuideLayout
      lang={lang}
      brand={brand}
      stages={stages}
      viewingIndex={viewingIndex}
      nextPath={`/v/${current.slug}`}
      title={text(lang, current.titleEn, current.titleEs)}
      summary={text(lang, current.introEn, current.introEs)}
      usually=""
      steps={lines(lang, current.takeawaysEn, current.takeawaysEs)}
      continues={text(lang, current.nextStepsEn, current.nextStepsEs)}
      timing=""
      question=""
      answer=""
      youtube={es ? current.youtubeUrlEs || current.youtubeUrlEn : current.youtubeUrlEn || current.youtubeUrlEs}
      image={es ? current.imageUrlEs || current.imageUrlEn : current.imageUrlEn || current.imageUrlEs}
      related={related}
    />
  );
}
