# DSA Course

**Requirements**
Status: draft for review · Owner: pavittarx · Last updated: 2026-08-21
Supersedes the "Story Mode" draft, which mapped levels 1:1 onto the guide's
sections and therefore inherited the structural problem described below.

---

## 1. Problem

The existing guide is a **reference**, and it is a good one. It is not a course,
and using it as one fails in five specific ways:

- **Nothing builds.** Sections are organized by topic, not by dependency. You
  can read them in almost any order, which means none of them require the last.
- **Nothing remains.** §1 tells the reader to come back on day 3 and day 7. The
  page does nothing to make that happen.
- **Practice is one-shot.** §6 is **24% of the guide**, contains **all eight
  patterns**, and carries **eight self-tests — one per pattern**. One item is
  enough to recognise a skill you already have, not to acquire one.
- **No composition.** Every worked example is single-pattern. The only composite
  problem in the guide (Subarray Sum Equals K) appears as a parenthetical in a
  problem list and is never taught.
- **No transfer.** §7's trigger table names the pattern for you. Choosing the
  pattern when nothing is labelled is the actual skill, and it is never trained.

The result reads as a top-level reference for a veteran rather than a path for
someone starting out.

## 2. What we're building

A **course**: a dependency-ordered spine of units, each teaching one skill,
each practised in varied forms, with earlier material deliberately resurfaced.
Problems are drawn from the canonical lists (Blind 75, NeetCode 150, Grind 75,
with Codeforces for stretch), and each unit's core problem is taught as an
**approach ladder** — brute force first, then what's wrong with it, then better,
then optimal — never as a finished answer.

The existing guide's material is an asset, not a casualty: its explanations,
invariants, gotchas, and case studies are **reused as the depth layer** the
course links into. Reuse means adapt: material may be rewritten, expanded, or
resequenced wherever it is too terse for a starter — nothing needs to be carried
over verbatim. Restructuring the guide page itself is deferred; it stays live
and unchanged for now.

Two pieces of it are explicitly **promoted, not merely linked** — the §5
toolkit table and the §4 "three moves" frame. They are the best overview in the
guide and the course embeds them as a live surface (§4.3) rather than leaving
them behind on a page the reader has to go find.

Narrative framing (the on-call engineer) sits on top as motivation for each
unit, subordinate to the pedagogy.

## 3. Goals

- **G1 · Builds** — Units form a dependency chain. Each unit requires the last.
- **G2 · Remains** — Retention is a mechanism, not an instruction: solved work
  returns on a schedule.
- **G3 · Varies** — Every skill is met in several superficially different
  problems, so the reader learns the deep structure rather than a template.
- **G4 · Composes** — Boss levels require two or more skills at once.
- **G5 · Transfers** — Every unit ends with a problem whose pattern is not named.
- **G6 · Derives** — Solutions are built from a slow version, never presented
  finished.
- **G7** — Stay static and free to run (no server, no accounts).
- **G8** — Never trap a learner; the reference is always reachable.

### Non-goals

- **NG1** — Not an assessment tool. Tests ship to the browser and are readable;
  acceptable (C-4).
- **NG2** — Not a replacement for volume practice on the original platforms. We
  teach recognition, derivation, and judgement, then send the reader there.
- **NG3** — Not a rewrite of the guide (deferred, §2).
- **NG4** — Not multiplayer, social, or leaderboard-driven.

## 4. The spine

Nineteen units in dependency order, plus four boss levels. **Core (v1)** is
units 00–14 and B1–B4; the **extension track** is v2.

| # | Unit | Requires |
| --- | --- | --- |
| 00 | Cost intuition — measure it, feel the scale table | — |
| 01 | Hashing & counting | 00 |
| 02 | Two pointers | 01 |
| 03 | Sliding window: fixed → variable | 02 |
| 04 | Prefix sums | 01 |
| **B1** | **Boss — Subarray Sum = K · Minimum Window Substring** | 01–04 |
| 05 | Binary search on arrays | 00 |
| 06 | Binary search **on the answer** (a separate skill) | 05 |
| 07 | Stacks → monotonic stack | 03 |
| 08 | Heaps & top-k | 01 |
| **B2** | **Boss — Sliding Window Maximum · Top-K Frequent** | 05–08 |
| 09 | Linked lists | 02 |
| 10 | Trees & traversal | 09 |
| 11 | Graphs: BFS | 10 |
| 12 | DFS & topological sort | 11 |
| **B3** | **Boss — Course Schedule II · Word Ladder** | 09–12 |
| 13 | DP: memoisation (top-down) | 01 |
| 14 | DP: tabulation, 2-D, space reduction | 13 |
| **B4** | **Capstone — LRU Cache (hash + linked list)** | all core |
| 15 | Intervals | 02 |
| 16 | Backtracking | 12 |
| 17 | Tries & union-find | 12 |
| 18 | Greedy & bit manipulation | 14 |

