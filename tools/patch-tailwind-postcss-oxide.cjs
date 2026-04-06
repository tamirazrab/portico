/**
 * @tailwindcss/postcss nests @tailwindcss/oxide; Turbopack evaluates that copy and
 * traces static requires of .node binaries. Replace nested index.js with a shim that
 * loads tools/tailwind-oxide.cjs (dynamic require). Idempotent.
 */
const fs = require("node:fs");
const path = require("node:path");

const sentinel = "/* patched: turbopack-oxide-shim v2 */";
// Static relative path: Turbopack can rewrite __dirname to a virtual /ROOT; avoid path.join(__dirname, …).
const stub = `${sentinel}
"use strict";
module.exports = require("../../../../../../tools/tailwind-oxide.cjs");
`;

const candidates = [
  path.join(
    __dirname,
    "..",
    "node_modules",
    "@tailwindcss",
    "postcss",
    "node_modules",
    "@tailwindcss",
    "oxide",
    "index.js",
  ),
];

for (const target of candidates) {
  if (!fs.existsSync(target)) {
    continue;
  }
  const prev = fs.readFileSync(target, "utf8");
  if (prev.startsWith(sentinel)) {
    continue;
  }
  fs.writeFileSync(target, stub);
}
