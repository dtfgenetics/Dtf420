import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "dtf420-web",
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
