import { notFound } from "next/navigation";
import { VideoForm } from "@/app/admin/(panel)/video-form";
import { getVideo, listStages } from "@/lib/content";
import { siteOrigin } from "@/lib/origin";

export default async function EditVideoPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { slug } = await params;
  const { error, saved } = await searchParams;
  const [video, stages, origin] = await Promise.all([getVideo(slug), listStages(), siteOrigin()]);
  if (!video) notFound();
  return (
    <VideoForm
      stages={stages}
      video={video}
      error={error}
      saved={saved === "1"}
      textingUrl={`${origin}/v/${video.slug}`}
    />
  );
}
