/*
 * Unlock logic (requirements FR-1..FR-7).
 *
 * Pure functions over the dependency graph — no DOM, no storage access — so
 * the whole unlock table is testable without a browser.
 */

import type { UnitState } from '../problems/_types';
import type { Store } from './progress';
import { pad } from './progress';

export interface UnitNode {
  order: number;
  requires: number[];
}

const satisfied = (state?: string) => state === 'complete' || state === 'skipped';

export function stateOf(unit: UnitNode, store: Store): UnitState {
  const rec = store.units[pad(unit.order)];
  if (rec?.state === 'complete') return 'complete';
  if (rec?.state === 'skipped') return 'skipped';

  // A unit with no dependencies is always reachable (FR-2).
  const open = unit.requires.every((r) => satisfied(store.units[pad(r)]?.state));
  if (!open) return 'locked';
  return rec ? 'in-progress' : 'available';
}

/** Which unmet units are blocking this one — used to render FR-4. */
export function blockedBy(unit: UnitNode, store: Store): number[] {
  return unit.requires.filter((r) => !satisfied(store.units[pad(r)]?.state));
}

/**
 * The unit to nudge the reader toward: the first available or in-progress one
 * in order. Undefined when everything reachable is finished.
 */
export function suggestedNext(units: UnitNode[], store: Store): UnitNode | undefined {
  const open = units
    .slice()
    .sort((a, b) => a.order - b.order)
    .filter((u) => {
      const s = stateOf(u, store);
      return s === 'in-progress' || s === 'available';
    });
  // Prefer something already started over starting something new.
  return open.find((u) => stateOf(u, store) === 'in-progress') ?? open[0];
}

/**
 * A unit is complete when its guided problem, every varied problem, and its
 * transfer problem are solved. Retrieval problems feed the return set and
 * deliberately do not gate progression (FR-6, FR-17).
 */
export function requiredProblems(unit: {
  ladder: string;
  varied: string[];
  transfer: string;
}): string[] {
  return [unit.ladder, ...unit.varied, unit.transfer];
}

export function isUnitComplete(
  unit: { ladder: string; varied: string[]; transfer: string },
  store: Store,
): boolean {
  return requiredProblems(unit).every((id) => store.problems[id]?.solved === true);
}
