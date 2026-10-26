import { notFound } from "next/navigation";
import { ContactCard } from "@/components/ContactCard";
import { FirmHeader } from "@/components/FirmHeader";
import { MediaFrame } from "@/components/MediaFrame";
import { StageTracker } from "@/components/StageTracker";
import { VideoCards } from "@/components/VideoCards";
import { getBrand, getStage, listStages, listVideos } from "@/lib/content";
import { getLang, lines, text } from "@/lib/lang";

export const dynamic = "force-dynamic";

export default async function StagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [lang, stages, stage, videos, brand] = await Promise.all([
    getLang(),
    listStages(),
    getStage(id),
    listVideos(),
    getBrand(),
  ]);
  if (!stage) notFound();
  const es = lang === "es";
  const viewingIndex = stages.findIndex((item) => item.id === stage.id);
  const title = text(lang, stage.headerEn, stage.headerEs) || text(lang, stage.labelEn, stage.labelEs);
  const intro = text(lang, stage.introEn, stage.introEs);
  const youtube = es ? stage.youtubeUrlEs || stage.youtubeUrlEn : stage.youtubeUrlEn || stage.youtubeUrlEs;
  const image = es ? stage.imageUrlEs || stage.imageUrlEn : stage.imageUrlEn || stage.imageUrlEs;
  const takeaways = lines(lang, stage.takeawaysEn, stage.takeawaysEs);
  const nextSteps = text(lang, stage.nextStepsEn, stage.nextStepsEs);
  const inStage = videos.filter((video) => video.stageId === stage.id).sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <>
      <div className="pin">
        <FirmHeader firmName={brand.firmName} logoUrl={brand.logoUrl} lang={lang} nextPath={`/s/${stage.id}`} />
        <StageTracker lang={lang} stages={stages} viewingIndex={viewingIndex} />
      </div>
      <main className="sheet">
        <p className="eyebrow">{es ? "Etapa actual" : "Current stage"}</p>
        <h1>{title}</h1>
        {intro ? <p>{intro}</p> : null}
        <MediaFrame
          title={title}
          youtube={youtube}
          image={image}
          empty={es ? "Esta etapa todavía no tiene video ni foto." : "This stage does not have a video or photo yet."}
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
        <VideoCards
          lang={lang}
          videos={inStage}
          heading={es ? `Videos en ${text(lang, stage.labelEn, stage.labelEs)}` : `Videos in ${text(lang, stage.labelEn, stage.labelEs)}`}
        />
        <ContactCard lang={lang} />
      </main>
    </>
  );
}
