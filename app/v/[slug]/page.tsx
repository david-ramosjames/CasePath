import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseView } from "@/components/CaseView";
import { getBrand, getVideo, listStages, listVideos } from "@/lib/content";
import { getLang, text } from "@/lib/lang";
import { siteOrigin } from "@/lib/origin";
import { previewMeta } from "@/lib/preview";
import { cleanToken, latestRating, recordPageView } from "@/lib/visit";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const [lang, video, origin] = await Promise.all([getLang(), getVideo(slug), siteOrigin()]);
  if (!video) return { title: lang === "es" ? "Tema no encontrado" : "Topic not found" };
  const title = text(lang, video.titleEn, video.titleEs);
  const description = text(lang, video.introEn, video.introEs) || undefined;
  return {
    title,
    ...previewMeta({ lang, title, description, path: `/v/${video.slug}`, origin }),
  };
}

export default async function VideoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ t?: string }>;
}) {
  const { slug } = await params;
  const token = cleanToken((await searchParams).t);
  const [lang, stages, videos, brand] = await Promise.all([getLang(), listStages(), listVideos(), getBrand()]);
  const current = videos.find((video) => video.slug === slug);
  if (!current) notFound();
  const pagePath = `/v/${current.slug}`;
  await recordPageView({ token, path: pagePath, label: current.titleEn, lang });
  const initialStars = await latestRating(token, pagePath);
  return (
    <CaseView
      lang={lang}
      brand={brand}
      stages={stages}
      videos={videos}
      current={current}
      token={token}
      initialStars={initialStars}
    />
  );
}