> Splitting **binary search on the answer** (06) from binary search (05) is
> deliberate: the guide already notes it is "the technique worth real study" and
> that most people meet it as a magic trick. It needs its own unit.

### 4.1 The unit loop

Every unit runs the same seven slots. Slots 5, 7, and 8 are the ones absent
from the guide today.

| Slot | Content |
| --- | --- |
| 1 · Motivate | The incident this skill would have prevented |
| 2 · Derive | The approach ladder (§4.2) — brute → optimal |
| 3 · Invariant | What stays true each iteration (reused from the guide) |
| 4 · Guided | One problem with hints available |
| 5 · **Varied** | **3 problems that look different, same skill** |
| 6 · Failure modes | The bugs specific to this skill, placed where they bite |
| 7 · **Retrieval** | **2 problems from earlier units** |
| 8 · **Transfer** | **1 problem with no pattern named** |

Seven practice problems per unit → **≈105 for the core track**, plus boss levels.

### 4.2 Approach ladders

The **guided** problem in each unit and every boss problem are taught as a
ladder. Varied, retrieval, and transfer problems get a single reference
solution plus hints — laddering all 105 would be unreasonable and unnecessary.
That is ~19 ladders in the core track.

Each rung is runnable and timed in the browser, so the cost difference is
observed rather than asserted:

| Rung | Must include |
| --- | --- |
| Brute force | Working code, its complexity, and the n at which it dies |
| Why it fails | The specific repeated work, named |
| Better | The intermediate step, where one exists |
| Optimal | The final approach and what it traded (usually memory) |
| When brute wins | The n below which the simple version is the right answer |

That last rung matters: the guide is already clear that a bounded, small n makes
the nested loop the correct engineering choice, and the course must not train
readers out of that judgement.

### 4.3 The Inventory (promoted from §4–§5)

The guide's toolkit table — eleven primitives with their cost, their purpose,
and which of the three moves they serve — is the single best overview it has.
It is preserved, but not as a static table on a page the reader must go find:

- **FR-I1** — An **Inventory** surface is reachable from every unit and from the
  course map, listing each primitive with cost, what it's actually for, and its
  move (`remember` / `order` / `once` / `structural`).
- **FR-I2** — Each entry links to the unit that teaches it and shows the
  reader's state for that unit, so the overview doubles as a progress view.
- **FR-I3** — Entries are **revised, not copied**. A table row cannot teach a
  heap; each entry carries a worked micro-example and the one mistake people
  make with it. Wording may be rewritten freely wherever the guide's version is
  too terse for a starter.
- **FR-I4** — Entries for unlocked skills are presented as available tools;
  locked ones are visible but marked, so the reader can always see the shape of
  what's coming.
- **FR-I5** — The "three moves" frame (`remember`, `order`, `once`) is the
  Inventory's organising axis and is taught in unit 00, not left as a late
  section.

## 5. Problem sourcing

- **FR-S1** — The canonical lists (Blind 75, NeetCode 150, Grind 75, with
  Codeforces for stretch) are used **as reference for which skills and problem
  shapes matter** — not as a set to reproduce.
- **FR-S2** — **We author our own problems.** Statements from LeetCode,
  Codeforces, and similar platforms are copyrighted and are never copied.
  Following a curated list of problem *titles* is fine; reproducing problem
  *text* is not. Where a canonical problem is the clearest vehicle for a skill,
  we write our own statement for it — usually recast into the course's
  production framing (a rate limiter, a lookup service) rather than an abstract
  array puzzle.
- **FR-S3** — Every problem links out to its canonical source so the reader can
  read the original statement and submit there.
- **FR-S4** — All test cases are authored by us.
- **FR-S5** — Codeforces items are marked as such: different I/O conventions and
  a heavier math/ad-hoc skew make them useful for "no pattern named" practice
  and poor as a unit's first exposure.

## 6. Functional requirements

### Progression

- **FR-1** — Units are presented in the order in §4 with their stated
  dependencies.
- **FR-2** — Unit 00 is always available. Unit *N* unlocks when its dependencies
  are complete.
- **FR-3** — The reference guide is **never** gated (G8).
- **FR-4** — A locked unit renders an explanation and a link to what unlocks it.
- **FR-5** — A stuck reader can unlock the next unit manually from the locked
  page. It is recorded as `skipped`, not `completed`. — **confirm**
- **FR-6** — A unit completes when its guided problem, all varied problems, and
  its transfer problem pass. Retrieval problems count toward the return set, not
  toward unit completion.
- **FR-7** — A course map shows every unit's state and the suggested next step.

### Practice

- **FR-8** — Problems run and are graded in the browser (existing Pyodide
  runner).
