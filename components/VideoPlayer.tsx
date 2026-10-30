"use client";

import { useState } from "react";
import { embedUrl, thumbUrl } from "@/lib/youtube";

export function VideoPlayer({ title, youtube }: { title: string; youtube: string }) {
  const [playing, setPlaying] = useState(false);
  const poster = thumbUrl(youtube);
  const src = embedUrl(youtube);
  if (!src) return null;
  if (!playing) {
    return (
      <button type="button" className="player poster" aria-label={`Play ${title}`} onClick={() => setPlaying(true)}>
        {poster ? <img src={poster} alt="" /> : null}
        <span className="poster-play" aria-hidden="true">
          <svg viewBox="0 0 68 68">
            <circle cx="34" cy="34" r="32" />
            <path d="M28 22v24l22-12-22-12Z" />
          </svg>
        </span>
      </button>
    );
  }
  const player = `${src}?autoplay=1&rel=0&modestbranding=1&iv_load_policy=3&cc_load_policy=0&playsinline=1`;
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
