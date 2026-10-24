import { FirmHeader } from "@/components/FirmHeader";
import { MediaFrame } from "@/components/MediaFrame";
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
      <FirmHeader firmName={brand.firmName} logoUrl={brand.logoUrl} lang={lang} nextPath={`/v/${current.slug}`} />
      <StageTracker lang={lang} stages={stages} viewingIndex={viewingIndex} />
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
            <h2>{es ? "Puntos clave" : "Key points"}</h2>
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
        {related.length > 0 ? (
          <section className="playlist">
            <h2>{es ? "Más videos en esta etapa" : "More videos in this stage"}</h2>
            <ul>
              {related.map((video) => (
                <li key={video.slug}>
                  <a href={`/v/${video.slug}`}>
                    <strong>{text(lang, video.titleEn, video.titleEs)}</strong>
                    <span>{text(lang, video.introEn, video.introEs)}</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </>
  );
}

export function StageTracker({
  lang,
  stages,
  viewingIndex,
}: {
  lang: Lang;
  stages: Stage[];
  viewingIndex: number;
}) {
  const es = lang === "es";
  return (
    <nav className="tracker" aria-label={es ? "Etapas del caso" : "Case stages"}>
      {stages.map((stage, index) => {
        const state = index === viewingIndex ? "active" : index < viewingIndex ? "done" : "upcoming";
        const label = es ? stage.labelEs : stage.labelEn;
        const className = `stage ${state}${stage.optional ? " optional" : ""}`;
        const inner = (
          <>
            <span className="num">{state === "done" ? "✓" : index + 1}</span>
            <span className="stage-label">{label}</span>
            {stage.optional ? <span className="stage-note">{es ? "Si hace falta" : "If needed"}</span> : null}
          </>
        );
        return (
          <a key={stage.id} className={className} href={`/s/${stage.id}`} aria-current={state === "active" ? "page" : undefined}>
            {inner}
          </a>
        );
      })}
    </nav>
  );
}
