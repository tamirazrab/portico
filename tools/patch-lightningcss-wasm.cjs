/**
 * 1) Bun does not apply overrides inside @tailwindcss/node's nested lightningcss. Copy the hoisted
 *    lightningcss-wasm tree over that folder so Tailwind PostCSS uses WASM (Turbopack-safe on Windows).
 * 2) lightningcss-wasm uses fs.readFileSync(URL) in wasm-node.mjs. Under Turbopack on Windows,
 *    the path must be a string (fileURLToPath). Idempotent; no-op for native lightningcss.
 */
const fs = require("node:fs");
const path = require("node:path");

const rootDir = path.join(__dirname, "..");
const hoistedLightningcss = path.join(rootDir, "node_modules", "lightningcss");
const nestedLightningcss = path.join(
  rootDir,
  "node_modules",
  "@tailwindcss",
  "node",
  "node_modules",
  "lightningcss",
);

function syncNestedTailwindLightningcss() {
  const hoistedPkg = path.join(hoistedLightningcss, "package.json");
  const nestedPkg = path.join(nestedLightningcss, "package.json");
  if (!fs.existsSync(hoistedPkg) || !fs.existsSync(nestedPkg)) {
    return;
  }
  const hoistedMeta = JSON.parse(fs.readFileSync(hoistedPkg, "utf8"));
  if (hoistedMeta.name !== "lightningcss-wasm") {
    return;
  }
  const nestedMeta = JSON.parse(fs.readFileSync(nestedPkg, "utf8"));
  if (nestedMeta.name === "lightningcss-wasm") {
    return;
  }
  fs.rmSync(nestedLightningcss, { recursive: true, force: true });
  fs.cpSync(hoistedLightningcss, nestedLightningcss, { recursive: true });
}

function patchWasmNodeMjs(file) {
  if (!fs.existsSync(file)) {
    return;
  }
  let s = fs.readFileSync(file, "utf8");
  if (s.includes("fileURLToPath(new URL('lightningcss_node.wasm', import.meta.url))")) {
    return;
  }
  if (!s.includes("readFileSync(new URL('lightningcss_node.wasm', import.meta.url))")) {
    return;
  }
  if (!s.includes("import { fileURLToPath }")) {
    const withImport = s.replace(
      /^(import fs from ['"]fs['"];)\r?$/m,
      "$1\nimport { fileURLToPath } from 'node:url';",
    );
    if (withImport === s) {
      return;
    }
    s = withImport;
  }
  const withRead = s.replace(
    "let wasmBytes = fs.readFileSync(new URL('lightningcss_node.wasm', import.meta.url));",
    `let wasmBytes = fs.readFileSync(\n  fileURLToPath(new URL('lightningcss_node.wasm', import.meta.url)),\n);`,
  );
  if (withRead !== s) {
    fs.writeFileSync(file, withRead);
  }
}

syncNestedTailwindLightningcss();

patchWasmNodeMjs(path.join(hoistedLightningcss, "wasm-node.mjs"));
patchWasmNodeMjs(path.join(nestedLightningcss, "wasm-node.mjs"));
