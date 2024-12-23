import { defineConfig } from "astro/config";

import expressiveCode from "astro-expressive-code";

// https://astro.build/config
export default defineConfig({
  integrations: [
    expressiveCode({
      themes: ["dark-plus"],
    }),
  ],
  outDir: "../dist/api/docs",
  base: "/api",
});
