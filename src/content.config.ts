import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';

// The guide lives as Markdown in src/content/. One entry today ("guide"),
// but the collection is ready for per-level files when we build the game.
const guide = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content' }),
});

export const collections = { guide };
