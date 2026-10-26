import { ContactCard } from "@/components/ContactCard";
import { FirmHeader } from "@/components/FirmHeader";
import { MediaFrame } from "@/components/MediaFrame";
import { StageTracker } from "@/components/StageTracker";
import { VideoCards } from "@/components/VideoCards";
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
  const title = text(lang, current.titleEn, current.titleEs);
  const intro = text(lang, current.introEn, current.introEs);
  const nextSteps = text(lang, current.nextStepsEn, current.nextStepsEs);
  const takeaways = lines(lang, current.takeawaysEn, current.takeawaysEs);
  const youtube = es ? current.youtubeUrlEs || current.youtubeUrlEn : current.youtubeUrlEn || current.youtubeUrlEs;
  const image = es ? current.imageUrlEs || current.imageUrlEn : current.imageUrlEn || current.imageUrlEs;
  const viewingIndex = stages.findIndex((stage) => stage.id === current.stageId);
  const stage = stages[viewingIndex];
  const related = videos
    .filter((video) => video.stageId === current.stageId && video.slug !== current.slug)
    .sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <div className="pin">
        <FirmHeader firmName={brand.firmName} logoUrl={brand.logoUrl} lang={lang} nextPath={`/v/${current.slug}`} />
        <StageTracker lang={lang} stages={stages} viewingIndex={viewingIndex} />
      </div>
      <main className="sheet">
        <p className="eyebrow">{stage ? text(lang, stage.labelEn, stage.labelEs) : es ? "Video" : "Video"}</p>
        <h1>{title}</h1>
        {intro ? <p>{intro}</p> : null}
        <MediaFrame
          title={title}
          youtube={youtube}
          image={image}
          empty={es ? "Agregue un video o una foto en el editor." : "Add a video or a photo in the editor."}
        />
        {takeaways.length > 0 ? (
          <section>
            <h2>{es ? "En este video" : "In this video"}</h2>
            <ul className="takeaways">
              {takeaways.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </section>
        ) : null}
        {nextSteps ? (
          <section className="next">
            <h2>{es ? "¿Qué sigue?" : "What happens next?"}</h2>
            <p>{nextSteps}</p>
          </section>
        ) : null}
        <VideoCards
          lang={lang}
          videos={related}
          heading={
            stage
              ? es
                ? `Más videos en ${text(lang, stage.labelEn, stage.labelEs)}`
                : `More in ${text(lang, stage.labelEn, stage.labelEs)}`
              : es
                ? "Más videos"
                : "More videos"
          }
        />
        <ContactCard lang={lang} />
      </main>
    </>
  );
}