- **FR-9** — Failures report the failing input, expected, and actual per test.
- **FR-10** — Hints are available on demand; solutions only after a pass or an
  explicit request.
- **FR-11** — Attempts are counted, never framed punitively.
- **FR-12** — Approach-ladder rungs are individually runnable and timed, so the
  reader sees brute force die at scale rather than being told it does.
- **FR-13** — Transfer problems display no pattern name, no unit tag, and no
  trigger-table hint until solved or revealed.

### Retention

- **FR-14** — A solved problem enters the **return set**, scheduled at ~1, 3,
  and 7 days.
- **FR-15** — A `/review` surface lists what is due, with counts.
- **FR-16** — Answering a returned problem correctly advances its interval;
  failing it resets to the first interval.
- **FR-17** — The return set never blocks progression through the spine.
- **FR-18** — Overdue items accumulate without penalty or guilt framing.

### Progress

- **FR-19** — Progress and scheduling persist in `localStorage`.
- **FR-20** — The store is versioned; unreadable or future-versioned data resets
  to empty rather than throwing.
- **FR-21** — With storage unavailable, the course runs for the session and says
  progress won't be saved.
- **FR-22** — Progress can be reset behind a confirmation.
- **FR-23** — The guide's existing behaviour is unchanged when the course is
  never opened.

## 7. Non-functional requirements

- **NFR-1 · Static** — Builds to static files served from the repo root by
  GitHub Pages. No server, database, or auth.
- **NFR-2 · Privacy** — No telemetry or analytics. Progress never leaves the
  browser. The only third-party request is the Pyodide CDN fetch.
- **NFR-3 · Performance** — Map, unit, and review pages render without loading
  Pyodide; the runtime loads only when a problem is opened.
- **NFR-4 · Resilience** — If the CDN is unreachable, units still read and
  grading explains it is unavailable.
- **NFR-5 · Progressive enhancement** — The guide renders fully without
  JavaScript. The course may require it, and must say so rather than render
  blank.
- **NFR-6 · Accessibility** — Keyboard operable, visible focus, results
  announced to assistive technology, honours `prefers-reduced-motion`, contrast
  met in both themes.
- **NFR-7 · Responsive** — No horizontal overflow at 390 px.
- **NFR-8 · Consistency** — Existing design tokens and components only.
- **NFR-9 · Safety** — Reader code runs in a Web Worker with a hard timeout.

## 8. Constraints

- **C-1** — GitHub Pages, "deploy from a branch → root"; build output is
  committed; no CI build (the token lacks `workflow` scope), so `npm run build`
  runs locally before commit.
- **C-2** — Python only (Pyodide, stdlib).
- **C-3** — Markdown with inline HTML, including the blank-line rule in the
  README.
- **C-4** — Tests ship to the browser and are readable. Accepted (NG1).
- **C-5** — First run downloads ≈7 MB of runtime.
- **C-6** — Content volume is the dominant cost: ~105 problems × (own-words
  statement + tests + hints + reference solution) plus ~19 approach ladders.
  This is 3–5× the guide's existing content and is mostly new writing.

## 9. Success measures

- **S1** — A reader who has not seen the answers can complete units 00–02 and
  correctly solve their transfer problems.
- **S2** — Every challenge's tests pass its reference solution and fail a
  plausible wrong approach — in particular, quadratic solutions fail the scale
  tests wherever the unit is about complexity.
- **S3** — Every ladder's brute-force rung visibly dies at the stated n in the
  browser.
- **S4** — Returned problems actually resurface at the right time across a
  simulated 7-day clock.
- **S5** — The guide's existing rendering is unchanged (existing DOM checks).

## 10. Risks

| Risk | Mitigation |
| --- | --- |
| Content volume never gets finished (C-6) | Phase 1 ships units 00–02 complete, end to end, before scaling |
| Copyright exposure from problem text | FR-S2/S3/S4 — own words, link out, own tests |
| Spine grows into a second LeetCode | Core track is fixed at 00–14; extension is explicitly v2 |
| Varied problems are varied in name only | Each unit's varied set must include at least one problem from a different domain (a real system, not an array puzzle) |
| Scheduler feels like a chore | FR-17/18 — never blocks, never guilts |
| Ladders bloat every problem | Only guided + boss problems get ladders (§4.2) |

## 11. Open questions

- **OQ-1** — Confirm **FR-5** (manual skip), which softens the gating.
- **OQ-2** — Do retrieval slots pull automatically from the return set, or are
  they hand-picked per unit?
- **OQ-3** — Does the course live at `/learn` alongside the guide, or become the
  site root with the guide moving to `/reference`?
- **OQ-4** — Extension units 15–18: committed for v2, or dropped?
- **OQ-5** — Should ladders be gated (must run brute force before seeing
  optimal), or freely browsable?

---

*Next: [the specification](./spec.md).*
