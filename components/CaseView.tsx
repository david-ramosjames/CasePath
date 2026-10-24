import type { Lang, Stage, Video } from "@/lib/types";
import { lines, text } from "@/lib/lang";
import { embedUrl } from "@/lib/youtube";

export function CaseView({
  lang,
  stages,
  videos,
  current,
}: {
  lang: Lang;
  stages: Stage[];
  videos: Video[];
  current: Video;
}) {
  const es = lang === "es";
  const title = text(lang, current.titleEn, current.titleEs);
  const intro = text(lang, current.introEn, current.introEs);
  const nextSteps = text(lang, current.nextStepsEn, current.nextStepsEs);
  const takeaways = lines(lang, current.takeawaysEn, current.takeawaysEs);
  const source = es ? current.youtubeUrlEs || current.youtubeUrlEn : current.youtubeUrlEn || current.youtubeUrlEs;
  const player = embedUrl(source);
  const viewingIndex = stages.findIndex((stage) => stage.id === current.stageId);
  const related = videos
    .filter((video) => video.stageId === current.stageId && video.slug !== current.slug)
    .sort((a, b) => a.sortOrder - b.sortOrder);
  const nextPath = `/v/${current.slug}`;

  return (
    <>
      <header className="site-header">
        <div>
          <p className="firm-name">Ramos James Law</p>
          <p className="product-name">CasePath</p>
        </div>
        <nav className="lang" aria-label={es ? "Idioma" : "Language"}>
          <a href={`/lang?lang=en&next=${encodeURIComponent(nextPath)}`} aria-current={lang === "en" ? "page" : undefined}>
            English
          </a>
          <a href={`/lang?lang=es&next=${encodeURIComponent(nextPath)}`} aria-current={lang === "es" ? "page" : undefined}>
            Español
          </a>
        </nav>
      </header>
      <nav className="tracker" aria-label={es ? "Etapas del caso" : "Case stages"}>
        {stages.map((stage, index) => {
          const first = videos
            .filter((video) => video.stageId === stage.id)
            .sort((a, b) => a.sortOrder - b.sortOrder)[0];
          const state = index === viewingIndex ? "active" : index < viewingIndex ? "done" : "upcoming";
          const label = es ? stage.labelEs : stage.labelEn;
          const className = `stage ${state}${stage.optional ? " optional" : ""}`;
          const inner = (
            <>
              <span className="stage-label">{label}</span>
              {stage.optional ? <span className="stage-note">{es ? "Solo si hace falta" : "Only if needed"}</span> : null}
            </>
          );
          return first ? (
            <a key={stage.id} className={className} href={`/v/${first.slug}`} aria-current={state === "active" ? "page" : undefined}>
              {inner}
            </a>
          ) : (
            <span key={stage.id} className={className}>
              {inner}
            </span>
          );
        })}
      </nav>
      <main className="sheet">
        <p className="eyebrow">{es ? "Este video" : "This video"}</p>
        <h1>{title}</h1>
        {intro ? <p>{intro}</p> : null}
        {player ? (
          <div className="player">
            <iframe
              src={player}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <p className="fallback">
            {es
              ? "Este video no se puede reproducir en este momento."
              : "This video cannot be played right now."}{" "}
            <a href="https://www.ramosjames.com/">{es ? "Visitar Ramos James Law" : "Visit Ramos James Law"}</a>
          </p>
        )}
        {takeaways.length > 0 ? (
          <ul className="takeaways">
            {takeaways.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        {nextSteps ? (
          <section className="next">
            <h2>{es ? "¿Qué sigue?" : "What happens next?"}</h2>
            <p>{nextSteps}</p>
          </section>
        ) : null}
        {related.length > 0 ? (
          <section className="playlist">
            <h2>{es ? "Más en esta etapa" : "More in this stage"}</h2>
            <ul>
              {related.map((video) => (
                <li key={video.slug}>
                  <a href={`/v/${video.slug}`}>{text(lang, video.titleEn, video.titleEs)}</a>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </main>
    </>
  );
}
