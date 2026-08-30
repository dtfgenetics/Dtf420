import type { Metadata } from "next";
import type { ReactNode } from "react";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://dtfseeds.com"),
  title: {
    default: "DTF Genetics — Dream the Future",
    template: "%s | DTF Genetics",
  },
  description:
    "DTF Genetics combines original cannabis genetics, Teaching Healthy Cultivation plant-science education, grow tools, browser games, and community resources.",
  applicationName: "DTF Genetics",
  openGraph: {
    type: "website",
    siteName: "DTF Genetics",
    title: "DTF Genetics — Dream the Future",
    description:
      "Original genetics, evidence-based cultivation education, grow tools, games, and community resources.",
    url: "https://dtfseeds.com",
  },
  twitter: {
    card: "summary_large_image",
    title: "DTF Genetics — Dream the Future",
    description:
      "Original genetics, evidence-based cultivation education, grow tools, games, and community resources.",
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
        <SiteFooter />
      </body>
    </html>
  );
}
