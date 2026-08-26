import type { Metadata } from "next";
import { AtlasSearch } from "@/components/atlas/AtlasSearch";

export const metadata: Metadata = {
  title: "Search Living Plant Atlas",
  description: "Search Living Plant Atlas lessons, guided paths, diagnostic cases, and learner tools from one place.",
};

export default function AtlasSearchPage() {
  return (
    <main className="shell page-section">
      <AtlasSearch />
    </main>
  );
}
