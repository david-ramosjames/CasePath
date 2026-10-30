import type { Lang } from "@/lib/types";

export function telHref(phone: string) {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) return `tel:+1${digits}`;
  if (digits.length === 11 && digits.startsWith("1")) return `tel:+${digits}`;
  if (digits.length > 11) return `tel:+${digits}`;
  return "";
}

export function ContactCard({ lang, phone }: { lang: Lang; phone: string }) {
  const es = lang === "es";
  const href = telHref(phone);
  const row = (
    <>
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
      <span className="call-copy">
        <strong>{es ? "¿Preguntas?" : "Questions?"}</strong>
        <span>{es ? "Responda a nuestro mensaje o llámenos." : "Reply to our text or call us."}</span>
      </span>
    </>
  );
  return (
    <aside className="call-card">
      <div className="call-row">{row}</div>
      {href ? (
        <a className="call-button" href={href}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M7.2 4.8h2.1l1.2 3-1.5 1a12 12 0 0 0 5.2 5.2l1-1.5 3 1.2v2.1c0 .8-.6 1.5-1.4 1.6A14.5 14.5 0 0 1 5.6 6.2c.1-.8.8-1.4 1.6-1.4Z"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
          </svg>
          {es ? "Llame a su equipo" : "Call your team"}
        </a>
      ) : null}
    </aside>
  );
}
