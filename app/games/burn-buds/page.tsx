import type { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Burn Buds | DTF Games",
  description: "Burn Buds two-player hidden-fleet strategy game.",
  alternates: {
    canonical: "/games/protect-the-plants/",
  },
  robots: {
    index: false,
    follow: true,
  },
};

export default function BurnBudsPage() {
  redirect("/games/protect-the-plants/");
}
