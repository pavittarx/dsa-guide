import type { Impl, Lang, LegacyProblem, Problem } from './_types';
import { problems as u00 } from './u00';
import { problems as u01 } from './u01';

/**
 * Units written before the language switcher put `starter`/`solution`/`tests`
 * directly on the problem. Fold those into `impls.python` so both shapes can
 * coexist while the remaining units are translated.
 */
function normalize(p: Problem | LegacyProblem): Problem {
  if ('impls' in p) return p;
  const { starter, solution, tests, wrongApproach, ladder, ladderDemo, note, ...rest } = p;
  return { ...rest, impls: { python: { starter, solution, tests, wrongApproach, ladder, ladderDemo, note } } };
}

/**
 * Problems are grouped one module per unit rather than one per problem — the
 * spec's original layout — because authoring a unit's set together is what
 * keeps the varied slots genuinely varied.
 */
export const ALL: Problem[] = [...u00, ...u01].map(normalize);

export const REGISTRY: Record<string, Problem> = Object.fromEntries(ALL.map((p) => [p.id, p]));

export function getProblem(id: string): Problem {
  const p = REGISTRY[id];
  if (!p) throw new Error(`Unknown problem id: ${id}`);
  return p;
}

/** Languages this problem has been written in, in a stable display order. */
export function langsOf(p: Problem): Lang[] {
  return (['python', 'javascript', 'cpp'] as Lang[]).filter((l) => p.impls[l]);
}

export function implOf(p: Problem, lang: Lang): Impl {
  const impl = p.impls[lang];
  if (!impl) throw new Error(`${p.id} has no ${lang} implementation`);
  return impl;
}

export type { Problem, Impl, Lang };
