import { ContactCard } from "@/components/ContactCard";
import { ExperienceRating } from "@/components/ExperienceRating";
import { FirmHeader } from "@/components/FirmHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getBrand } from "@/lib/content";
import { getLang } from "@/lib/lang";
import { cleanToken, latestRating, recordPageView } from "@/lib/visit";
import { withLang } from "@/lib/with-lang";

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

export default async function HomePage({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const token = cleanToken((await searchParams).t);
  const [lang, brand] = await Promise.all([getLang(), getBrand()]);
  const text = copy[lang];
  const pageLabel = "CasePath home";
  await recordPageView({ token, path: "/", label: pageLabel, lang });
  const initialStars = await latestRating(token, "/");
  return (
    <div className="client-page">
      <div className="pin">
        <FirmHeader firmName={brand.firmName} logoUrl={brand.logoUrl} lang={lang} nextPath={withLang("/", "en", token)} />
      </div>
      <main className="sheet">
        <h1>{text.title}</h1>
        <p>{text.body}</p>
        <p>{text.hint}</p>
        <ContactCard lang={lang} phone={brand.phone} />
      </main>
      <ExperienceRating lang={lang} token={token} pagePath="/" pageLabel={pageLabel} initialStars={initialStars} />
      <SiteFooter lang={lang} />
    </div>
  );
}
