/**
 * lightningcss-wasm uses fs.readFileSync(URL) in wasm-node.mjs. Under Turbopack on Windows,
 * the path must be a string (fileURLToPath). Idempotent; no-op for native lightningcss.
 */
const fs = require("node:fs");
const path = require("node:path");

const file = path.join(__dirname, "..", "node_modules", "lightningcss", "wasm-node.mjs");
if (!fs.existsSync(file)) {
  process.exit(0);
}
let s = fs.readFileSync(file, "utf8");
if (s.includes("fileURLToPath(new URL('lightningcss_node.wasm', import.meta.url))")) {
  process.exit(0);
}
if (!s.includes("readFileSync(new URL('lightningcss_node.wasm', import.meta.url))")) {
  process.exit(0);
}
if (!s.includes("import { fileURLToPath }")) {
  const withImport = s.replace(
    /^(import fs from ['"]fs['"];)\r?$/m,
    "$1\nimport { fileURLToPath } from 'node:url';",
  );
  if (withImport === s) {
    process.exit(0);
  }
  s = withImport;
}
const withRead = s.replace(
  "let wasmBytes = fs.readFileSync(new URL('lightningcss_node.wasm', import.meta.url));",
  `let wasmBytes = fs.readFileSync(\n  fileURLToPath(new URL('lightningcss_node.wasm', import.meta.url)),\n);`,
);
if (withRead === s) {
  process.exit(0);
}
fs.writeFileSync(file, withRead);
