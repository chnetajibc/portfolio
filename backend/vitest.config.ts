import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    pool: "@cloudflare/vitest-pool-workers",
    poolOptions: {
      workers: {
        wrangler: { configPath: "./wrangler.jsonc" },
        miniflare: {
          kvNamespaces: ["RATE_LIMIT_KV"],
        },
      },
    },
    include: ["tests/**/*.test.ts"],
    globals: true,
  },
});
