import type { Lang } from "@/lib/types";

export function FirmHeader({
  firmName,
  logoUrl,
  lang,
  nextPath,
}: {
  firmName: string;
  logoUrl: string;
  lang: Lang;
  nextPath: string;
}) {
  const es = lang === "es";
  return (
    <header className="site-header client-header">
      <div className="brand">
        {logoUrl ? (
          <span className="logo-mark">
            <img className="logo" src={logoUrl} alt="" />
          </span>
        ) : null}
        <p className="firm-name">{firmName}</p>
      </div>
      <nav className="lang" aria-label={es ? "Idioma" : "Language"}>
        <a href={`/lang?lang=en&next=${encodeURIComponent(nextPath)}`} aria-current={lang === "en" ? "page" : undefined}>
          <span className="lang-short">EN</span>
          <span className="lang-full">English</span>
        </a>
        <a href={`/lang?lang=es&next=${encodeURIComponent(nextPath)}`} aria-current={lang === "es" ? "page" : undefined}>
          <span className="lang-short">ES</span>
          <span className="lang-full">Español</span>
        </a>
      </nav>
    </header>
  );
}
