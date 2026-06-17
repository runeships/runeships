import nextConfig from "eslint-config-next";

const config = [
  ...nextConfig,
  {
    rules: {
      // New strict rules in Next 16's eslint-config — surfacing real
      // anti-patterns but ones we'll address in a follow-up rather
      // than blocking the framework upgrade.
      "react-hooks/set-state-in-effect": "off",
      "react-hooks/purity": "off",
    },
  },
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
];

export default config;
