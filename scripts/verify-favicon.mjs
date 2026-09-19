import { existsSync, readFileSync } from "node:fs";

const failures = [];
const requireText = (path, needles) => {
  if (!existsSync(path)) {
    failures.push(`Missing required favicon file: ${path}`);
    return;
  }

  const source = readFileSync(path, "utf8");
  for (const needle of needles) {
    if (!source.includes(needle)) {
      failures.push(`${path} is missing required favicon marker: ${needle}`);
    }
  }
};

if (existsSync("app/icon.svg")) {
  failures.push(
    "app/icon.svg must stay removed: Google Search does not list SVG as a supported search-result favicon format.",
  );
}

requireText("app/favicon/route.tsx", [
  'from "next/og"',
  "ImageResponse",
  "width: 512",
  "height: 512",
]);

requireText("app/layout.tsx", [
  'manifest: "/manifest.webmanifest"',
  'url: "/favicon"',
  'type: "image/png"',
  'sizes: "512x512"',
]);

requireText("app/manifest.ts", [
  'src: "/favicon"',
  'sizes: "512x512"',
  'type: "image/png"',
]);

requireText("next.config.ts", [
  'source: "/favicon.ico"',
  'destination: "/favicon"',
]);

requireText("deployment/static-overlay.json", [
  '"favicon"',
]);

if (failures.length > 0) {
  console.error("Favicon verification failed:\n");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log("Favicon verification passed: PNG search icon, manifest metadata, legacy fallback, and static-overlay packaging are present.");
