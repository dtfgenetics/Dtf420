import type { ReactNode } from "react";
import { AtlasSectionNav } from "@/components/atlas/AtlasSectionNav";

export default function AtlasLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <AtlasSectionNav />
      {children}
    </>
  );
}
