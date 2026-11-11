import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GuideLayout } from "@/components/GuideLayout";
import { getBrand, getStage, listStages, listVideos } from "@/lib/content";
import { getLang, lines, text } from "@/lib/lang";
import { siteOrigin } from "@/lib/origin";
import { previewMeta, stagePreviewTitle } from "@/lib/preview";
import type { Lang, Stage, Video } from "@/lib/types";
import { latestRating, readVisitToken, recordPageView } from "@/lib/visit";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ rid?: string; t?: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const sp = await searchParams;
  const token = await readVisitToken(sp.rid ?? sp.t);
  const [lang, stage, origin] = await Promise.all([getLang(), getStage(id), siteOrigin()]);
  if (!stage) return { title: lang === "es" ? "Tema no encontrado" : "Topic not found" };
  const pageTitle = text(lang, stage.headerEn, stage.headerEs) || text(lang, stage.labelEn, stage.labelEs);
  const description = text(lang, stage.introEn, stage.introEs) || undefined;
  return {
    title: pageTitle,
    ...previewMeta({
      lang,
      title: stagePreviewTitle(stage.id, lang, pageTitle),
      description,
      path: `/s/${stage.id}`,
      origin,
      token,
    }),
  };
}

export default async function StagePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ rid?: string; t?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const token = await readVisitToken(sp.rid ?? sp.t);
  const [lang, stages, stage, videos, brand] = await Promise.all([
    getLang(),
    listStages(),
    getStage(id),
    listVideos(),
    getBrand(),
  ]);
  if (!stage) notFound();
  const viewingIndex = stages.findIndex((item) => item.id === stage.id);
  const inStage = videos
    .filter((video) => video.stageId === stage.id)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug));
  const featured = inStage[0];
  const featuredMedia = pickMedia(lang, featured);
  const stageMedia = pickMedia(lang, stage);
  const title =
    text(lang, stage.headerEn, stage.headerEs) ||
    (featured ? text(lang, featured.titleEn, featured.titleEs) : text(lang, stage.labelEn, stage.labelEs));
  const summary = text(lang, stage.introEn, stage.introEs) || (featured ? text(lang, featured.introEn, featured.introEs) : "");
  const youtube = featuredMedia.youtube || stageMedia.youtube;
  const image = featuredMedia.youtube ? featuredMedia.image : featuredMedia.image || stageMedia.image;
  const takeaways = lines(lang, stage.takeawaysEn, stage.takeawaysEs);
  const videoTakeaways = featured ? lines(lang, featured.takeawaysEn, featured.takeawaysEs) : [];
  const steps = takeaways.length > 0 ? takeaways : videoTakeaways;
  const continues =
    text(lang, stage.nextStepsEn, stage.nextStepsEs) || (featured ? text(lang, featured.nextStepsEn, featured.nextStepsEs) : "");
  const pagePath = `/s/${stage.id}`;
  const pageLabel = stage.headerEn || stage.labelEn;
  await recordPageView({ token, path: pagePath, label: pageLabel, lang });
  const initialStars = await latestRating(token, pagePath);

  return (
    <GuideLayout
      lang={lang}
      brand={brand}
      stages={stages}
      viewingIndex={viewingIndex}
      nextPath={`/s/${stage.id}`}
      title={title}
      summary={summary}
      usually={text(lang, stage.usuallyEn, stage.usuallyEs)}
      steps={steps}
      continues={continues}
      timing={text(lang, stage.timingEn, stage.timingEs)}
      question={text(lang, stage.faqQuestionEn, stage.faqQuestionEs)}
      answer={text(lang, stage.faqAnswerEn, stage.faqAnswerEs)}
      youtube={youtube}
      image={image}
      related={inStage.filter((video) => video.slug !== featured?.slug)}
      token={token}
      pageLabel={pageLabel}
      initialStars={initialStars}
    />
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
