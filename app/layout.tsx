import type { Metadata, Viewport } from "next";
import { getLang } from "@/lib/lang";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "CasePath | Ramos James Law", template: "%s | CasePath" },
  description: "A clear guide to the injury case process.",
  robots: { index: false, follow: false },
};

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
