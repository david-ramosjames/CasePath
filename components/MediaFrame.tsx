import { embedUrl } from "@/lib/youtube";

export function MediaFrame({
  title,
  youtube,
  image,
  empty,
}: {
  title: string;
  youtube: string | null;
  image: string | null;
  empty: string;
}) {
  const player = embedUrl(youtube);
  if (player) {
    return (
      <div className="player">
        <iframe
          src={player}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }
  if (image) {
    return (
      <div className="player still">
        <img src={image} alt="" />
      </div>
    );
  }
  return <p className="fallback">{empty}</p>;
}
