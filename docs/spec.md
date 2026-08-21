# DSA Course

**Technical specification**
Status: draft for review · Implements [requirements.md](./requirements.md)

---

## 1. Approach

The course is a new content collection and route tree inside the existing Astro
site. It reuses the layout, design tokens, Pyodide worker, and editor already
built, and adds five new pieces:

1. a **unit + problem content model**,
2. a **grading engine** (the worker learns to score, not just run),
3. an **approach-ladder** component,
4. the **Inventory** surface,
5. a **progress + spaced-scheduling store**.

Principles, in priority order:

- **The guide is untouchable.** `index.html` and its behaviour do not change;
  the course's failure modes must not reach it. (FR-23)
- **Static, always.** Everything resolves at build time or in the browser.
- **The reference is never gated.** Gating exists only under `/learn/*`. (FR-3)

## 2. File layout

```
src/
  content/
    guide.md                       # unchanged
    units/
      00-cost-intuition.md
      01-hashing.md
      ...
  problems/
    _types.ts                      # Problem, Ladder, Test types
    u01-lookup-service.ts          # one module per problem
    ...
  content.config.ts                # + units collection & schema
  components/
    CodeRunner.astro               # existing; unchanged
    Problem.astro                  # NEW graded problem widget
    Ladder.astro                   # NEW approach ladder (runnable rungs)
    Inventory.astro                # NEW toolkit surface
    UnitMap.astro                  # NEW course map
    ReviewQueue.astro              # NEW due-today list
  layouts/
    Layout.astro                   # existing
    UnitLayout.astro               # NEW
  scripts/
    demos.ts                       # existing
    progress.ts                    # NEW store (progress + schedule)
    schedule.ts                    # NEW spaced-repetition logic
    gating.ts                      # NEW pure unlock logic
    grader.ts                      # NEW client half of grading
    inventory.ts                   # NEW primitive definitions
  pages/
    index.astro                    # unchanged (the guide)
    learn/
      index.astro                  # course map
      [unit].astro                 # a unit
    review.astro                   # return set
    inventory.astro                # Inventory (also embedded per unit)
public/
  py-worker.js                     # + `grade` message
```

## 3. Routing

| Route | Page | Gated |
| --- | --- | --- |
| `/` | The guide, as today | No (FR-3) |
| `/learn` | Course map | No |
| `/learn/00` … `/learn/18` | Units | Yes, client-side (§8) |
| `/review` | Due return-set items | No |
| `/inventory` | The Inventory | No |

Every unit is prerendered via `getStaticPaths()`, so a deep link never 404s and
a locked unit can render a proper explanation with a route forward (FR-4).

## 4. Content model

### 4.1 Units

```ts
const units = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/units' }),
  schema: z.object({
    order: z.number().int().min(0).max(18),
    title: z.string(),
    skill: z.string(),                       // "recognise repeated work and cache it"
    track: z.enum(['core', 'extension']),
    requires: z.array(z.number().int()).default([]),   // unit orders
    guideSection: z.string().optional(),     // "s6" — the depth layer
    incident: z.string(),                    // one-line motivation
    ladder: z.string(),                      // problem id taught as a ladder
    varied: z.array(z.string()).length(3),
    retrieval: z.array(z.string()).length(2),
    transfer: z.string(),
    inventory: z.array(z.string()).default([]),  // primitive ids introduced
  }),
});
```

Unit completion (FR-6) = `ladder` + all `varied` + `transfer` passed.
`retrieval` feeds the return set and never blocks.

### 4.2 Problems

```ts
export interface Problem {
  id: string;
  title: string;
  statement: string;        // OUR words, always (FR-S2)
  source?: { name: string; url: string };   // link out, never copied text
  origin?: 'blind75' | 'neetcode150' | 'grind75' | 'codeforces' | 'original';
  entry: string;            // function name the tests call
  starter: string;
  solution: string;
  hints: string[];          // progressive, revealed one at a time
  tests: string;            // Python, uses the harness (§6.2)
  skills: string[];         // for the transfer slot: hidden until solved
  ladder?: Rung[];          // present only for guided + boss problems
}

export interface Rung {
  label: string;            // "brute force"
  code: string;             // runnable
  complexity: string;       // "O(n²) time, O(1) space"
  diesAt?: string;          // "n = 100,000 → ~8 minutes"
  insight: string;          // what repeated work the next rung removes
}
```

