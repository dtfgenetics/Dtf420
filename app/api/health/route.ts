import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-static";

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "dtfseeds-web",
      canonicalOrigin: "https://dtfseeds.com",
      runtime: "nodejs",
      node: process.version,
      environment: process.env.NODE_ENV ?? "unknown",
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
