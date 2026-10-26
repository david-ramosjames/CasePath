import Link from "next/link";
import { deleteStage, saveBrand, saveStage } from "@/app/admin/(panel)/actions";
import { db } from "@/lib/db";
import { getBrand, listStages, listVideos } from "@/lib/content";

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
  const [stages, videos, brand] = await Promise.all([listStages(), listVideos(), getBrand()]);
  const nextOrder = stages.reduce((max, stage) => Math.max(max, stage.sortOrder), 0) + 1;

  return (
    <main className="sheet admin-sheet">
      <h1>CasePath editor</h1>
      <p>Each stage has its own page. Each video has its own texting link. Anyone with the link can open it.</p>
      {error ? <p className="form-error">{error}</p> : null}
      {saved ? <p className="form-ok">Saved.</p> : null}

      <section className="editor-section">
        <h2>Firm</h2>
        <form action={saveBrand} className="stack">
          <label>
            Firm name
            <input name="firmName" defaultValue={brand.firmName} />
          </label>
          <label>
            Phone number for the call button
            <input name="phone" defaultValue={brand.phone} placeholder="512-537-3369" inputMode="tel" />
          </label>
          <label>
            Upload logo (PNG, JPG, or WebP, under 2 MB)
            <input name="logo" type="file" accept="image/png,image/jpeg,image/webp" />
          </label>
          <label>
            Or paste a logo link
            <input name="logoUrl" defaultValue={brand.logoUrl} placeholder="https://..." />
          </label>
          {brand.logoUrl ? (
            <div className="logo-preview">
              <img src={brand.logoUrl} alt="" />
            </div>
          ) : null}
          <button className="contact compact" type="submit">
            Save
          </button>
        </form>
      </section>

      <section className="editor-section">
        <h2>Stages</h2>
        <ul className="stage-cards">
          {stages.map((stage) => {
            const count = videos.filter((video) => video.stageId === stage.id).length;
            return (
              <li key={stage.id}>
                <Link href={`/admin/stages/${stage.id}`}>
                  <strong>
                    {stage.sortOrder}. {stage.labelEn}
                  </strong>
                  <span>{stage.labelEs}</span>
                  <span>
                    {count} {count === 1 ? "video" : "videos"}
                  </span>
                </Link>
                <form action={deleteStage}>
                  <input type="hidden" name="id" value={stage.id} />
                  <button className="quiet-button" type="submit">
                    Delete
                  </button>
                </form>
              </li>
            );
          })}
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
    </main>
  );
}
