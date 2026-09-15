import { ImageResponse } from "next/og";

export const dynamic = "force-static";

export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#07150d",
          borderRadius: 96,
          overflow: "hidden",
        }}
      >
        <svg
          width="390"
          height="320"
          viewBox="0 0 512 360"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <g fill="#55d66b" stroke="#d9ffe0" strokeWidth="8" strokeLinejoin="round">
            <path d="M256 24c-28 54-42 100-42 139 0 33 15 57 42 74 27-17 42-41 42-74 0-39-14-85-42-139z" />
            <path d="M197 69c-11 63-4 109 21 139 18 22 40 31 65 27-1-25-10-46-28-68-25-30-44-62-58-98z" transform="rotate(-24 256 226)" />
            <path d="M315 69c11 63 4 109-21 139-18 22-40 31-65 27 1-25 10-46 28-68 25-30 44-62 58-98z" transform="rotate(24 256 226)" />
            <path d="M145 131c8 56 28 95 60 118 22 16 46 20 70 10-7-23-21-42-43-58-31-22-60-45-87-70z" transform="rotate(-18 224 226)" />
            <path d="M367 131c-8 56-28 95-60 118-22 16-46 20-70 10 7-23 21-42 43-58 31-22 60-45 87-70z" transform="rotate(18 288 226)" />
            <path d="M116 199c24 42 53 70 86 83 23 9 45 8 66-4-11-18-28-32-51-41-32-12-66-25-101-38z" />
            <path d="M396 199c-24 42-53 70-86 83-23 9-45 8-66-4 11-18 28-32 51-41 32-12 66-25 101-38z" />
          </g>
          <path d="M256 225v100" stroke="#d9ffe0" strokeWidth="18" strokeLinecap="round" />
        </svg>
        <div
          style={{
            display: "flex",
            marginTop: -22,
            color: "#ffffff",
            fontSize: 104,
            fontWeight: 900,
            letterSpacing: 6,
            lineHeight: 1,
          }}
        >
          THC
        </div>
      </div>
    ),
    {
      width: 512,
      height: 512,
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=604800, stale-while-revalidate=86400",
      },
    },
  );
}
