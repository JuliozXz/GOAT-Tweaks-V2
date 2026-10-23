import { defineConfig } from "vitest/config";

export default defineConfig({
  server: {
    port: 1420,
    strictPort: true,
    watch: { ignored: ["**/.runtime/**", "**/skill-audit-*/**"] },
    fs: {
      deny: [
        ".env",
        ".env.*",
        "*.{crt,pem,key,pfx,p12}",
        "**/.git/**",
        "**/.runtime/**",
        "**/skill-audit-*/**",
      ],
    },
  },
  preview: { port: 1420, strictPort: true },
  build: { target: "es2022" },
  test: { include: ["src/**/*.test.ts"], environment: "node" },
});
