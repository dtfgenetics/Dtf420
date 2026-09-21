import path from "node:path";
import { parseCsvRows, normalizeHeader } from "./lib/csv-stream.mjs";

const [, , inputArg, sampleArg = "3"] = process.argv;
if (!inputArg) {
  console.error("Usage: node scripts/terpenes/inspect-coconut-csv.mjs <input.csv> [sampleRows]");
  process.exit(1);
}

const sampleRows = Math.max(0, Number.parseInt(sampleArg, 10) || 0);
const rows = parseCsvRows(path.resolve(inputArg));
const headerResult = await rows.next();
if (headerResult.done) throw new Error("CSV is empty");

const headers = headerResult.value;
console.log(JSON.stringify({
  columnCount: headers.length,
  headers,
  normalizedHeaders: headers.map(normalizeHeader),
}, null, 2));

let sampled = 0;
for await (const row of rows) {
  console.log(JSON.stringify(Object.fromEntries(headers.map((header, index) => [header, row[index] ?? null])), null, 2));
  sampled += 1;
  if (sampled >= sampleRows) break;
}
