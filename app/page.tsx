import { ContactCard } from "@/components/ContactCard";
import { FirmHeader } from "@/components/FirmHeader";
import { getBrand } from "@/lib/content";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";

const copy = {
  en: {
    title: "Open the link in your text message",
    body: "CasePath is the page we send with a video about your case. It opens from that personal link, which shows where your case stands.",
    hint: "If you typed this address yourself, go back to the message from Ramos James Law and tap the link.",
    language: "Language",
  },
  es: {
    title: "Abra el enlace de su mensaje de texto",
    body: "CasePath es la página que enviamos con un video sobre su caso. Se abre desde ese enlace personal y muestra en qué etapa está su caso.",
    hint: "Si escribió esta dirección, regrese al mensaje de Ramos James Law y toque el enlace.",
    language: "Idioma",
  },
};

export default async function HomePage() {
  const [lang, brand] = await Promise.all([getLang(), getBrand()]);
  const text = copy[lang];
  return (
    <>
      <div className="pin">
        <FirmHeader firmName={brand.firmName} logoUrl={brand.logoUrl} lang={lang} nextPath="/" />
      </div>
      <main className="sheet">
        <h1>{text.title}</h1>
        <p>{text.body}</p>
        <p>{text.hint}</p>
        <ContactCard lang={lang} />
      </main>
    </>
  );
}
