import type { Lang, Video } from "@/lib/types";
import { text } from "@/lib/lang";
import { thumbUrl } from "@/lib/youtube";

export function VideoCards({ lang, videos, heading }: { lang: Lang; videos: Video[]; heading: string }) {
  if (videos.length === 0) return null;
  const es = lang === "es";
  return (
    <section className="playlist">
      <h2>{heading}</h2>
      <ul>
        {videos.map((video) => {
          const youtube = es ? video.youtubeUrlEs || video.youtubeUrlEn : video.youtubeUrlEn || video.youtubeUrlEs;
          const image = es ? video.imageUrlEs || video.imageUrlEn : video.imageUrlEn || video.imageUrlEs;
          const thumb = thumbUrl(youtube) || image;
          return (
            <li key={video.slug}>
              <a className="video-card" href={`/v/${video.slug}`}>
                <span className="thumb">
                  {thumb ? <img src={thumb} alt="" /> : null}
                  <span className="play" aria-hidden="true">
                    <svg viewBox="0 0 24 24">
                      <circle cx="12" cy="12" r="10" />
                      <path d="M10 8.5v7l6-3.5-6-3.5Z" />
                    </svg>
                  </span>
                </span>
                <span className="video-copy">
                  <strong>{text(lang, video.titleEn, video.titleEs)}</strong>
                  <span>{text(lang, video.introEn, video.introEs)}</span>
                </span>
                <span className="chevron" aria-hidden="true">
                  ›
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
