/**
 * Next.js Turbopack evaluates @tailwindcss/node with a virtual import.meta.url
 * ([project]/...), so createRequire(import.meta.url).resolve(".../esm-cache-loader")
 * returns a bogus path. Only register the ESM cache loader when import.meta.url is a
 * real file: URL; swallow errors. Idempotent.
 */
const fs = require("node:fs");
const path = require("node:path");

const root = path.join(__dirname, "..", "node_modules", "@tailwindcss", "node", "dist");

const mjsPath = path.join(root, "index.mjs");
const mjsOld =
  "if(!process.versions.bun){let e=ce.createRequire(import.meta.url);ce.register?.(Xr(e.resolve(\"@tailwindcss/node/esm-cache-loader\")))}";
const mjsNew =
  "if(!process.versions.bun){try{if(typeof import.meta.url===\"string\"&&import.meta.url.startsWith(\"file:\")){let e=ce.createRequire(import.meta.url);ce.register?.(Xr(e.resolve(\"@tailwindcss/node/esm-cache-loader\")))}}catch{}}";

const jsPath = path.join(root, "index.js");
const jsOld =
  "process.versions.bun||_t.register?.((0,It.pathToFileURL)(require.resolve(\"@tailwindcss/node/esm-cache-loader\")));0&&(module.exports=";
const jsNew =
  "process.versions.bun||(function(){try{_t.register?.((0,It.pathToFileURL)(require.resolve(\"@tailwindcss/node/esm-cache-loader\")))}catch{}})();0&&(module.exports=";

function patchFile(file, oldStr, newStr) {
  if (!fs.existsSync(file)) {
    return false;
  }
  let s = fs.readFileSync(file, "utf8");
  if (s.includes(newStr)) {
    return false;
  }
  if (!s.includes(oldStr)) {
    return false;
  }
  s = s.replace(oldStr, newStr);
  fs.writeFileSync(file, s);
  return true;
}

patchFile(mjsPath, mjsOld, mjsNew);
patchFile(jsPath, jsOld, jsNew);
