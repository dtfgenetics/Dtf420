import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://dtfseeds.com"),
  title: {
    default: "DTF420",
    template: "%s | DTF420",
  },
  description: "DTF420 games, cultivation education, tools, and community.",
  openGraph: {
    type: "website",
    siteName: "DTF420",
    title: "DTF420",
    description: "Cultivation education, interactive learning, tools, games, and community.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main className="site-main">{children}</main>
      </body>
    </html>
  );
}
