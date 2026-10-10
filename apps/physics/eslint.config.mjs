import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import boundaries from "eslint-plugin-boundaries";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    plugins: { boundaries },
    settings: {
      "boundaries/elements": [
        { type: "sim-topic", pattern: "src/sims/*/**", capture: ["topic"] },
        { type: "sim-shared", pattern: "src/sims/{kit,widgets,registry.ts}/**" },
        { type: "app", pattern: "src/app/**" },
        { type: "challenges", pattern: "src/challenges/**" },
        { type: "lib", pattern: "src/lib/**" },
      ],
    },
    rules: {
      "boundaries/element-types": [
        "error",
        {
          default: "allow",
          rules: [
            {
              from: "sim-topic",
              disallow: [["sim-topic", { topic: "!${from.topic}" }]],
              message: "A simulation topic cannot import from another topic folder.",
            },
          ],
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["**/src/challenges/**", "@/challenges/**"],
              message: "Do not import config files directly. Use src/lib/loader.ts instead.",
            },
          ],
        },
      ],
    },
  },
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
]);

export default eslintConfig;
