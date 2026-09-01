import Link from "next/link";

export const metadata = {
  title: "PhenoQuest: The Living Seed Vault | DTF Games",
  description: "Explore Seedling Town and the Terp Fields, archive original Phenos, confront Team Lockout, and complete the first Garden Trial.",
  alternates: {
    canonical: "/games/phenoquest",
  },
};

export default function PhenoQuestPage() {
  return (
    <section className="shell page-section">
      <div className="game-page-heading">
        <div>
          <p className="eyebrow">DTF Games · 3D exploration RPG · Development preview</p>
          <h1>PhenoQuest: The Living Seed Vault</h1>
          <p className="lede">
            Choose a starter Pheno, explore Seedling Town and the Terp Fields, stabilize living genetic samples through Resolve Trials, build your PhenoLog, confront Team Lockout, and open the first Garden Trial.
          </p>
        </div>
        <Link className="button" href="/games">All games</Link>
      </div>

      <div
        style={{
          overflow: "hidden",
          borderRadius: "24px",
          border: "1px solid rgba(86, 142, 94, 0.45)",
          background: "#071108",
          boxShadow: "0 24px 70px rgba(0, 0, 0, 0.28)",
        }}
      >
        <iframe
          title="PhenoQuest 3D game preview"
          src="/phenoquest/index.html"
          style={{
            display: "block",
            width: "100%",
            height: "clamp(620px, 76vw, 900px)",
            border: 0,
            background: "#071108",
          }}
          loading="eager"
          allowFullScreen
        />
      </div>
    </section>
  );
}
