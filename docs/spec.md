# DSA Guide — Story Mode

**Technical specification**
Status: draft for review · Implements [requirements.md](./requirements.md)

---

## 1. Approach

Story Mode is a second content collection and a second route tree inside the
existing Astro site. It reuses what is already built — the layout, the design
tokens, the Pyodide worker, the editor — and adds three genuinely new pieces:

1. a **level content model**,
2. a **grading engine** (the worker learns to score code, not just run it),
3. a **progress store** in `localStorage`.

Principles, in priority order:

- **The guide is untouchable.** `index.html` and its behaviour do not change.
  Story Mode is additive, and its failure modes must not reach the guide. (FR-19)
- **Static, always.** Everything resolves at build time or in the browser. (NFR-1)
- **The reference is never gated.** Gating exists only on `/play/*`. (FR-3)

## 2. File layout

```
src/
  content/
    guide.md                     # unchanged
    levels/
      01-day-one.md              # one file per level
      02-the-postmortem.md
      ...
  content.config.ts              # + levels collection & schema
  components/
    CodeRunner.astro             # existing; unchanged
    Challenge.astro              # NEW graded challenge widget
    LevelNav.astro               # NEW prev/next + back-to-map
    CampaignMap.astro            # NEW 14-level map
    ProgressBadge.astro          # NEW state pill
  layouts/
    Layout.astro                 # existing
    LevelLayout.astro            # NEW level chrome
  scripts/
    demos.ts                     # existing
    progress.ts                  # NEW localStorage store
    gating.ts                    # NEW pure unlock logic
    grader.ts                    # NEW client half of grading
  challenges/
    l02-profile-lookup.ts        # starter, solution, tests per challenge
    ...
  pages/
    index.astro                  # unchanged
    play/
      index.astro                # campaign map
      [level].astro              # a level
public/
  py-worker.js                   # extended with a `grade` message
docs/
  requirements.md
  spec.md
```

## 3. Routing

| Route | Page | Gated |
| --- | --- | --- |
| `/` | The guide, exactly as today | No (FR-3) |
| `/play` | Campaign map | No |
| `/play/01` … `/play/14` | Levels | Yes, client-side (§7) |

All paths carry the `/dsa-guide` base. `[level].astro` uses
`getStaticPaths()` over the `levels` collection, so every level is prerendered
— gating is a client-side view concern, not a routing one. This matters: a
prerendered level page means a deep link never 404s, and FR-4 can render a
proper "locked" state with a way forward.

## 4. Level content model

Each level is Markdown with typed frontmatter, validated at build time.

```ts
// content.config.ts
const levels = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/levels' }),
  schema: z.object({
    order: z.number().int().min(1).max(14),   // 1..14, unique
    title: z.string(),                         // "The postmortem"
    kind: z.enum(['briefing', 'drill', 'gauntlet', 'debrief']),
    section: z.string(),                       // anchor in the guide, e.g. "s2"
    sectionTitle: z.string(),                  // "What DSA catches"
    summary: z.string(),                       // one line, shown on the map
    challenges: z.array(z.string()).default([]),   // challenge ids
    requiredToPass: z.number().int().min(0).optional(), // gauntlet: k of n
  }),
});
```

Body structure, in the guide's existing components:

```markdown
<div class="card watch">
  <span class="tag">03:14 · pager</span>
  <p>Checkout p99 just crossed 8 seconds...</p>
</div>

## The brief
Read [§2 — What DSA catches](/dsa-guide/#s2), then come back.

<Challenge id="l02-profile-lookup" />

## Debrief
This was Two Sum wearing a suit...
```

`kind` determines completion (FR "Level anatomy", req §5.1):

| kind | Completes when |
| --- | --- |
| `briefing` | Reader presses **Continue** |
| `drill` | All required tests pass on every listed challenge |
| `gauntlet` | `requiredToPass` of `challenges` pass |
| `debrief` | All recall prompts revealed and acknowledged |

