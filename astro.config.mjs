// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages project site: https://pavittarx.github.io/dsa-guide/
export default defineConfig({
  site: 'https://pavittarx.github.io',
  base: '/dsa-guide',
  trailingSlash: 'ignore',
  // Build into docs/ so GitHub Pages can serve it directly from "main /docs"
  // (no Actions workflow required). public/.nojekyll is copied in so Pages
  // serves the _astro/ asset dir instead of letting Jekyll skip it.
  outDir: './docs',
  markdown: {
    // Keep straight quotes/dashes so converted prose matches the raw-HTML
    // components verbatim (the original guide uses straight quotes throughout).
    smartypants: false,
  },
});
