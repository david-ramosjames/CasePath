import { notFound } from "next/navigation";
import { CaseView } from "@/components/CaseView";
import { isAdmin } from "@/lib/auth";
import { getBrand, listStages, listVideos } from "@/lib/content";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";

export default async function VideoPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [lang, stages, videos, admin, brand] = await Promise.all([
    getLang(),
    listStages(),
    listVideos(),
    isAdmin(),
    getBrand(),
  ]);
  const current = videos.find((video) => video.slug === slug);
  if (!current || (!current.published && !admin)) notFound();
  const visible = admin ? videos : videos.filter((video) => video.published);
  return <CaseView lang={lang} brand={brand} stages={stages} videos={visible} current={current} />;
}
