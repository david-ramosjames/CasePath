import type { Lang } from "@/lib/types";

export function SiteFooter({ lang = "en" }: { lang?: Lang }) {
  const es = lang === "es";
  return (
    <footer className="site-foot">
      <nav aria-label={es ? "Firma" : "Firm"}>
        <a href="https://www.ramosjames.com/privacy-policy/">{es ? "Política de privacidad" : "Privacy policy"}</a>
        <span aria-hidden="true">|</span>
        <a href="https://www.ramosjames.com/">{es ? "Visite Ramos James Law" : "Visit Ramos James Law"}</a>
      </nav>
    </footer>
  );
}
