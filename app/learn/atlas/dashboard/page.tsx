import type { Metadata } from "next";
import { AtlasStudyDashboard } from "@/components/atlas/AtlasStudyDashboard";

export const metadata: Metadata = {
  title: "Atlas Study Dashboard",
  description: "Resume Living Plant Atlas lessons, review recent misses, track mastery, and choose the next guided learning action.",
};

export default function AtlasStudyDashboardPage() {
  return (
    <section className="shell page-section">
      <AtlasStudyDashboard />
    </section>
  );
}
