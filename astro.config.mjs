// @ts-check
import { defineConfig } from 'astro/config';

// GitHub Pages project site: https://pavittarx.github.io/dsa-guide/
export default defineConfig({
  site: 'https://pavittarx.github.io',
  base: '/dsa-guide',
  trailingSlash: 'ignore',
  // Build into dist/, then `npm run build` publishes those files to the repo
  // root (see scripts/publish-root.mjs). GitHub Pages serves this repo with
  // "Deploy from a branch -> main -> / (root)", the same mechanism as the
  // system-design-guide repo. outDir must NOT be the repo root: Astro empties
  // outDir before every build, which would delete the source tree.
  markdown: {
    // Keep straight quotes/dashes so converted prose matches the raw-HTML
    // components verbatim (the original guide uses straight quotes throughout).
    smartypants: false,
  },
});
