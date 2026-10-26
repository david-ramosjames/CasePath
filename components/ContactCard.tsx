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
  const inner = (
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
        <strong>{es ? "Estamos aquí si nos necesita." : "We're here if you need us."}</strong>
        <span>
          {es
            ? "¿Tiene preguntas? Responda al mensaje de texto o llame a nuestro equipo."
            : "Have questions? Reply to your text message or give our team a call."}
        </span>
      </span>
      {href ? (
        <span className="chevron" aria-hidden="true">
          ›
        </span>
      ) : null}
    </>
  );
  if (!href) return <aside className="call-card">{inner}</aside>;
  return (
    <a className="call-card" href={href}>
      {inner}
    </a>
  );
}
