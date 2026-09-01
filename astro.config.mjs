import { readFileSync } from "node:fs";
import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

const settings = JSON.parse(readFileSync(new URL("./src/data/settings.json", import.meta.url), "utf8"));

export default defineConfig({
  output: "static",
  site: process.env.SITE_URL || "http://localhost:4321",
  base: process.env.BASE_PATH || "/",
  integrations: settings.indeksowanie ? [sitemap()] : [],
});
