import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "next-env.d.ts",
      "public/sw.js",
      "node_modules/**",
      ".env.local",
      ".env.*.local",
    ],
  },
  ...nextVitals,
  ...nextTs,
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["../*"],
              message:
                "Relative imports above current directory are not allowed. Use @/ alias instead.",
            },
            {
              group: ["../features/*"],
              message:
                "Cross-feature imports are not allowed. Move shared code to lib/, types/, components/, or hooks/.",
            },
          ],
        },
      ],
    },
  },
]);

export default eslintConfig;
