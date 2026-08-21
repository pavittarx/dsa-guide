/*
 * Types for course problems.
 *
 * A problem states one job and carries a separate implementation per language.
 * Python and JavaScript run in the reader's browser; C++ is compiled and run by
 * an external service (see runners.ts), which is the only part of this site
 * that sends anything off the machine.
 *
 * Every problem here is authored by us (requirements FR-S2). The canonical
 * lists are used as reference for which skills matter; problem statements from
 * those platforms are copyrighted and are never copied.
 */

export type Lang = 'python' | 'javascript' | 'cpp';

export const LANGS: Lang[] = ['python', 'javascript', 'cpp'];

export const LANG_LABEL: Record<Lang, string> = {
  python: 'Python',
  javascript: 'JavaScript',
  cpp: 'C++',
};

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

export interface Impl {
  starter: string;
  solution: string;
  /** Assertions using the language's harness (expect / under). */
  tests: string;
  /** A plausible wrong approach, asserted to FAIL by `npm run verify`. */
  wrongApproach?: string;
  /** Present only on guided + boss problems. */
  ladder?: Rung[];
  /**
   * Appended to every rung when it runs, so each approach is exercised on the
   * SAME workload and the timings are comparable.
   */
  ladderDemo?: string;
  /**
   * Language-specific wording — e.g. C++ returns a sentinel where Python
   * returns None. Shown under the statement when present.
   */
  note?: string;
}

export interface Problem {
  id: string;
  title: string;
  /** Our words, always. Language-independent. */
  statement: string;
  source?: { name: string; url: string };
  origin?: 'blind75' | 'neetcode150' | 'grind75' | 'codeforces' | 'original';
  /** Function the tests call. */
  entry: string;
  /** Revealed one at a time, in order. Language-independent. */
  hints: string[];
  /** Hidden until solved when used in a transfer slot (FR-13). */
  skills: string[];
  /** Python is required; the others are added as they are written. */
  impls: { python: Impl } & Partial<Record<Lang, Impl>>;
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

/**
 * The pre-multi-language shape: implementation fields sitting directly on the
 * problem. The registry normalizes these into `impls.python`, so units written
 * before the language switcher keep working unchanged.
 */
export type LegacyProblem = Omit<Problem, 'impls'> & Impl;
