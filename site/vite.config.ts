import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Static site served by Cloudflare Workers at https://swivel.gazehop-site.workers.dev/ (see wrangler.jsonc)
export default defineConfig({
  base: "/",
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      input: {
        main: "index.html",
        privacy: "privacy.html",
        terms: "terms.html",
        notFound: "404.html",
      },
    },
  },
});