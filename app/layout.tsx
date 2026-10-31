import type { Metadata, Viewport } from "next";
import { getLang } from "@/lib/lang";
import { siteOrigin } from "@/lib/origin";
import { previewMeta } from "@/lib/preview";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const [lang, origin] = await Promise.all([getLang(), siteOrigin()]);
  const title = "CasePath | Ramos James Law";
  const description =
    lang === "es" ? "Una guía clara del proceso de un caso por lesiones." : "A clear guide to the injury case process.";
  return {
    metadataBase: new URL(origin),
    title: { default: title, template: "%s | CasePath" },
    description,
    robots: { index: false, follow: false },
    ...previewMeta({ lang, title, description, path: "/", origin }),
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#02234D",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang}>
      <body>{children}</body>
    </html>
  );
}
