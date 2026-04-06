import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import storybook from "eslint-plugin-storybook";

const sharedSettings = {
  react: { version: "detect" },
  "import/resolver": {
    alias: {
      map: [["~", "./src"]],
      extensions: [".js", ".ts", ".tsx", ".d.ts", ".test.ts", ".json"],
    },
  },
};

const sharedRules = {
  "react-hooks/set-state-in-effect": "off",
  "react-hooks/purity": "off",
  "react/no-unescaped-entities": "warn",
  "react/display-name": "warn",
  "no-use-before-define": "off",
  "class-methods-use-this": "off",
  "import/prefer-default-export": "off",
  "import/no-cycle": "off",
  "no-promise-executor-return": "off",
  "@typescript-eslint/no-shadow": "off",
  "react/require-default-props": "off",
  "no-restricted-imports": [
    "error",
    {
      paths: [
        {
          name: "@/app/components/ui",
          message:
            "Use @/components/ui instead. UI components should be in components directory.",
        },
      ],
      patterns: [
        {
          group: ["@/app/**"],
          message:
            "Feature layer cannot import from app layer. Use @/components, @/lib, or @/server instead.",
          allowTypeImports: true,
        },
      ],
    },
  ],
  "import/order": [
    "error",
    {
      pathGroups: [{ pattern: "@/**", group: "external" }],
    },
  ],
  "no-shadow": "off",
  "import/extensions": [
    "error",
    "ignorePackages",
    { js: "never", jsx: "never", ts: "never", tsx: "never" },
  ],
  "react/jsx-filename-extension": [
    1,
    { extensions: [".ts", ".tsx"] },
  ],
  "import/no-extraneous-dependencies": [
    "error",
    { devDependencies: true },
  ],
};

export default [
  {
    ignores: [
      "**/.next/**",
      "**/node_modules/**",
      "**/.bun/**",
      "**/.bun-cache-local/**",
      "**/dist/**",
      "**/coverage/**",
      "**/storybook-static/**",
      "**/playwright-report/**",
      "**/test-results/**",
      "tailwind.config.ts",
    ],
  },
  ...nextCoreWebVitals,
  ...nextTypescript,
  ...storybook.configs["flat/recommended"],
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs}"],
    plugins: {
      import: importPlugin,
      react: reactPlugin,
    },
    settings: sharedSettings,
    rules: sharedRules,
  },
  {
    files: ["src/bootstrap/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/app/components/ui",
              message:
                "Use @/components/ui instead. UI components should be in components directory.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/app/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/app/components/ui",
              message:
                "Use @/components/ui instead. UI components should be in components directory.",
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/**/*-vm.ts", "src/**/*.vm.ts"],
    rules: { "react-hooks/rules-of-hooks": "off" },
  },
  {
    files: [
      "src/test/**/*.{ts,tsx}",
      "src/**/*.test.ts",
      "src/**/*.test.tsx",
    ],
    rules: {
      "no-restricted-imports": "off",
      "import/extensions": "off",
      "@typescript-eslint/no-extraneous-class": "off",
    },
  },
  {
    files: ["tools/**/*.cjs", "**/patch-*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
      "import/no-extraneous-dependencies": "off",
    },
  },
  {
    files: ["src/app/**/*.stories.tsx"],
    rules: { "react/jsx-props-no-spreading": "off" },
  },
  {
    files: ["src/feature/**/*"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/app/**"],
              message:
                "Feature layer cannot import from app layer. Use @/components, @/lib, or @/server instead.",
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  },
  {
    files: ["src/components/**/*"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/feature/**", "@/app/**"],
              message:
                "Components should be pure UI. Do not import from feature or app layers.",
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  },
  {
    files: [
      "eslint.config.mjs",
      "vite.config.ts",
      "next.config.ts",
      "postcss.config.*",
      "playwright.config.*",
    ],
    rules: {
      "import/no-extraneous-dependencies": "off",
      "import/no-anonymous-default-export": "off",
    },
  },
  {
    files: [".storybook/**/*.{ts,tsx,js,jsx,mjs,cjs}"],
    rules: {
      "import/no-extraneous-dependencies": "off",
      "import/order": "off",
      "import/extensions": "off",
    },
  },
  {
    files: [
      "src/feature/core/execution/infrastructure/executor/ui/**/*.tsx",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: [
                "@/feature/core/execution/infrastructure/executor/runtime/**",
              ],
              message:
                "Executor UI (React) must not import executor runtime directly. Use a colocated server-action bridge (e.g. croner.ts) or application services.",
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  },
];
