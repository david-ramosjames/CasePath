import { notFound } from "next/navigation";
import { CaseView } from "@/components/CaseView";
import { getBrand, listStages, listVideos } from "@/lib/content";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";

export default async function VideoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [lang, stages, videos, brand] = await Promise.all([getLang(), listStages(), listVideos(), getBrand()]);
  const current = videos.find((video) => video.slug === slug);
  if (!current) notFound();
  return <CaseView lang={lang} brand={brand} stages={stages} videos={videos} current={current} />;
}
