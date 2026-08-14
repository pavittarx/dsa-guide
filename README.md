# DSA in 2026

A practical guide to data structures & algorithms for when AI writes the code.

**Live site:** `https://pavittarx.github.io/dsa-guide/`

Built with [Astro](https://astro.build). The guide content lives in Markdown
(`src/content/guide.md`) and is rendered through a shared layout that carries
the design system (`src/styles/global.css`). Responsive and light/dark-mode aware.

## Project structure

```
src/
  content/
    guide.md          # the guide — prose in Markdown, rich components as inline HTML
  content.config.ts   # content collection ("guide")
  layouts/
    Layout.astro      # <head>, page shell, global styles
  pages/
    index.astro       # renders the guide at /
  styles/
    global.css        # design tokens + component styles
public/
  favicon.svg
  .nojekyll
astro.config.mjs      # site + base ("/dsa-guide") for GitHub Pages
```

The Markdown keeps hand-authored SVG figures, pattern cards, worked-example
boxes, tables, and quiz accordions as inline HTML — Astro passes raw HTML
through — while the surrounding prose is plain Markdown.

## Develop

```
npm install
npm run dev      # local dev server
npm run build    # static build into docs/
npm run preview  # preview the production build
```

## Publish to GitHub Pages

The site builds into `docs/` (see `outDir` in `astro.config.mjs`), which
GitHub Pages serves directly — no build action required.

**One-time setup:** in **Settings → Pages → Build and deployment**, keep
**Source: Deploy from a branch**, and set the branch to **`main`** and the
folder to **`/docs`**, then **Save**.

**On every change:** run `npm run build` and commit the updated `docs/`
alongside your source edits. The `docs/.nojekyll` file (copied from
`public/`) ensures Pages serves the hashed `_astro/` asset folder.
