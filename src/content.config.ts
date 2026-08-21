import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// The reference guide: one Markdown document rendered at /.
const guide = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content' }),
});

// The course: one Markdown file per unit, ordered by dependency.
const units = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/units' }),
  schema: z.object({
    order: z.number().int().min(0).max(18),
    title: z.string(),
    /** What the reader can do afterwards, in one line. */
    skill: z.string(),
    track: z.enum(['core', 'extension']).default('core'),
    /** Unit orders that must be complete (or skipped) first. */
    requires: z.array(z.number().int()).default([]),
    /** Anchor in the reference guide, e.g. "s6". */
    guideSection: z.string().optional(),
    /** One-line motivation shown on the map. */
    incident: z.string(),
    /** Problem taught as an approach ladder. */
    ladder: z.string(),
    /** Same skill, different costume. Core units aim for 3. */
    varied: z.array(z.string()).default([]),
    /** Pulled from earlier units; feeds the return set, never gates. */
    retrieval: z.array(z.string()).default([]),
    /** Pattern deliberately unnamed. */
    transfer: z.string().optional(),
    /** Primitive ids introduced here. */
    inventory: z.array(z.string()).default([]),
  }),
});

export const collections = { guide, units };
