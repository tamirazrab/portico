/**
 * ESLint rule to enforce architectural boundaries.
 * Prevents cross-layer imports that violate clean architecture.
 */

module.exports = {
  rules: {
    "no-restricted-imports": [
      "error",
      {
        // Feature layer should not import from app layer
        patterns: [
          {
            group: ["@/app/**"],
            message:
              "Feature layer cannot import from app layer. Use components, lib, or server instead.",
            allowTypeImports: true,
          },
        ],
      },
    ],
  },
  overrides: [
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
      files: ["src/app/**/*"],
      rules: {
        "no-restricted-imports": [
          "error",
          {
            patterns: [
              {
                group: ["@/feature/**/data/**", "@/feature/**/domain/**"],
                message:
                  "App layer should not directly import feature data/domain layers. Use controllers in @/server instead.",
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
  ],
};

