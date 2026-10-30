import { FirmHeader } from "@/components/FirmHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { getBrand } from "@/lib/content";
import { getLang } from "@/lib/lang";

export default async function NotFound() {
  const [lang, brand] = await Promise.all([getLang(), getBrand()]);
  const es = lang === "es";
  return (
    <div className="client-page">
      <FirmHeader firmName={brand.firmName} logoUrl={brand.logoUrl} lang={lang} nextPath="/" />
      <main className="sheet">
        <h1>{es ? "No encontramos este tema" : "We could not find this topic"}</h1>
        <p>
          {es
            ? "Explore todos los temas o contacte a Ramos James Law."
            : "Explore all topics or contact Ramos James Law."}
        </p>
        <p>
          <a href="/s/getting-started">{es ? "Conozca el proceso del caso" : "Explore the case process"}</a>
        </p>
      </main>
      <SiteFooter lang={lang} />
    </div>
  );
}
