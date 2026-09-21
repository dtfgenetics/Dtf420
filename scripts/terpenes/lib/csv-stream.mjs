import fs from "node:fs";

export async function* parseCsvRows(filePath) {
  const stream = fs.createReadStream(filePath, { encoding: "utf8" });
  let row = [];
  let field = "";
  let quoted = false;
  let pendingQuote = false;

  for await (const chunk of stream) {
    for (let i = 0; i < chunk.length; i += 1) {
      const char = chunk[i];

      if (quoted) {
        if (pendingQuote) {
          if (char === '"') {
            field += '"';
            pendingQuote = false;
            continue;
          }
          quoted = false;
          pendingQuote = false;
        } else if (char === '"') {
          pendingQuote = true;
          continue;
        } else {
          field += char;
          continue;
        }
      }

      if (char === '"') {
        if (field.length === 0) quoted = true;
        else field += char;
      } else if (char === ",") {
        row.push(field);
        field = "";
      } else if (char === "\n") {
        row.push(field.replace(/\r$/, ""));
        field = "";
        yield row;
        row = [];
      } else {
        field += char;
      }
    }
  }

  if (pendingQuote) {
    quoted = false;
    pendingQuote = false;
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    yield row;
  }
}

export function normalizeHeader(value) {
  return String(value ?? "")
    .replace(/^\uFEFF/, "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

export function headerIndex(headers) {
  return new Map(headers.map((header, index) => [normalizeHeader(header), index]));
}

export function valueFor(row, indexes, aliases) {
  for (const alias of aliases) {
    const index = indexes.get(normalizeHeader(alias));
    if (index !== undefined) {
      const value = row[index];
      if (value !== undefined && String(value).trim() !== "") return String(value).trim();
    }
  }
  return null;
}
