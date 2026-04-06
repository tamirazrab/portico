import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "node",
    setupFiles: "src/test/setup.ts",
    include: ["src/test/unit/**/*.test.ts"],
    exclude: ["node_modules", "src/test/e2e"],
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      exclude: [
        "node_modules/",
        "src/test/",
        "**/*.test.ts",
        "**/*.spec.ts",
        "**/*.config.ts",
        "**/setup.ts",
        "**/*.d.ts",
        "src/generated/",
        "src/bootstrap/i18n/",
      ],
      thresholds: {
        lines: 90,
        functions: 90,
        branches: 90,
        statements: 90,
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "server-only": path.resolve(
        __dirname,
        "./src/test/shims/server-only-stub.ts",
      ),
    },
  },
});
