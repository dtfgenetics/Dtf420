#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const value = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : null;
};
const fail = (message) => {
  console.error(`Green-screen atlas preparation failed: ${message}`);
  process.exit(1);
};

const input = value("--input");
const output = value("--output");
const width = Number(value("--width"));
const height = Number(value("--height"));
const cols = Number(value("--cols"));
const rows = Number(value("--rows"));
const maxBytes = Number(value("--max-bytes") || 0);

if (!input || !output) fail("--input and --output are required");
if (!fs.existsSync(input)) fail(`missing input ${input}`);
if (fs.existsSync(output) && !args.includes("--force")) fail(`${output} already exists; pass --force only after confirming replacement intent`);
for (const [label, number] of [["width", width], ["height", height], ["cols", cols], ["rows", rows]]) {
  if (!Number.isInteger(number) || number < 1) fail(`--${label} must be a positive integer`);
}
if (width % cols !== 0 || height % rows !== 0) fail(`${width}x${height} does not divide evenly into ${cols}x${rows}`);

fs.mkdirSync(path.dirname(output), { recursive: true });
const converted = spawnSync("convert", [
  input,
  "-alpha", "on",
  "-channel", "A",
  "-fx", "(g>r*1.10&&g>b*1.10)?0:a",
  "+channel",
  "-background", "none",
  "-gravity", "center",
  "-resize", `${width}x${height}!`,
  "-quality", "90",
  output,
], { encoding: "utf8" });
if (converted.status !== 0) fail(converted.stderr.trim() || "ImageMagick conversion failed");

const validator = new URL("./validate-game-asset.mjs", import.meta.url);
const validationArgs = [validator.pathname, "--asset", output, "--alpha", "--cols", String(cols), "--rows", String(rows)];
if (maxBytes) validationArgs.push("--max-bytes", String(maxBytes));
const validated = spawnSync(process.execPath, validationArgs, { encoding: "utf8" });
if (validated.status !== 0) fail(validated.stderr.trim() || validated.stdout.trim());

console.log(validated.stdout.trim());
console.log(`Prepared ${output}. Visual edge inspection is still required before integration.`);
