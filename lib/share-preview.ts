import { getStage, getVideo } from "@/lib/content";
import { previewImageUrl, stagePreviewTitle } from "@/lib/preview";
import { publicSiteUrl } from "@/lib/public-site";
import type { Lang } from "@/lib/types";
import { text } from "@/lib/lang";

function escapeAttr(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function oneLine(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

/** Title and description for the SMS card, based on the CasePath page behind the token. */
export async function sharePreviewCopy(path: string, lang: Lang) {
  if (path.startsWith("/v/")) {
    const video = await getVideo(path.slice(3));
    if (video) {
      return {
        title: oneLine(text(lang, video.titleEn, video.titleEs)),
        description: oneLine(text(lang, video.introEn, video.introEs)),
      };
    }
  }
  if (path.startsWith("/s/")) {
    const stage = await getStage(path.slice(3));
    if (stage) {
      const pageTitle = text(lang, stage.headerEn, stage.headerEs) || text(lang, stage.labelEn, stage.labelEs);
      return {
        title: oneLine(stagePreviewTitle(stage.id, lang, pageTitle)),
        description: oneLine(text(lang, stage.introEn, stage.introEs)),
      };
    }
  }
  return {
    title: "CasePath | Ramos James Law",
    description:
      lang === "es" ? "Una guía clara del proceso de un caso por lesiones." : "A clear guide to the injury case process.",
  };
}

/** Initial HTML for /r/TOKEN — OG tags must be here, not added by JavaScript. */
export function sharePreviewHtml(input: {
  token: string;
  title: string;
  description: string;
  destination: string;
  lang: Lang;
}) {
  const shareUrl = `${publicSiteUrl}/r/${input.token}`;
  const image = previewImageUrl();
  const title = oneLine(input.title) || "CasePath | Ramos James Law";
  const description =
    oneLine(input.description) ||
    (input.lang === "es" ? "Una guía clara del proceso de un caso por lesiones." : "A clear guide to the injury case process.");
  const continueLabel = input.lang === "es" ? "Continuar" : "Continue";

  return `<!DOCTYPE html>
<html lang="${input.lang === "es" ? "es" : "en"}">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeAttr(description)}"/>
  <meta property="og:type" content="website"/>
  <meta property="og:site_name" content="Ramos James Law | CasePath"/>
  <meta property="og:title" content="${escapeAttr(title)}"/>
  <meta property="og:description" content="${escapeAttr(description)}"/>
  <meta property="og:image" content="${escapeAttr(image)}"/>
  <meta property="og:url" content="${escapeAttr(shareUrl)}"/>
  <meta property="og:locale" content="${input.lang === "es" ? "es_US" : "en_US"}"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${escapeAttr(title)}"/>
  <meta name="twitter:description" content="${escapeAttr(description)}"/>
  <meta name="twitter:image" content="${escapeAttr(image)}"/>
  <meta http-equiv="refresh" content="0;url=${escapeAttr(input.destination)}"/>
  <script>location.replace(${JSON.stringify(input.destination)});</script>
</head>
<body>
  <p><a href="${escapeAttr(input.destination)}">${escapeHtml(continueLabel)}</a></p>
</body>
</html>`;
}
