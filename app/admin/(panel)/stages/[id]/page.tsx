import { notFound } from "next/navigation";
import { CopyLink } from "@/components/CopyLink";
import { moveVideo, saveStagePage } from "@/app/admin/(panel)/actions";
import { getStage, listVideos } from "@/lib/content";
import { siteOrigin } from "@/lib/origin";

export default async function StageEditor({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { id } = await params;
  const { error, saved } = await searchParams;
  const [stage, videos, origin] = await Promise.all([getStage(id), listVideos(), siteOrigin()]);
  if (!stage) notFound();
  const inStage = videos
    .filter((video) => video.stageId === stage.id)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.slug.localeCompare(b.slug));

  return (
    <main className="sheet admin-sheet">
      <p>
        <a href="/admin">Back to stages</a>
      </p>
      <h1>{stage.labelEn}</h1>
      <p>This is the page for the whole stage. Videos listed below each get their own texting link.</p>
      {error ? <p className="form-error">{error}</p> : null}
      {saved ? <p className="form-ok">Saved.</p> : null}

      <form action={saveStagePage} className="stack">
        <input type="hidden" name="id" value={stage.id} />
        <div className="stage-row">
          <label>
            Stage name, English
            <input name="labelEn" defaultValue={stage.labelEn} required />
          </label>
          <label>
            Nombre de la etapa
            <input name="labelEs" defaultValue={stage.labelEs} required />
          </label>
          <label>
            Order
            <input name="sortOrder" type="number" min={0} defaultValue={stage.sortOrder} />
          </label>
        </div>
        <label className="check">
          <input name="optional" type="checkbox" defaultChecked={stage.optional} />
          Only if needed
        </label>
        <div className="lang-grid">
          <fieldset>
            <legend>English</legend>
            <label>
              Header
              <input name="headerEn" defaultValue={stage.headerEn} />
            </label>
            <label>
              Text
              <textarea name="introEn" defaultValue={stage.introEn} rows={4} />
            </label>
            <label>
              YouTube link
              <input name="youtubeUrlEn" defaultValue={stage.youtubeUrlEn ?? ""} placeholder="https://youtu.be/..." />
            </label>
            <label>
              Photo link, if there is no video yet
              <input name="imageUrlEn" defaultValue={stage.imageUrlEn ?? ""} placeholder="https://..." />
            </label>
            <label>
              Key points, one per line
              <textarea name="takeawaysEn" defaultValue={stage.takeawaysEn.join("\n")} rows={4} />
            </label>
            <label>
              What happens next?
              <textarea name="nextStepsEn" defaultValue={stage.nextStepsEn} rows={3} />
            </label>
          </fieldset>
          <fieldset>
            <legend>Español</legend>
            <label>
              Encabezado
              <input name="headerEs" defaultValue={stage.headerEs} />
            </label>
            <label>
              Texto
              <textarea name="introEs" defaultValue={stage.introEs} rows={4} />
            </label>
            <label>
              Enlace de YouTube
              <input name="youtubeUrlEs" defaultValue={stage.youtubeUrlEs ?? ""} placeholder="https://youtu.be/..." />
            </label>
            <label>
              Enlace de la foto, si todavía no hay video
              <input name="imageUrlEs" defaultValue={stage.imageUrlEs ?? ""} placeholder="https://..." />
            </label>
            <label>
              Puntos clave, uno por línea
              <textarea name="takeawaysEs" defaultValue={stage.takeawaysEs.join("\n")} rows={4} />
            </label>
            <label>
              ¿Qué sigue?
              <textarea name="nextStepsEs" defaultValue={stage.nextStepsEs} rows={3} />
            </label>
          </fieldset>
        </div>
        <div className="form-actions">
          <button className="contact compact" type="submit">
            Save stage
          </button>
          <a className="quiet-button" href={`/s/${stage.id}`} target="_blank" rel="noreferrer">
            Preview stage page
          </a>
        </div>
      </form>

      <section className="editor-section">
        <div className="section-heading">
          <h2>Videos in this stage</h2>
          <a className="contact compact" href={`/admin/videos/new?stage=${stage.id}`}>
            Add video
          </a>
        </div>
        <p>The top video is the main video on this stage page.</p>
        {inStage.length === 0 ? <p>No videos in this stage yet.</p> : null}
        <ul className="video-index">
          {inStage.map((video, index) => (
            <li key={video.id}>
              <div className="reorder">
                <form action={moveVideo}>
                  <input type="hidden" name="slug" value={video.slug} />
                  <input type="hidden" name="direction" value="up" />
                  <button type="submit" disabled={index === 0} aria-label={`Move ${video.titleEn} up`}>
                    Up
                  </button>
                </form>
                <form action={moveVideo}>
                  <input type="hidden" name="slug" value={video.slug} />
                  <input type="hidden" name="direction" value="down" />
                  <button type="submit" disabled={index === inStage.length - 1} aria-label={`Move ${video.titleEn} down`}>
                    Down
                  </button>
                </form>
              </div>
              <a href={`/admin/videos/${video.slug}`}>
                <strong>{video.titleEn}</strong>
                <span>{video.titleEs}</span>
              </a>
              {index === 0 ? <span className="badge on">Main video</span> : null}
              <CopyLink url={`${origin}/v/${video.slug}`} />
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