## 5. Challenge model

One module per challenge, colocated and typed:

```ts
// src/challenges/l02-profile-lookup.ts
import type { Challenge } from './types';

export default {
  id: 'l02-profile-lookup',
  title: 'Make the lookup stop scanning',
  prompt: 'Return a list of profile names for the given ids. It must stay fast at 200,000 profiles.',
  entry: 'lookup',                 // function the tests call
  starter: `def lookup(ids, profiles):\n    # profiles: list of {"id": int, "name": str}\n    ...\n`,
  solution: `def lookup(ids, profiles):\n    by_id = {p["id"]: p for p in profiles}\n    return [by_id[i]["name"] for i in ids]\n`,
  hint: 'The inner scan re-derives the same fact every time. What could remember it?',
  tests: `
expect(lookup([2], [{"id": 1, "name": "a"}, {"id": 2, "name": "b"}]), ["b"], "finds one")
expect(lookup([], [{"id": 1, "name": "a"}]), [], "empty ids")
expect(lookup([1, 1], [{"id": 1, "name": "a"}]), ["a", "a"], "repeated ids")

# Complexity gate: linear passes in milliseconds, quadratic takes minutes.
big = [{"id": i, "name": f"n{i}"} for i in range(200_000)]
under(2.0, "stays fast at 200k", lambda: lookup(list(range(0, 200_000, 500)), big))
`,
} satisfies Challenge;
```

### 5.1 Complexity gates

The guide's whole thesis is about scale, so several challenges must reject a
correct-but-quadratic answer. `under(seconds, label, fn)` asserts wall-clock.

Wall-clock assertions are normally flaky. They are safe here **only because the
margin is enormous**: at n = 200,000 a hash solution runs in milliseconds and a
nested scan runs for minutes — four or more orders of magnitude. Thresholds are
set at ~100× the reference solution's measured time, never near it. Any gate
whose margin is under 50× must be redesigned or dropped.

### 5.2 Test harness

Injected before the tests, inside the same fresh namespace:

```python
import json, time
_RESULTS = []

def expect(actual, expected, label):
    _RESULTS.append({
        "label": label, "ok": actual == expected,
        "actual": repr(actual)[:200], "expected": repr(expected)[:200],
    })

def under(seconds, label, fn):
    t = time.perf_counter()
    fn()
    dt = time.perf_counter() - t
    _RESULTS.append({
        "label": label, "ok": dt < seconds,
        "actual": f"{dt:.3f}s", "expected": f"< {seconds:.1f}s",
    })
```

The composed program is `harness + user code + tests`, ending with
`_RESULTS_JSON = json.dumps(_RESULTS)`. Test source is never shown in the
editor; only the reader's own code is editable.

## 6. Grading engine

`public/py-worker.js` gains one message type. The existing `run` path is
untouched, so the guide's 17 runnable blocks are unaffected.

```
main ──▶ { type: 'grade', code, tests }
     ◀── { type: 'out',    stream, text }          # reader's prints, streamed
     ◀── { type: 'graded', results[], ms }         # all tests ran
     ◀── { type: 'error',  message, ms }           # exception before/while testing
```

Worker side, reusing the existing fresh-namespace discipline:

```js
const globals = pyodide.toPy({});
await pyodide.runPythonAsync(HARNESS + code + TESTS_TAIL, { globals });
const results = JSON.parse(globals.get('_RESULTS_JSON'));
```

Reused from the existing runner without change: the shared worker, the 15 s
timeout with terminate-and-rebuild, `Stop`, streamed stdout, and per-run fresh
globals. (NFR-9)

Outcome mapping (FR-8, FR-12):

| Worker reply | Shown as |
| --- | --- |
| `graded`, all `ok` | **Passed** — level marked complete |
| `graded`, some `ok: false` | Per-test rows: label, expected, actual |
| `error` | **Error** with the Python traceback, distinct from a failure |
| timeout | **Stopped after 15 s** — likely infinite loop |
| `boot-error` | Grading unavailable, level still readable (NFR-4) |

## 7. Progress store

```ts
// src/scripts/progress.ts
const KEY = 'dsa-guide.progress';
const VERSION = 1;

