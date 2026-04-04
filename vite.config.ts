import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite-plus";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
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
  lint: {
    ignorePatterns: [
      "**/.next/**",
      "**/node_modules/**",
      "**/dist/**",
      "**/storybook-static/**",
      "**/coverage/**",
      "**/playwright-report/**",
      "**/test-results/**",
      "src/generated/**",
      "src/test/**",
    ],
    options: {
      // Project uses path aliases in tests; full type-check belongs to `tsc`/IDE.
      typeAware: false,
      typeCheck: false,
    },
    plugins: ["typescript", "react", "nextjs", "import"],
    settings: {
      react: {
        version: "19.2.0",
      },
    },
    rules: {
      // Next.js / React directive pattern is intentional.
      "no-unused-expressions": "off",
    },
    overrides: [
      {
        files: ["src/**/*-vm.ts"],
        rules: {
          "react-hooks/rules-of-hooks": "off",
        },
      },
    ],
  },
  fmt: {
    printWidth: 80,
    tabWidth: 2,
    useTabs: false,
    semi: true,
    singleQuote: false,
    jsxSingleQuote: false,
    trailingComma: "all",
    bracketSpacing: true,
    arrowParens: "always",
    quoteProps: "as-needed",
    ignorePatterns: [
      "**/.next/**",
      "**/node_modules/**",
      "**/coverage/**",
      "**/playwright-report/**",
      "**/test-results/**",
      "src/generated/**",
    ],
  },
});
