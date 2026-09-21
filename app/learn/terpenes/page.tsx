import type { Metadata } from "next";
import { TerpeneAtlasExplorer } from "@/components/terpenes/TerpeneAtlasExplorer";
import { buildEducationMetadata } from "@/lib/education-seo";

export const metadata: Metadata = buildEducationMetadata({
  title: "THC Terpene Atlas",
  description:
    "Explore terpene chemistry, aroma, biosynthesis, cannabis occurrence, genetics, cultivar context, and evidence through the interactive THC Terpene Atlas.",
  path: "/learn/terpenes",
});

export default function TerpeneAtlasPage() {
  return <TerpeneAtlasExplorer />;
}
