"use client";

import dynamic from "next/dynamic";

const BurnBudsGame = dynamic(
  () => import("@/components/game/BurnBudsGame").then((module) => module.BurnBudsGame),
  {
    ssr: false,
    loading: () => (
      <div className="game-shell game-shell--loading" role="status">Loading game engine…</div>
    ),
  },
);

export function BurnBudsLoader() {
  return <BurnBudsGame />;
}
