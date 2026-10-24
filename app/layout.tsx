import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CasePath",
  description: "Open the link from your Ramos James Law text message.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
