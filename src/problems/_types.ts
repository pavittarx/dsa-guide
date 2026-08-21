/*
 * Types for course problems.
 *
 * Every problem here is authored by us (requirements FR-S2). The canonical
 * lists are used as reference for which skills matter; problem statements from
 * those platforms are copyrighted and are never copied. `source` links out so a
 * reader can go read the original and submit there.
 */

export interface Rung {
  /** "brute force", "better", "optimal" */
  label: string;
  /** Runnable on its own. */
  code: string;
  /** "O(n²) time, O(1) space" */
  complexity: string;
  /** Where it stops being viable: "n = 100,000 → minutes". */
  diesAt?: string;
  /** The repeated work the next rung removes. */
  insight: string;
}

export interface Problem {
  id: string;
  title: string;
  /** Our words, always. */
  statement: string;
  source?: { name: string; url: string };
  origin?: 'blind75' | 'neetcode150' | 'grind75' | 'codeforces' | 'original';
  /** Function the tests call. */
  entry: string;
  starter: string;
  solution: string;
  /** Revealed one at a time, in order. */
  hints: string[];
  /** Python, using the harness (expect / under). */
  tests: string;
  /** Hidden until solved when used in a transfer slot (FR-13). */
  skills: string[];
  /** Present only on guided + boss problems. */
  ladder?: Rung[];
  /** A plausible wrong approach, asserted to FAIL the tests by `npm run verify`. */
  wrongApproach?: string;
}

export type UnitState = 'locked' | 'available' | 'in-progress' | 'complete' | 'skipped';

export interface Primitive {
  id: string;
  name: string;
  cost: string;
  purpose: string;
  move: 'remember' | 'order' | 'once' | 'structural';
  /** Unit that teaches it. */
  unit: number;
  /** Small worked example — a table row cannot teach a heap. */
  micro: string;
  pitfall: string;
}
