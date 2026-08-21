/*
 * Progress + spaced-repetition store (requirements FR-14..FR-22).
 *
 * Everything lives in localStorage on the reader's device. Nothing is sent
 * anywhere (NFR-2). Every access is guarded, because storage can be denied
 * outright in private windows and blocked-cookie setups (FR-21).
 */

const KEY = 'dsa-course.progress';
const VERSION = 1;

/** Days between returns, indexed by box - 1. Box 3 answered right = retired. */
export const INTERVALS = [1, 3, 7] as const;

export interface ProblemRecord {
  solved: boolean;
  attempts: number;
  /** 0 = never solved, 1..3 = position in the interval ladder. */
  box: 0 | 1 | 2 | 3;
  /** ISO date (yyyy-mm-dd), or null when retired / never solved. */
  dueAt: string | null;
  lastAt: string;
}

export interface Store {
  v: number;
  units: Record<string, { state: 'in-progress' | 'complete' | 'skipped'; updated: string }>;
  problems: Record<string, ProblemRecord>;
}

export const empty = (): Store => ({ v: VERSION, units: {}, problems: {} });

/** True when this browser refused to persist (private mode, blocked storage). */
export let storageDenied = false;

let memory: Store | null = null;
const listeners = new Set<(s: Store) => void>();

export function isoDate(d: Date = new Date()): string {
  // Dates, not timestamps: "due today" should not depend on the hour, and a
  // reader crossing a timezone should not have work vanish or double up.
  return d.toISOString().slice(0, 10);
}

export function addDays(days: number, from: Date = new Date()): string {
  const d = new Date(from);
  d.setDate(d.getDate() + days);
  return isoDate(d);
}

export function read(): Store {
  if (memory) return memory;
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return (memory = empty());
    const parsed = JSON.parse(raw) as Store;
    // Unreadable, or written by a newer version we can't understand: start
    // clean rather than throwing into the UI (FR-20).
    if (!parsed || typeof parsed !== 'object' || parsed.v !== VERSION) return (memory = empty());
    parsed.units ??= {};
    parsed.problems ??= {};
    return (memory = parsed);
  } catch {
    storageDenied = true;
    return (memory = empty());
  }
}

function write(store: Store) {
  memory = store;
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    storageDenied = true; // keep going in memory for this session (FR-21)
  }
  listeners.forEach((fn) => fn(store));
}

export function subscribe(fn: (s: Store) => void): () => void {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

/** Keep multiple open tabs consistent. */
export function watchOtherTabs() {
  if (typeof window === 'undefined') return;
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return;
    memory = null;
    const s = read();
    listeners.forEach((fn) => fn(s));
  });
}

// ---- problems ------------------------------------------------------------

export function recordAttempt(problemId: string, passed: boolean) {
  const s = read();
  const now = new Date();
  const rec: ProblemRecord = s.problems[problemId] ?? {
    solved: false, attempts: 0, box: 0, dueAt: null, lastAt: isoDate(now),
  };

  rec.attempts += 1;
  rec.lastAt = isoDate(now);

  if (passed) {
    rec.solved = true;
    // Advance the ladder; box 3 answered correctly retires the item.
    rec.box = Math.min(rec.box + 1, 3) as 1 | 2 | 3;
    rec.dueAt = rec.box >= 3 ? null : addDays(INTERVALS[rec.box], now);
  } else if (rec.solved) {
    // Only a previously-solved item can fall back down the ladder.
    rec.box = 1;
    rec.dueAt = addDays(INTERVALS[0], now);
  }

  s.problems[problemId] = rec;
  write(s);
}

export const isSolved = (id: string) => read().problems[id]?.solved === true;

/** Items due on or before today, oldest first (FR-15). */
export function due(today: string = isoDate()): string[] {
  const s = read();
  return Object.entries(s.problems)
    .filter(([, r]) => r.dueAt !== null && r.dueAt <= today)
    .sort((a, b) => (a[1].dueAt! < b[1].dueAt! ? -1 : 1))
    .map(([id]) => id);
}

// ---- units ---------------------------------------------------------------

export function setUnit(unitId: string, state: 'in-progress' | 'complete' | 'skipped') {
  const s = read();
  const current = s.units[unitId]?.state;
  // Never downgrade a finished unit by revisiting it.
  if (current === 'complete' && state === 'in-progress') return;
  s.units[unitId] = { state, updated: isoDate() };
  write(s);
}

export function reset() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* nothing to remove */
  }
  write(empty());
}

export const pad = (n: number) => String(n).padStart(2, '0');
