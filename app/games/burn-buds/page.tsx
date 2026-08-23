import type { Metadata } from "next";
import { BurnBudsLoader } from "@/components/game/BurnBudsLoader";

export const metadata: Metadata = {
  title: "Burn Buds",
  description: "Burn Buds engine validation build on the DTF420 game platform.",
};

export default function BurnBudsPage() {
  return (
    <section className="shell page-section">
      <div className="game-page-heading">
        <div>
          <p className="eyebrow">DTF Game Core · validation build</p>
          <h1>Burn Buds</h1>
          <p className="lede">
            This is deliberately a small engine test. If the grid renders, resizes, and cleans up correctly, the Phaser/Next foundation is working before multiplayer and full gameplay are added.
          </p>
        </div>
        <span className="status-pill">Foundation v0.1</span>
      </div>

      <BurnBudsLoader />
    </section>
  );
}