**FR-13 (transfer):** the unit page must not render `skills`, the source name,
or any pattern label for the transfer problem until it is solved or revealed.
Because everything ships to the browser this is a UI contract, not a security
one (C-4) — the field is simply not rendered.

## 5. The Inventory

`inventory.ts` holds the primitives, revised from the guide's §5 rather than
copied (FR-I3):

```ts
export interface Primitive {
  id: string;                 // "hash-map"
  name: string;
  cost: string;               // "O(1) average insert / lookup"
  purpose: string;            // rewritten, starter-facing
  move: 'remember' | 'order' | 'once' | 'structural';
  unit: number;               // which unit teaches it
  micro: string;              // small worked example (FR-I3)
  pitfall: string;            // the one mistake people make
}
```

Rendered as a filterable table grouped by move, with per-entry state derived
from progress: `locked`, `learning`, `known` (FR-I2, FR-I4). Available at
`/inventory` and embedded as a collapsible panel in `UnitLayout` so it is
reachable from every unit (FR-I1). The three-moves frame is taught in unit 00
and used as the grouping axis everywhere (FR-I5).

## 6. Grading engine

`public/py-worker.js` gains one message type; the existing `run` path is
untouched, so the guide's 17 runnable blocks are unaffected.

```
main ──▶ { type: 'grade', code, tests }
     ◀── { type: 'out',    stream, text }
     ◀── { type: 'graded', results[], ms }
     ◀── { type: 'error',  message, ms }
```

### 6.1 Execution

```js
const globals = pyodide.toPy({});
await pyodide.runPythonAsync(HARNESS + code + tests + TAIL, { globals });
const results = JSON.parse(globals.get('_RESULTS_JSON'));
```

Reused unchanged from the existing runner: shared worker, 15 s timeout with
terminate-and-rebuild, `Stop`, streamed stdout, fresh globals per run (NFR-9).

### 6.2 Harness

```python
import json, time
_RESULTS = []

def expect(actual, expected, label):
    _RESULTS.append({"label": label, "ok": actual == expected,
                     "actual": repr(actual)[:200], "expected": repr(expected)[:200]})

def under(seconds, label, fn):
    t = time.perf_counter(); fn(); dt = time.perf_counter() - t
    _RESULTS.append({"label": label, "ok": dt < seconds,
                     "actual": f"{dt:.3f}s", "expected": f"< {seconds:.1f}s"})
```

### 6.3 Complexity gates

Several problems must reject a correct-but-quadratic answer. Wall-clock
assertions are normally flaky; they are safe here **only because the margin is
enormous** — at n = 200,000 a hash solution runs in milliseconds and a nested
scan runs for minutes, four or more orders of magnitude apart. Thresholds sit at
~100× the reference solution's measured time. **Any gate with under 50× margin
must be redesigned or dropped.**

### 6.4 Ladders

`Ladder.astro` renders each rung as its own runnable block (reusing the existing
runner) with its complexity and a **Run** button (FR-12). The brute-force rung
ships with an input size large enough to be visibly slow but bounded well under
the 15 s timeout, so it stalls rather than hanging. The rung that "dies at n"
offers a second, larger input behind an explicit button, with a warning that it
will hit the timeout — that *is* the lesson.

## 7. Progress and scheduling

```ts
const KEY = 'dsa-course.progress';
const VERSION = 1;

interface Store {
  v: number;
  units: Record<string, { state: 'in-progress'|'complete'|'skipped'; updated: string }>;
  problems: Record<string, {
    solved: boolean;
    attempts: number;
    box: 0 | 1 | 2 | 3;      // 0 = unsolved, 1..3 = interval index
    dueAt: string | null;    // ISO date
    lastAt: string;
  }>;
}
```

