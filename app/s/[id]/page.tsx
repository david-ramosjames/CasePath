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
import type { Lang, Stage, Video } from "@/lib/types";

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
  const inStage = videos
    .filter((video) => video.stageId === stage.id)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug));
  const featured = inStage[0];
  const featuredMedia = pickMedia(lang, featured);
  const stageMedia = pickMedia(lang, stage);
  const title = text(lang, stage.headerEn, stage.headerEs) || (featured ? text(lang, featured.titleEn, featured.titleEs) : text(lang, stage.labelEn, stage.labelEs));
  const intro = text(lang, stage.introEn, stage.introEs) || (featured ? text(lang, featured.introEn, featured.introEs) : "");
  const youtube = featuredMedia.youtube || stageMedia.youtube;
  const image = featuredMedia.youtube ? featuredMedia.image : featuredMedia.image || stageMedia.image;
  const takeaways = lines(lang, stage.takeawaysEn, stage.takeawaysEs);
  const videoTakeaways = featured ? lines(lang, featured.takeawaysEn, featured.takeawaysEs) : [];
  const points = takeaways.length > 0 ? takeaways : videoTakeaways;
  const nextSteps = text(lang, stage.nextStepsEn, stage.nextStepsEs) || (featured ? text(lang, featured.nextStepsEn, featured.nextStepsEs) : "");
  const more = inStage.filter((video) => video.slug !== featured?.slug);

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
            {points.length > 0 ? (
              <section>
                <h2>{es ? "En esta etapa" : "In this stage"}</h2>
                <ul className="takeaways">
                  {points.map((item) => (
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
            videos={more}
            heading={es ? `Más videos en ${text(lang, stage.labelEn, stage.labelEs)}` : `More in ${text(lang, stage.labelEn, stage.labelEs)}`}
          />
          <ContactCard lang={lang} phone={brand.phone} />
        </aside>
      </main>
      <SiteFooter brand={brand} />
    </div>
  );
}

function pickMedia(lang: Lang, item: Stage | Video | undefined) {
  if (!item) return { youtube: null as string | null, image: null as string | null };
  const es = lang === "es";
  return {
    youtube: es ? item.youtubeUrlEs || item.youtubeUrlEn : item.youtubeUrlEn || item.youtubeUrlEs,
    image: es ? item.imageUrlEs || item.imageUrlEn : item.imageUrlEn || item.imageUrlEs,
  };
}
