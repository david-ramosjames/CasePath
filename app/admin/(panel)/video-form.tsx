import { deleteVideo, saveVideo } from "@/app/admin/(panel)/actions";
import { DeleteVideoButton } from "@/app/admin/(panel)/delete-button";
import { CopyLink } from "@/components/CopyLink";
import type { Stage, Video } from "@/lib/types";
import { embedUrl } from "@/lib/youtube";

export function VideoForm({
  stages,
  video,
  error,
  saved,
  textingUrl,
  defaultStage,
}: {
  stages: Stage[];
  video?: Video;
  error?: string;
  saved?: boolean;
  textingUrl?: string;
  defaultStage?: string;
}) {
  const englishPlayer = embedUrl(video?.youtubeUrlEn);
  const spanishPlayer = embedUrl(video?.youtubeUrlEs);

  return (
    <main className="sheet admin-sheet">
      <p>
        <a href="/admin">Back to stages and videos</a>
      </p>
      <h1>{video ? video.titleEn : "New video"}</h1>
      {textingUrl ? (
        <section>
          <h2>Texting link</h2>
          <p>Send this exact link. It stays private until the video is published.</p>
          <CopyLink url={textingUrl} />
        </section>
      ) : null}
      {error ? <p className="form-error">{error}</p> : null}
      {saved ? <p className="form-ok">Saved.</p> : null}
      <form action={saveVideo} className="stack">
        {video ? <input type="hidden" name="originalSlug" value={video.slug} /> : null}
        <div className="stage-row">
          <label>
            Link name
            <input name="slug" defaultValue={video?.slug ?? ""} required pattern="[a-z0-9]+(-[a-z0-9]+)*" />
          </label>
          <label>
            Stage
            <select name="stageId" defaultValue={video?.stageId ?? defaultStage ?? stages[0]?.id} required>
              {stages.map((stage) => (
                <option key={stage.id} value={stage.id}>
                  {stage.labelEn}
                </option>
              ))}
            </select>
          </label>
          <label>
            Order in stage
            <input name="sortOrder" type="number" min={0} defaultValue={video?.sortOrder ?? 0} />
          </label>
        </div>
        <label className="check">
          <input name="published" type="checkbox" defaultChecked={video?.published ?? false} />
          Published on the client page
        </label>
        <div className="lang-grid">
          <fieldset>
            <legend>English</legend>
            <label>
              Title
              <input name="titleEn" defaultValue={video?.titleEn ?? ""} required />
            </label>
            <label>
              Intro
              <textarea name="introEn" defaultValue={video?.introEn ?? ""} rows={3} />
            </label>
            <label>
              YouTube link
              <input name="youtubeUrlEn" defaultValue={video?.youtubeUrlEn ?? ""} placeholder="https://youtu.be/..." />
            </label>
            <label>
              Photo link, if there is no video yet
              <input name="imageUrlEn" defaultValue={video?.imageUrlEn ?? ""} placeholder="https://..." />
            </label>
            {englishPlayer ? (
              <div className="player">
                <iframe src={englishPlayer} title={video?.titleEn || "English video"} allowFullScreen />
              </div>
            ) : null}
            <label>
              Takeaways, one per line
              <textarea name="takeawaysEn" defaultValue={(video?.takeawaysEn ?? []).join("\n")} rows={4} />
            </label>
            <label>
              What happens next?
              <textarea name="nextStepsEn" defaultValue={video?.nextStepsEn ?? ""} rows={3} />
            </label>
          </fieldset>
          <fieldset>
            <legend>Español</legend>
            <label>
              Título
              <input name="titleEs" defaultValue={video?.titleEs ?? ""} required />
            </label>
            <label>
              Introducción
              <textarea name="introEs" defaultValue={video?.introEs ?? ""} rows={3} />
            </label>
            <label>
              Enlace de YouTube
              <input name="youtubeUrlEs" defaultValue={video?.youtubeUrlEs ?? ""} placeholder="https://youtu.be/..." />
            </label>
            <label>
              Enlace de la foto, si todavía no hay video
              <input name="imageUrlEs" defaultValue={video?.imageUrlEs ?? ""} placeholder="https://..." />
            </label>
            {spanishPlayer ? (
              <div className="player">
                <iframe src={spanishPlayer} title={video?.titleEs || "Video en español"} allowFullScreen />
              </div>
            ) : null}
            <label>
              Puntos, uno por línea
              <textarea name="takeawaysEs" defaultValue={(video?.takeawaysEs ?? []).join("\n")} rows={4} />
            </label>
            <label>
              ¿Qué sigue?
              <textarea name="nextStepsEs" defaultValue={video?.nextStepsEs ?? ""} rows={3} />
            </label>
          </fieldset>
        </div>
        <div className="form-actions">
          <button className="contact compact" type="submit">
            Save
          </button>
          {video ? (
            <>
          <a className="quiet-button" href={`/lang?lang=en&next=${encodeURIComponent(`/v/${video.slug}`)}`} target="_blank" rel="noreferrer">
            Preview English page
          </a>
          <a className="quiet-button" href={`/lang?lang=es&next=${encodeURIComponent(`/v/${video.slug}`)}`} target="_blank" rel="noreferrer">
            Preview Spanish page
          </a>
            </>
          ) : null}
        </div>
      </form>
      {video ? <DeleteVideoButton action={deleteVideo} slug={video.slug} /> : null}
    </main>
  );
}
