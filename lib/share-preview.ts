import { getStage, getVideo } from "@/lib/content";
import { previewImage, previewImageUrl, stagePreviewTitle } from "@/lib/preview";
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

/**
 * Real HTML for /r/TOKEN.
 * Phones read these OG tags from the first response for the exact share URL.
 * No meta-refresh and no Set-Cookie here — both make many SMS preview crawlers skip the card.
 */
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
  const continueLabel = input.lang === "es" ? "Abrir CasePath" : "Open CasePath";
  const firm = "Ramos James Law | CasePath";
  const hint =
    input.lang === "es"
      ? "Una guía clara del proceso de su caso."
      : "A clear guide to your case process.";

  return `<!DOCTYPE html>
<html lang="${input.lang === "es" ? "es" : "en"}">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/>
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeAttr(description)}"/>
  <link rel="icon" href="/favicon.ico"/>
  <link rel="apple-touch-icon" href="/favicon.ico"/>
  <meta property="og:type" content="website"/>
  <meta property="og:site_name" content="${escapeAttr(firm)}"/>
  <meta property="og:title" content="${escapeAttr(title)}"/>
  <meta property="og:description" content="${escapeAttr(description)}"/>
  <meta property="og:image" content="${escapeAttr(image)}"/>
  <meta property="og:image:secure_url" content="${escapeAttr(image)}"/>
  <meta property="og:image:type" content="${escapeAttr(previewImage.type)}"/>
  <meta property="og:image:width" content="${previewImage.width}"/>
  <meta property="og:image:height" content="${previewImage.height}"/>
  <meta property="og:url" content="${escapeAttr(shareUrl)}"/>
  <meta property="og:locale" content="${input.lang === "es" ? "es_US" : "en_US"}"/>
  <meta name="twitter:card" content="summary_large_image"/>
  <meta name="twitter:title" content="${escapeAttr(title)}"/>
  <meta name="twitter:description" content="${escapeAttr(description)}"/>
  <meta name="twitter:image" content="${escapeAttr(image)}"/>
  <style>
    :root { color-scheme: light; }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      min-height: 100vh;
      font-family: Georgia, "Times New Roman", serif;
      background: linear-gradient(165deg, #02234d 0%, #0a3a6e 48%, #145a8a 100%);
      color: #10203f;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
    }
    main {
      width: min(440px, 100%);
      background: #fff;
      border-radius: 18px;
      overflow: hidden;
      box-shadow: 0 18px 50px rgba(2, 35, 77, 0.28);
    }
    img.hero {
      display: block;
      width: 100%;
      height: auto;
      aspect-ratio: ${previewImage.width} / ${previewImage.height};
      object-fit: cover;
      background: #0a3a6e;
    }
    .copy { padding: 22px 22px 26px; }
    .eyebrow {
      margin: 0 0 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 12px;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: #5b6a86;
    }
    h1 {
      margin: 0 0 10px;
      font-size: 28px;
      line-height: 1.15;
      color: #02234d;
    }
    p {
      margin: 0 0 18px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 15px;
      line-height: 1.45;
      color: #3d4d66;
    }
    a.cta {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 48px;
      padding: 0 22px;
      border-radius: 999px;
      background: #fb2489;
      color: #fff;
      text-decoration: none;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 16px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <main>
    <img class="hero" src="${escapeAttr(image)}" width="${previewImage.width}" height="${previewImage.height}" alt=""/>
    <div class="copy">
      <p class="eyebrow">${escapeHtml(firm)}</p>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(hint)}</p>
      <a class="cta" href="${escapeAttr(input.destination)}">${escapeHtml(continueLabel)}</a>
    </div>
  </main>
  <script>
    setTimeout(function () {
      window.location.replace(${JSON.stringify(input.destination)});
    }, 1200);
  </script>
</body>
</html>`;
}
