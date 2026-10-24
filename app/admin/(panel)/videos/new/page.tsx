import { VideoForm } from "@/app/admin/(panel)/video-form";
import { listStages } from "@/lib/content";

export default async function NewVideoPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const stages = await listStages();
  return <VideoForm stages={stages} error={error} />;
}
