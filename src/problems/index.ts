import type { Problem } from './_types';
import { problems as u00 } from './u00';
import { problems as u01 } from './u01';

/**
 * Problems are grouped one module per unit rather than one per problem — the
 * spec's original layout — because authoring a unit's set together is what
 * keeps the varied slots genuinely varied.
 */
export const ALL: Problem[] = [...u00, ...u01];

export const REGISTRY: Record<string, Problem> = Object.fromEntries(
  ALL.map((p) => [p.id, p]),
);

export function getProblem(id: string): Problem {
  const p = REGISTRY[id];
  if (!p) throw new Error(`Unknown problem id: ${id}`);
  return p;
}

export type { Problem };
