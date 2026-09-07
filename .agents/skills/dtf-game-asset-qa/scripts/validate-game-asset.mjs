#!/usr/bin/env node

import fs from "node:fs";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
const value = (flag) => {
  const index = args.indexOf(flag);
  return index >= 0 ? args[index + 1] : null;
};
const has = (flag) => args.includes(flag);
const fail = (message) => {
  console.error(`Game asset QA failed: ${message}`);
  process.exit(1);
};

const asset = value("--asset");
if (!asset) fail("--asset is required");
if (!fs.existsSync(asset)) fail(`missing asset ${asset}`);

const identify = spawnSync("identify", ["-format", "%m|%w|%h|%[channels]", asset], { encoding: "utf8" });
if (identify.status !== 0) fail(`ImageMagick could not inspect ${asset}: ${identify.stderr.trim()}`);

const [format, widthText, heightText, channels = ""] = identify.stdout.trim().split("|");
const width = Number(widthText);
const height = Number(heightText);
if (!format || !Number.isInteger(width) || !Number.isInteger(height)) fail(`invalid image metadata for ${asset}`);
if (has("--alpha") && !channels.toLowerCase().includes("a")) fail(`${asset} requires real alpha; channels are ${channels}`);

const cols = Number(value("--cols") || 1);
const rows = Number(value("--rows") || 1);
if (!Number.isInteger(cols) || cols < 1 || !Number.isInteger(rows) || rows < 1) fail("--cols and --rows must be positive integers");
if (width % cols !== 0 || height % rows !== 0) fail(`${width}x${height} does not divide evenly into a ${cols}x${rows} atlas`);

const maxBytes = Number(value("--max-bytes") || 0);
const bytes = fs.statSync(asset).size;
if (maxBytes && bytes > maxBytes) fail(`${asset} is ${bytes} bytes; limit is ${maxBytes}`);

const runtime = value("--runtime");
if (runtime) {
  if (!fs.existsSync(runtime)) fail(`missing runtime ${runtime}`);
  const publicIndex = asset.replaceAll("\\", "/").indexOf("public/");
  const publicPath = publicIndex >= 0 ? `/${asset.replaceAll("\\", "/").slice(publicIndex + 7)}` : asset.replaceAll("\\", "/");
  if (!fs.readFileSync(runtime, "utf8").includes(publicPath)) fail(`${runtime} does not reference ${publicPath}`);
}

console.log(`Game asset QA passed: ${asset} · ${format} · ${width}x${height} · ${channels} · ${bytes} bytes · ${cols}x${rows}`);

