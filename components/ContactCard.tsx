import type { Lang } from "@/lib/types";

const CALL = "tel:+15125373369";

export function ContactCard({ lang }: { lang: Lang }) {
  const es = lang === "es";
  return (
    <footer className="contact-line">
      <p>{es ? "¿Preguntas? Responda a nuestro texto o llámenos." : "Questions? Reply to our text or call us."}</p>
      <a href={CALL}>{es ? "Llámenos" : "Call us"}</a>
    </footer>
  );
}
