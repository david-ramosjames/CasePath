import type { Lang } from "@/lib/types";

export function ContactCard({ lang }: { lang: Lang }) {
  const es = lang === "es";
  return (
    <aside className="help">
      <h2>{es ? "Estamos aquí si nos necesita." : "We're here if you need us."}</h2>
      <p>
        {es
          ? "¿Tiene preguntas? Responda al mensaje de texto que le enviamos, o llame a nuestro equipo."
          : "Have questions? Reply to the text message we sent you, or give our team a call."}
      </p>
      <a className="help-button" href="https://www.ramosjames.com/">
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M7.2 4.8h2.1l1.2 3-1.5 1a12 12 0 0 0 5.2 5.2l1-1.5 3 1.2v2.1c0 .8-.6 1.5-1.4 1.6A14.5 14.5 0 0 1 5.6 6.2c.1-.8.8-1.4 1.6-1.4Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
        </svg>
        {es ? "Contáctenos" : "Contact us"}
      </a>
    </aside>
  );
}
