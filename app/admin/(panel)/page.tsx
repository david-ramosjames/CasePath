import Link from "next/link";
import { deleteStage, saveStage } from "@/app/admin/(panel)/actions";
import { db } from "@/lib/db";
import { listStages, listVideos } from "@/lib/content";

export default async function AdminHome({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; saved?: string }>;
}) {
  const { error, saved } = await searchParams;
  if (!db()) {
    return (
      <main className="sheet">
        <p className="form-error">Database is not configured.</p>
      </main>
    );
  }
  const [stages, videos] = await Promise.all([listStages(), listVideos()]);
  const nextOrder = stages.reduce((max, stage) => Math.max(max, stage.sortOrder), 0) + 1;

  return (
    <main className="sheet admin-sheet">
      <h1>Stages and videos</h1>
      <p>
        English and Spanish are edited together. A video stays off the public site until you publish it. The seven
        campaign videos are loaded as drafts, with the YouTube links already in place.
      </p>
      {error ? <p className="form-error">{error}</p> : null}
      {saved ? <p className="form-ok">Saved.</p> : null}

      <section className="editor-section">
        <h2>Stages</h2>
        <ul className="editor-list">
          {stages.map((stage) => (
            <li key={stage.id}>
              <form action={saveStage} className="stage-row">
                <input type="hidden" name="id" value={stage.id} />
                <label>
                  English
                  <input name="labelEn" defaultValue={stage.labelEn} required />
                </label>
                <label>
                  Español
                  <input name="labelEs" defaultValue={stage.labelEs} required />
                </label>
                <label>
                  Order
                  <input name="sortOrder" type="number" min={0} defaultValue={stage.sortOrder} />
                </label>
                <label className="check">
                  <input name="optional" type="checkbox" defaultChecked={stage.optional} />
                  Only if needed
                </label>
                <button className="contact compact" type="submit">
                  Save
                </button>
              </form>
              <form action={deleteStage}>
                <input type="hidden" name="id" value={stage.id} />
                <button className="quiet-button" type="submit">
                  Delete stage
                </button>
              </form>
            </li>
          ))}
        </ul>
        <h3>Add a stage</h3>
        <form action={saveStage} className="stage-row">
          <label>
            English
            <input name="labelEn" required />
          </label>
          <label>
            Español
            <input name="labelEs" required />
          </label>
          <label>
            Order
            <input name="sortOrder" type="number" min={0} defaultValue={nextOrder} />
          </label>
          <label className="check">
            <input name="optional" type="checkbox" />
            Only if needed
          </label>
          <button className="contact compact" type="submit">
            Add stage
          </button>
        </form>
      </section>

      <section className="editor-section">
        <div className="section-heading">
          <h2>Videos</h2>
          <Link className="contact compact" href="/admin/videos/new">
            Add video
          </Link>
        </div>
        {stages.map((stage) => {
          const items = videos.filter((video) => video.stageId === stage.id);
          if (items.length === 0) return null;
          return (
            <div key={stage.id}>
              <h3>{stage.labelEn}</h3>
              <ul className="video-index">
                {items.map((video) => (
                  <li key={video.id}>
                    <Link href={`/admin/videos/${video.slug}`}>
                      <strong>{video.titleEn}</strong>
                      <span>{video.titleEs}</span>
                    </Link>
                    <span className={video.published ? "badge on" : "badge"}>{video.published ? "Published" : "Draft"}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </section>
    </main>
  );
}
