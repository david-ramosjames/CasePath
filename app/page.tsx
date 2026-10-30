import { ContactCard } from "@/components/ContactCard";
import { FirmHeader } from "@/components/FirmHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getBrand } from "@/lib/content";
import { getLang } from "@/lib/lang";

export const dynamic = "force-dynamic";

const copy = {
  en: {
    title: "Explore the case process",
    body: "CasePath is a guide to the common stages of an injury case. Open a topic from your text message to learn what it means and what usually happens.",
    hint: "If you typed this address yourself, go back to the message from Ramos James Law and tap the link.",
    language: "Language",
  },
  es: {
    title: "Conozca el proceso del caso",
    body: "CasePath es una guía de las etapas habituales de un caso por lesiones. Abra un tema desde su mensaje de texto para conocer qué significa y qué suele pasar.",
    hint: "Si escribió esta dirección, regrese al mensaje de Ramos James Law y toque el enlace.",
    language: "Idioma",
  },
};

export default async function HomePage() {
  const [lang, brand] = await Promise.all([getLang(), getBrand()]);
  const text = copy[lang];
  return (
    <div className="client-page">
      <div className="pin">
        <FirmHeader firmName={brand.firmName} logoUrl={brand.logoUrl} lang={lang} nextPath="/" />
      </div>
      <main className="sheet">
        <h1>{text.title}</h1>
        <p>{text.body}</p>
        <p>{text.hint}</p>
        <ContactCard lang={lang} phone={brand.phone} />
      </main>
      <SiteFooter lang={lang} />
    </div>
  );
}
