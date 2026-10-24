import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";

const copy = {
  en: {
    title: "Open the link in your text message",
    body: "CasePath is the page we send with a video about your case. It opens from that personal link, which shows where your case stands.",
    hint: "If you typed this address yourself, go back to the message from Ramos James Law and tap the link.",
    contact: "Visit Ramos James Law",
    language: "Language",
  },
  es: {
    title: "Abra el enlace de su mensaje de texto",
    body: "CasePath es la página que enviamos con un video sobre su caso. Se abre desde ese enlace personal y muestra en qué etapa está su caso.",
    hint: "Si escribió esta dirección, regrese al mensaje de Ramos James Law y toque el enlace.",
    contact: "Visitar Ramos James Law",
    language: "Idioma",
  },
};

export default async function HomePage() {
  const lang = await getLang();
  const text = copy[lang];
  return (
    <>
      <header className="site-header">
        <div>
          <p className="firm-name">Ramos James Law</p>
          <p className="product-name">CasePath</p>
        </div>
        <nav className="lang" aria-label={text.language}>
          <a href="/lang?lang=en&next=/" aria-current={lang === "en" ? "page" : undefined}>
            English
          </a>
          <a href="/lang?lang=es&next=/" aria-current={lang === "es" ? "page" : undefined}>
            Español
          </a>
        </nav>
      </header>
      <main className="sheet">
        <h1>{text.title}</h1>
        <p>{text.body}</p>
        <p>{text.hint}</p>
        <a className="contact" href="https://www.ramosjames.com/">
          {text.contact}
        </a>
      </main>
    </>
  );
}
