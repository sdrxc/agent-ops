import nextConfig from "eslint-config-next";

const eslintConfig = [
  ...nextConfig,
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "out/**",
      "public/**",
    ],
  },
];

export default eslintConfig;
