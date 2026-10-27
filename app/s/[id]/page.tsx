import { notFound } from "next/navigation";
import { ContactCard } from "@/components/ContactCard";
import { NextSteps } from "@/components/NextSteps";
import { FirmHeader } from "@/components/FirmHeader";
import { MediaFrame } from "@/components/MediaFrame";
import { SiteFooter } from "@/components/SiteFooter";
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
    <div className="client-page">
      <div className="pin">
        <FirmHeader firmName={brand.firmName} logoUrl={brand.logoUrl} lang={lang} nextPath={`/s/${stage.id}`} />
        <StageTracker lang={lang} stages={stages} viewingIndex={viewingIndex} />
      </div>
      <main className="sheet case-layout">
        <div className="case-main">
          <p className="eyebrow">{text(lang, stage.labelEn, stage.labelEs)}</p>
          <h1>{title}</h1>
          {intro ? <p className="lede">{intro}</p> : null}
          <MediaFrame
            title={title}
            youtube={youtube}
            image={image}
            empty={es ? "Esta etapa todavía no tiene video ni foto." : "This stage does not have a video or photo yet."}
          />
          <div className="case-lower">
            {takeaways.length > 0 ? (
              <section>
                <h2>{es ? "En esta etapa" : "In this stage"}</h2>
                <ul className="takeaways">
                  {takeaways.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </section>
            ) : null}
            {nextSteps ? <NextSteps title={es ? "¿Qué sigue?" : "What happens next?"} body={nextSteps} /> : null}
          </div>
        </div>
        <aside className="case-side">
          <VideoCards
            lang={lang}
            videos={inStage}
            heading={es ? `Videos en ${text(lang, stage.labelEn, stage.labelEs)}` : `Videos in ${text(lang, stage.labelEn, stage.labelEs)}`}
          />
          <ContactCard lang={lang} phone={brand.phone} />
        </aside>
      </main>
      <SiteFooter brand={brand} />
    </div>
  );
}