### 7.1 Schedule (FR-14 – FR-18)

Intervals: **1 day → 3 days → 7 days**, then retired.

```ts
const INTERVALS = [1, 3, 7];           // days, by box
export function onSolved(p, now)  { p.box = Math.min(p.box + 1, 3); p.dueAt = addDays(now, INTERVALS[p.box - 1]); }
export function onFailed(p, now)  { p.box = 1; p.dueAt = addDays(now, INTERVALS[0]); }
export function due(store, now)   { /* problems with dueAt <= now, oldest first */ }
```

- Retired items (box 3, answered correctly) leave the queue permanently.
- Overdue items simply stay due; no penalty, no streaks, no guilt (FR-18).
- The queue never gates the spine (FR-17).
- Dates are stored as ISO dates (not timestamps) so "due today" is stable across
  timezones and doesn't depend on the hour of day.

### 7.2 Store rules

- **Versioning (FR-20)** — on read, if `v` is missing, unparseable, or newer
  than `VERSION`, discard and start empty. Never throw into the UI.
- **Storage denied (FR-21)** — every access wrapped in `try/catch`; degrade to
  an in-memory object for the session and surface one notice.
- **Cross-tab** — a `storage` listener keeps open tabs consistent.
- **Reset (FR-22)** — explicit confirmation.

## 8. Gating

Pure and testable, over the dependency graph rather than a linear index:

```ts
export function stateOf(unit: Unit, store: Store): UnitState {
  const rec = store.units[pad(unit.order)];
  if (rec?.state === 'complete') return 'complete';
  if (rec?.state === 'skipped')  return 'skipped';
  const open = unit.requires.every(r => {
    const s = store.units[pad(r)]?.state;
    return s === 'complete' || s === 'skipped';
  });
  if (!open) return 'locked';
  return rec ? 'in-progress' : 'available';
}
```

- Unit 00 has no dependencies and is always available (FR-2).
- `skipped` satisfies a dependency, so FR-5 cannot dead-end the graph.
- Gating never runs on `/`, `/review`, or `/inventory` (FR-3).
- Unit bodies render `hidden` and are revealed by the gate script on first
  paint, avoiding a flash of unlocked content. `<noscript>` shows the body with
  a note that progress needs JavaScript (NFR-5).

## 9. UI

**Course map** (`/learn`) — units in dependency order with state, skill line,
and the suggested next step; boss levels visually distinct. Shows a due-count
badge linking to `/review`.

**Unit page** — incident → ladder → invariant → guided → varied ×3 → failure
modes → retrieval ×2 → transfer, in that order, with the Inventory panel and a
link to the mapped guide section in the header.

**Problem widget** — extends the existing runner shell: editor, `Run`
(ungraded), `Submit` (graded), progressive `Hint`, `Reset`, `Show solution`
(after pass or explicit request, FR-10). Results render as per-test rows with
input, expected, and actual (FR-9) — never a bare verdict.

**Review** (`/review`) — due items grouped by unit, each opening the problem in
place; answering advances or resets its box.

Styling uses existing tokens only (NFR-8): `.card`, `.tag`, `.pill`, `.runner`,
`.runbtn`, plus new `.unit-*`, `.ladder-*`, `.inv-*`, `.test-row` using
`--good` / `--danger`.

**Accessibility (NFR-6)** — results in an `aria-live="polite"` region; test rows
carry text status, never colour alone; map cards are real links with
`aria-disabled` and an explanation when locked, not `pointer-events: none`.

## 10. Edge cases

| Case | Behaviour |
| --- | --- |
| Deep link to a locked unit | Locked state with a route forward (FR-4) |
| Dependency satisfied by a skip | Unit opens; map shows the skip honestly |
| Progress cleared mid-session | Re-reads empty and re-gates without reload |
| Clock skew / device date changed | Schedule uses dates only; a wrong clock at worst surfaces items early |
| Ladder brute-force rung times out | Expected on the oversized input; framed as the lesson (§6.4) |
| CDN unreachable | Units readable, grading disabled with explanation (NFR-4) |
| Transfer problem's skill leaked via DOM | Field not rendered at all until solved (§4.2) |
| Two tabs open | `storage` event keeps both in sync |

