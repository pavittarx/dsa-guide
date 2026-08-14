// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages project site: https://pavittarx.github.io/dsa-guide/
export default defineConfig({
  site: 'https://pavittarx.github.io',
  base: '/dsa-guide',
  trailingSlash: 'ignore',
  markdown: {
    // Keep straight quotes/dashes so converted prose matches the raw-HTML
    // components verbatim (the original guide uses straight quotes throughout).
    smartypants: false,
  },
});
