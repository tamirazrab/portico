"use strict";

/**
 * Turbopack statically traces `require()` in `@tailwindcss/oxide/index.js` and chokes on
 * optional `.node` binaries. This shim loads the platform package at runtime.
 *
 * Uses `process.getBuiltinModule` so this file still works when Turbopack evaluates it
 * in an ESM-ish context where top-level `require` is undefined.
 */
const pathMod =
  typeof process.getBuiltinModule === "function"
    ? process.getBuiltinModule("node:path")
    : require("node:path");
const anchor = pathMod.join(process.cwd(), "tools", "tailwind-oxide.cjs");
const req =
  typeof process.getBuiltinModule === "function"
    ? process.getBuiltinModule("node:module").createRequire(anchor)
    : require("node:module").createRequire(anchor);

function tryPkgs(names) {
  let last;
  for (const n of names) {
    try {
      return req(n);
    } catch (e) {
      last = e;
    }
  }
  throw last;
}

function binding() {
  const { platform, arch } = process;

  if (platform === "win32") {
    if (arch === "x64") return tryPkgs(["@tailwindcss/oxide-win32-x64-msvc"]);
    if (arch === "arm64") return tryPkgs(["@tailwindcss/oxide-win32-arm64-msvc"]);
    if (arch === "ia32") return tryPkgs(["@tailwindcss/oxide-win32-ia32-msvc"]);
  }

  if (platform === "darwin") {
    if (arch === "arm64") return tryPkgs(["@tailwindcss/oxide-darwin-arm64"]);
    if (arch === "x64") return tryPkgs(["@tailwindcss/oxide-darwin-x64"]);
  }

  if (platform === "linux") {
    if (arch === "x64") {
      return tryPkgs([
        "@tailwindcss/oxide-linux-x64-gnu",
        "@tailwindcss/oxide-linux-x64-musl",
      ]);
    }
    if (arch === "arm64") {
      return tryPkgs([
        "@tailwindcss/oxide-linux-arm64-gnu",
        "@tailwindcss/oxide-linux-arm64-musl",
      ]);
    }
  }

  throw new Error(
    `Unsupported platform for Tailwind Oxide (turbopack shim): ${platform}-${arch}`,
  );
}

const nativeBinding = binding();

module.exports = nativeBinding;
module.exports.Scanner = nativeBinding.Scanner;
