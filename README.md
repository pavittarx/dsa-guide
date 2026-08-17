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
npm run build    # build, then publish the output to the repo root
npm run preview  # preview the production build
```

## Publish to GitHub Pages

Same mechanism as the `system-design-guide` repo: the built static site lives
at the **repo root** and GitHub Pages serves it with **Deploy from a branch →
`main` → `/ (root)`**. No Actions workflow, no Pages setting to change.

`npm run build` does both steps — Astro builds into `dist/`, then
`scripts/publish-root.mjs` copies the output to the root:

| Published to root | What it is |
| --- | --- |
| `index.html` | the rendered guide |
| `_astro/` | hashed CSS bundle |
| `favicon.svg` | icon |
| `.nojekyll` | stops Jekyll from hiding the `_astro/` folder |

**On every change:** run `npm run build` and commit the updated root files
alongside your source edits. `dist/` is only staging and stays gitignored.

> Without `.nojekyll`, GitHub Pages runs the repo through Jekyll, which ignores
> underscore-prefixed folders like `_astro/` (the CSS 404s) and renders
> `README.md` as the homepage when no root `index.html` exists.
