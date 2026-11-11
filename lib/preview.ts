import type { Metadata } from "next";
import type { Lang } from "@/lib/types";

export const previewImage = {
  path: "/previews/casepath-preview-v1.jpg",
  width: 1024,
  height: 535,
  type: "image/jpeg",
};

const stageTitles: Record<string, { en: string; es: string }> = {
  "getting-started": { en: "Understand the case process", es: "Conozca el proceso del caso" },
  treatment: { en: "Medical care and your claim", es: "Atención médica y su reclamo" },
  demand: { en: "How a claim works", es: "Cómo funciona un reclamo" },
  negotiation: { en: "How negotiation works", es: "Cómo funciona la negociación" },
  litigation: { en: "What if a lawsuit is needed?", es: "¿Y si se necesita una demanda judicial?" },
  settlement: { en: "Understanding a settlement", es: "Comprenda un acuerdo" },
  disbursement: { en: "Closing and payment", es: "Cierre y pago" },
};

export function stagePreviewTitle(id: string, lang: Lang, fallback: string) {
  const titles = stageTitles[id];
  if (!titles) return fallback;
  return lang === "es" ? titles.es : titles.en;
}

export function previewMeta({
  lang,
  title,
  description,
  path,
  origin,
  token,
}: {
  lang: Lang;
  title: string;
  description?: string;
  path: string;
  origin: string;
  token?: string | null;
}): Metadata {
  // Preview crawlers are rewritten to the bare page, so og:url stays on the shared URL.
  const bare = path.replace(/\/t\/[A-Za-z0-9_-]{8,128}$/, "") || "/";
  void token;
  const url = new URL(bare || "/", origin);
  if (lang === "es") url.searchParams.set("lang", "es");
  const image = {
    url: previewImage.path,
    width: previewImage.width,
    height: previewImage.height,
    type: previewImage.type,
    alt: lang === "es" ? "Retrato de Laura de Ramos James Law" : "Portrait of Laura from Ramos James Law",
  };
  const href = url.toString();
  return {
    description,
    alternates: { canonical: href },
    openGraph: {
      type: "website",
      siteName: "Ramos James Law | CasePath",
      title,
      description,
      url: href,
      locale: lang === "es" ? "es_US" : "en_US",
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image.url],
    },
  };
}
