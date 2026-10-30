import { ContactCard, telHref } from "@/components/ContactCard";
import { FirmHeader } from "@/components/FirmHeader";
import { MediaFrame } from "@/components/MediaFrame";
import { NextSteps } from "@/components/NextSteps";
import { SiteFooter } from "@/components/SiteFooter";
import { StageTracker } from "@/components/StageTracker";
import { VideoCards } from "@/components/VideoCards";
import type { Brand, Lang, Stage, Video } from "@/lib/types";

function isStatusDisclaimer(question: string) {
  return /highlighted topic|tema resaltado/i.test(question);
}

export function GuideLayout({
  lang,
  brand,
  stages,
  viewingIndex,
  nextPath,
  title,
  summary,
  usually,
  steps,
  continues,
  timing,
  question,
  answer,
  youtube,
  image,
  related,
}: {
  lang: Lang;
  brand: Brand;
  stages: Stage[];
  viewingIndex: number;
  nextPath: string;
  title: string;
  summary: string;
  usually: string;
  steps: string[];
  continues: string;
  timing: string;
  question: string;
  answer: string;
  youtube: string | null;
  image: string | null;
  related: Video[];
}) {
  const es = lang === "es";
  const href = telHref(brand.phone);
  const hasMedia = Boolean(youtube || image);
  const current = stages[viewingIndex];
  const topic = current ? (es ? current.labelEs : current.labelEn) : "";
  const showQuestion = Boolean(question && answer && !isStatusDisclaimer(question));

  return (
    <div className="client-page guide-page">
      <div className="pin">
        <FirmHeader firmName={brand.firmName} logoUrl={brand.logoUrl} lang={lang} nextPath={nextPath} />
        <StageTracker lang={lang} stages={stages} viewingIndex={viewingIndex} />
      </div>
      <div className="guide-wrap">
        <main className="guide-main">
          {topic ? <p className="eyebrow">{topic}</p> : null}
          <h1>{title}</h1>
          {summary ? <p className="summary">{summary}</p> : null}
          {hasMedia ? <MediaFrame title={title} youtube={youtube} image={image} /> : null}
          {steps.length > 0 ? (
            <section className="guide-block">
              <h2>{youtube ? (es ? "En este video" : "In this video") : es ? "En esta etapa" : "In this stage"}</h2>
              <ul className="takeaways">
                {steps.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          ) : null}
          {continues ? <NextSteps title={es ? "¿Qué sigue?" : "What happens next?"} body={continues} /> : null}
          {usually ? (
            <section className="guide-block">
              <h2>{es ? "Qué suele pasar" : "What usually happens"}</h2>
              <p>{usually}</p>
            </section>
          ) : null}
          {timing ? (
            <section className="guide-block">
              <h2>{es ? "Qué influye en los tiempos" : "What affects the timing"}</h2>
              <p>{timing}</p>
            </section>
          ) : null}
          {showQuestion ? (
            <section className="guide-block faq">
              <h2>{question}</h2>
              <p>{answer}</p>
            </section>
          ) : null}
          <div className="related-mobile">
            <VideoCards lang={lang} videos={related} heading={topic ? (es ? `Más en ${topic}` : `More in ${topic}`) : es ? "Más videos" : "More videos"} />
          </div>
          <div className="related-extra">
            <VideoCards lang={lang} videos={related.slice(2)} heading={topic ? (es ? `Más en ${topic}` : `More in ${topic}`) : es ? "Más videos" : "More videos"} />
          </div>
        </main>
        <aside className="guide-side">
          <ContactCard lang={lang} phone={brand.phone} />
          <VideoCards lang={lang} videos={related.slice(0, 2)} heading={topic ? (es ? `Más en ${topic}` : `More in ${topic}`) : es ? "Más videos" : "More videos"} />
        </aside>
      </div>
      <SiteFooter lang={lang} />
      <div className="call-bar">
        <span className="call-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24">
            <path
              d="M7.2 4.8h2.1l1.2 3-1.5 1a12 12 0 0 0 5.2 5.2l1-1.5 3 1.2v2.1c0 .8-.6 1.5-1.4 1.6A14.5 14.5 0 0 1 5.6 6.2c.1-.8.8-1.4 1.6-1.4Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
        </span>
        <p>
          <strong>{es ? "¿Preguntas?" : "Questions?"}</strong>
          {es ? "Responda a nuestro mensaje o llámenos." : "Reply to our text or call us."}
        </p>
        {href ? <a href={href}>{es ? "Llamar" : "Call"}</a> : null}
      </div>
    </div>
  );
}