## 11. Build and deploy

No pipeline change. `npm run build` runs `astro build` then
`scripts/publish-root.mjs`, copying `dist/` to the repo root; Pages serves from
`main` / root. The course adds `learn/`, `review/`, and `inventory/` pages plus
one JS bundle (target: **under ~20 KB gzipped**). Pyodide stays lazy and is
never fetched by `/`, `/learn`, `/review`, or `/inventory` (NFR-3).

**C-1 reminder:** built output is committed — run `npm run build` before any
commit touching `src/`.

## 12. Testing

- **Unit** — `gating.ts` across the dependency graph and every progress shape;
  `schedule.ts` box transitions, due calculation, and a simulated 7-day clock
  (S4); `progress.ts` versioning, corruption, and storage-denied paths.
- **Content** — build-time checks that `order` values are unique, `requires`
  references exist and are acyclic, every problem id resolves, `varied` has
  exactly 3 and `retrieval` exactly 2, and every `guideSection` anchor exists.
- **Problem integrity (S2, S3)** — `npm run verify` runs each problem's
  `solution` against its own `tests` (all must pass), a recorded wrong approach
  (must fail), and each ladder's brute rung at its stated n (must exceed the
  gate). Runs locally against Pyodide, since there is no CI (C-1).
- **End-to-end** — Playwright: complete a unit and assert its dependents
  unlock; reload and assert progress survived; submit a wrong answer and assert
  per-test feedback; deep-link a locked unit; run with `localStorage` blocked;
  assert the transfer problem leaks no skill label pre-solve.
- **Regression** — the guide's existing DOM checks (component counts, no `pre`
  inside `code`, zero overflow at 390 px) must still pass.

## 13. Delivery phases

| Phase | Scope | Done when |
| --- | --- | --- |
| **1 — Engine** | Collections, routes, map, progress + schedule store, gating, `Problem.astro`, worker `grade` path | One throwaway unit is completable; unlock and reload work |
| **2 — Prove the loop** | Units 00–02 complete: 3 ladders, 21 problems, Inventory v1 | S1 met on 00–02; `npm run verify` green |
| **3 — Core spine** | Units 03–14 + B1–B4 | All core units completable |
| **4 — Polish** | Accessibility, reduced motion, 390 px, copy pass | NFR-6/7 verified |
| **5 — Extension** | Units 15–18 (v2) | Deferred; confirm via OQ-4 |

Phase 2 is the real decision point: three units built end to end will show
whether the seven-slot loop is worth ~105 problems before we commit to writing
them.

## 14. Traceability

| Requirement | Where |
| --- | --- |
| FR-1 – FR-7 | §8 gating, §9 map |
| FR-8 – FR-13 | §4.2 problems, §6 grading, §6.4 ladders |
| FR-14 – FR-18 | §7.1 schedule |
| FR-19 – FR-23 | §7.2 store, §1 principles |
| FR-I1 – FR-I5 | §5 Inventory |
| FR-S1 – FR-S5 | §4.2 `Problem.statement` / `source` / `origin` |
| NFR-1, C-1 | §11 build |
| NFR-3, NFR-4, NFR-9 | §6, §11 |
| NFR-5, NFR-6 | §8 noscript, §9 accessibility |
| NFR-2 | §7 store (local only), §11 (no analytics added) |
| NFR-7, NFR-8 | §9 styling, §12 regression checks |

## 15. Open items

Inherited and unresolved: **OQ-1** (confirm manual skip — shapes §8),
**OQ-2** (retrieval slots hand-picked vs drawn from the return set — shapes
§4.1), **OQ-3** (course at `/learn` vs at the root), **OQ-4** (extension track),
**OQ-5** (ladders gated or freely browsable — shapes §6.4).

Spec-local: the exact input sizes for each complexity gate are set per problem
during Phase 2 and recorded alongside the measured reference time, so the 50×
margin rule in §6.3 can be checked mechanically.