export interface Progress {
  v: number;
  levels: Record<string, {
    state: 'in-progress' | 'complete' | 'skipped';
    challenges: Record<string, boolean>;  // challenge id -> passed
    attempts: number;
    updated: string;                      // ISO
  }>;
  current: string;                        // e.g. "04"
}
```

API: `read()`, `markChallenge(levelId, challengeId, passed)`,
`markComplete(levelId)`, `markSkipped(levelId)`, `reset()`, `subscribe(fn)`.

Rules:

- **Versioning (FR-16).** On read: parse; if `v` is missing, unparseable, or
  greater than `VERSION`, discard and start empty. Never throw into the UI.
- **Storage unavailable (FR-18).** Every access is wrapped in `try/catch`.
  On failure the store degrades to an in-memory object for the session and sets
  a flag the UI surfaces once: *progress won't be saved in this browser*.
- **Writes** are debounced and fire on state change only.
- **Cross-tab**: a `storage` listener refreshes state so two open tabs agree.
- **Reset (FR-17)** requires an explicit confirmation step.

## 8. Gating

Pure, testable, no DOM:

```ts
// src/scripts/gating.ts
export type LevelState = 'locked' | 'available' | 'in-progress' | 'complete' | 'skipped';

export function stateOf(order: number, p: Progress): LevelState {
  const rec = p.levels[pad(order)];
  if (rec?.state === 'complete') return 'complete';
  if (rec?.state === 'skipped') return 'skipped';
  if (order === 1) return rec ? 'in-progress' : 'available';
  const prev = p.levels[pad(order - 1)]?.state;
  const unlocked = prev === 'complete' || prev === 'skipped';
  if (!unlocked) return 'locked';
  return rec ? 'in-progress' : 'available';
}
```

- Level 1 always available (FR-2).
- `skipped` unlocks the next level, so FR-5 cannot dead-end the campaign.
- Locked pages still render: heading, why it's locked, a link to the blocking
  level, and the manual-skip control (FR-4, FR-5).
- Gating never runs on `/` (FR-3).

Because pages are prerendered, level state is applied after hydration. To avoid
a flash of unlocked content, level bodies render with `hidden` and are revealed
by the gate script on first paint; the `<noscript>` path shows the full body
with a note that progress tracking needs JavaScript (NFR-5).

## 9. UI

**Campaign map** (`/play`) — 14 cards in order, each with number, title,
one-line summary, `kind` badge, and state pill. The suggested next level is
visually primary. Complete levels stay clickable and replayable (FR-6).

**Level page** — cold open → brief → challenge → debrief, then prev/next and
back-to-map. A persistent link to the mapped guide section sits in the header,
satisfying FR-20 in both directions.

**Challenge widget** — extends the existing runner shell: editor, `Run`
(ungraded, prints only), `Submit` (graded), `Hint`, `Reset`, and `Show
solution` (after a pass or explicit request, FR-11). Results render as a list
of test rows, not a single verdict.

New styles follow the existing token set — no new colours. Reuses
`.runner`, `.runbtn`, `.card`, `.tag`, `.pill`; adds `.level-*`, `.map-*`, and
`.test-row` with `--good` / `--danger` for pass and fail.

**Accessibility (NFR-6).** Results land in an `aria-live="polite"` region so a
screen reader hears the verdict. Test rows carry a text status, never colour
alone. The editor is reachable and escapable by keyboard (already true of the
existing runner). Map cards are real links; locked ones use `aria-disabled`
with an explanation, not `pointer-events: none`.

## 10. Edge cases

| Case | Behaviour |
| --- | --- |
| Deep link to a locked level | Renders locked state with a route forward (FR-4) |
| Deep link to an unknown level | Astro 404 |
| Progress cleared mid-session | Store re-reads empty; UI re-gates without reload |
| Reader edits code to `return True` for everything | Tests use real inputs, so this fails; not a security concern (NG1, C-4) |
| Infinite loop in submitted code | 15 s terminate; attempt counted; no crash |
| CDN unreachable | Level readable, challenge disabled with explanation (NFR-4) |
| Two tabs open | `storage` event keeps both in sync |
| Reader completes out of order via skip | `skipped` recorded distinctly; map shows it honestly |

## 11. Build and deploy

No change to the pipeline. `npm run build` runs `astro build` then
`scripts/publish-root.mjs`, which copies `dist/` to the repo root; Pages serves
from `main` / root. Story Mode adds `play/index.html` and
`play/01..14/index.html` plus one JS bundle.

Budget: the campaign JS (progress, gating, grading client) should stay under
~15 KB gzipped. Pyodide remains lazy and is never fetched by `/` or `/play`
(NFR-3).

**C-1 reminder:** built output is committed. Run `npm run build` before every
commit that touches `src/`.

## 12. Testing

- **Unit** — `gating.ts` state table across all 14 levels × every progress
  shape; `progress.ts` versioning, corruption, and storage-denied paths.
- **Content** — a build-time check that `order` values are 1–14 and unique,
  every `section` anchor exists in `guide.md`, and every id in `challenges`
  resolves to a module.
- **Challenge integrity (S2)** — for each challenge, run its `solution` against
  its `tests` and require all pass; run at least one recorded wrong approach and
  require failure. This runs in Node against Pyodide, not in CI (C-1), as a
  local `npm run verify`.
- **End-to-end** — Playwright, as used throughout this project: complete a
  level, assert the next unlocks; reload and assert progress survived; submit a
  wrong answer and assert per-test feedback; deep-link a locked level; run with
  `localStorage` blocked.
- **Regression** — the guide's existing DOM checks (component counts, no
  `pre` inside `code`, zero horizontal overflow at 390 px) must still pass.

## 13. Delivery phases

| Phase | Scope | Done when |
| --- | --- | --- |
| **1 — Skeleton** | Collection, routes, map, progress store, gating, `briefing` completion. No grading. | Levels 01–14 exist as stubs; unlock chain works and survives reload |
| **2 — Grading** | Worker `grade` path, harness, `Challenge.astro`, three real drills (02, 03, 09) | Three levels completable by passing tests; wrong answers explain themselves |
| **3 — Content** | Remaining drills, §6 gauntlet, debrief | All 14 levels completable (S1) |
| **4 — Polish** | Accessibility pass, reduced motion, 390 px pass, copy edit | NFR-6/7 verified; S3 met |

Phase 1 is deliberately shippable on its own: a working campaign shell over the
existing guide, with no grading, is already useful — and it de-risks the rest.

## 14. Traceability

| Requirement | Where |
| --- | --- |
| FR-1, FR-2, FR-6 | §8 gating, §9 map |
| FR-3, FR-19 | §1 principles, §3 routing, §8 |
| FR-4, FR-5 | §8 locked rendering, `skipped` state |
| FR-7 – FR-13 | §5 challenges, §6 grading |
| FR-14 – FR-18 | §7 progress store |
| FR-20, FR-21 | §9 level header, map `current` |
| NFR-1, C-1 | §11 build |
| NFR-3, NFR-4, NFR-9 | §6 grading, §11 budget |
| NFR-5, NFR-6 | §8 noscript, §9 accessibility |

## 15. Open items

Inherited from requirements and unresolved here: **OQ-1** (confirm the manual
skip in FR-5 — it shapes §8), **OQ-2** (§6 as one gauntlet or eight levels —
shapes the collection), **OQ-3**, **OQ-4**, **OQ-5**.

Spec-local: the `debrief` completion rule for level 14 is the least defined
part of §4 and should be settled before Phase 3.
