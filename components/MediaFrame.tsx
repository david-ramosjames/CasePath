import { VideoPlayer } from "@/components/VideoPlayer";
import { embedUrl } from "@/lib/youtube";

export function MediaFrame({
  title,
  youtube,
  image,
}: {
  title: string;
  youtube: string | null;
  image: string | null;
}) {
  if (embedUrl(youtube) && youtube) {
    return <VideoPlayer title={title} youtube={youtube} />;
  }
  if (image) {
    return (
      <div className="player still">
        <img src={image} alt="" />
      </div>
    );
  }
  return null;
}
