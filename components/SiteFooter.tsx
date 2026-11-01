import type { Lang } from "@/lib/types";

const social = [
  {
    name: "Instagram",
    href: "https://www.instagram.com/law_law_land_tx/",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="4" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="12" cy="12" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <circle cx="17.2" cy="6.8" r="1" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Facebook",
    href: "https://www.facebook.com/severeinjurylawyer/",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M14.2 8.1V6.8c0-.4.3-.7.8-.7h1.5V4h-1.7C12.5 4 11 5.4 11 7.5v1.5H9.2V12H11v8h2.5v-8h2l.3-3h-2.3V8.1c0-.2.2-.4.5-.4h.7z"
        />
      </svg>
    ),
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@ramosjameslaw",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="currentColor"
          d="M14.2 4c.4 2.2 1.7 3.8 3.8 4.1v2.3a6.4 6.4 0 0 1-3.6-1.1v5.4a4.9 4.9 0 1 1-4.9-4.9c.3 0 .5 0 .8.1v2.4a2.6 2.6 0 1 0 1.8 2.5V4h2.1z"
        />
      </svg>
    ),
  },
  {
    name: "YouTube",
    href: "https://www.youtube.com/@RamosJamesLaw",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="3" y="6.5" width="18" height="11" rx="3" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path fill="currentColor" d="M11 9.4v5.2l4.6-2.6L11 9.4z" />
      </svg>
    ),
  },
  {
    name: "LinkedIn",
    href: "https://www.linkedin.com/company/ramosjameslaw/",
    icon: (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="2" fill="none" stroke="currentColor" strokeWidth="1.8" />
        <path
          fill="currentColor"
          d="M8 10.3h1.7V16H8v-5.7zm.9-2.7a1 1 0 1 1 0 2 1 1 0 0 1 0-2zM12.1 10.3h1.6v.8h.1c.2-.4.8-.8 1.7-.8 1.8 0 2.1 1.2 2.1 2.7V16h-1.7v-2.5c0-.6 0-1.4-.9-1.4s-1 .6-1 1.4V16h-1.7v-5.7z"
        />
      </svg>
    ),
  },
];

export function SiteFooter({ lang = "en" }: { lang?: Lang }) {
  const es = lang === "es";
  return (
    <footer className="site-foot">
      <nav className="social-links" aria-label={es ? "Redes sociales" : "Social media"}>
        {social.map((item) => (
          <a
            key={item.name}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={es ? `${item.name} de Ramos James Law` : `Ramos James Law on ${item.name}`}
          >
            {item.icon}
          </a>
        ))}
      </nav>
      <nav className="legal-links" aria-label={es ? "Firma" : "Firm"}>
        <a href="https://www.ramosjames.com/privacy-policy/">{es ? "Política de privacidad" : "Privacy policy"}</a>
        <span aria-hidden="true">|</span>
        <a href="https://www.ramosjames.com/">{es ? "Visite Ramos James Law" : "Visit Ramos James Law"}</a>
      </nav>
    </footer>
  );
}
