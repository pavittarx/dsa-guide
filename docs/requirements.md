# DSA Guide — Story Mode

**Requirements**
Status: draft for review · Owner: pavittarx · Last updated: 2026-08-21

---

## 1. Problem

The guide is good at teaching and bad at making people *practise*. It says so
itself: "Reading it end to end will feel productive and teach you almost
nothing." It already builds in prediction prompts, hidden self-tests, and a
spaced-repetition nudge — but nothing verifies any of it happened. A reader can
scroll to the end in forty minutes, feel informed, and retain nothing. That is
the exact failure the guide warns about, and today the page has no mechanism to
prevent it.

Meanwhile the site now runs real Python in the browser. The missing piece is a
reason to use it: a structure that asks the reader to *do* something, checks
whether it worked, and remembers.

## 2. What we're building

A **campaign** layered over the existing guide. The reader plays an engineer
who has just joined a company; each level is an incident, a ticket, or a code
review where the wrong data structure is quietly costing money. The teaching
material is the reference manual they consult to survive the shift.

The guide keeps working exactly as it does today. Story Mode is additive.

## 3. Goals

- **G1** — Convert passive reading into verified practice: the reader writes or
  fixes code and something checks it.
- **G2** — Give the material a spine, so "where am I / what's next" is always
  answerable.
- **G3** — Preserve the guide's credibility. The audience is working engineers
  and interview candidates; the fiction must never make the content feel junior.
- **G4** — Stay a static site. No server, no accounts, no running costs.
- **G5** — Never trap a learner. Someone who is stuck must always be able to
  reach the teaching material.

### Non-goals

- **NG1** — Not an assessment tool. No proctoring, no anti-cheat, no scores that
  claim to measure competence. Test code ships to the browser and is readable;
  that is acceptable (§8, C-4).
- **NG2** — Not a replacement for LeetCode-style volume practice. The campaign
  teaches *recognition and judgement*; grinding problems happens elsewhere.
- **NG3** — Not multiplayer, social, or leaderboard-driven.
- **NG4** — Not a rewrite of the guide's prose.

## 4. Audience

| Reader | Arrives wanting | Story Mode must |
| --- | --- | --- |
| **Interview candidate** | Pattern fluency under time pressure | Provide graded drills with visible progress |
| **Working engineer** | To stop shipping accidental O(n²) | Frame everything in production terms, allow topic-jumping |
| **Returning reader** | The one thing they forgot | Never gate the reference; make §14 reachable in one click |

## 5. Structure

### 5.1 Fourteen levels, one per section

Level *N* maps 1:1 to guide section *N*. The sections differ wildly in shape, so
levels are **typed** rather than split or merged:

| Type | Completion | Used for |
| --- | --- | --- |
| `briefing` | Read and acknowledge | Framing material with nothing to execute |
| `drill` | Pass the challenge's tests | Standard teaching level |
| `gauntlet` | Pass *k* of *n* sub-challenges | §6, which holds all eight patterns |
| `debrief` | Answer recall prompts | Consolidation |

| # | Section | Level title | Type |
| --- | --- | --- | --- |
| 01 | How to read this | Day one | `briefing` |
| 02 | What DSA catches | The postmortem | `drill` |
| 03 | Cost intuition | Back-of-envelope | `drill` |
| 04 | The three moves | Three tools on the belt | `drill` |
| 05 | The toolkit | Inventory | `drill` |
| 06 | The eight patterns | The gauntlet | `gauntlet` |
| 07 | Trigger table | Triage | `drill` |
| 08 | Gotchas | Landmines | `drill` |
| 09 | Case studies | Three incidents | `drill` |
| 10 | Reviewing AI's code | Review duty | `drill` |
| 11 | AI as tutor | Pairing | `briefing` |
| 12 | Six-week plan | The rotation | `briefing` |
| 13 | The interview | The panel | `drill` |
| 14 | Recall card | The runbook | `debrief` |

> **Note on §6.** It is roughly a third of the guide and carries all eight
> patterns. As one level it is far heavier than any other. It is modelled as a
> `gauntlet` with eight independently-tracked sub-challenges and its own
> internal progress, so a reader can leave and return mid-level. If it proves
> unwieldy in practice, splitting it into 06a–06h is the first thing to
> reconsider — flagged as **OQ-2**.

### 5.2 Level anatomy

1. **Cold open** — the incident, rendered with the guide's existing
   `.card` + `.tag` callout (no new component).
2. **Briefing** — what to go learn, linking into the reference section.
3. **Challenge** — starter code in the existing runner, graded against tests.
4. **Debrief** — what the level was really teaching, and the pattern name.

## 6. Functional requirements

### Progression

- **FR-1** — The campaign presents 14 levels in fixed order.
- **FR-2** — Level 1 is always unlocked. Level *N* unlocks when level *N−1* is
  complete.
- **FR-3** — The reference guide is **never** gated. Every section is reachable
  at any time, directly and from any level, with no completion check.
- **FR-4** — A locked level shows what unlocks it and links to the level that
  does, rather than 404ing or silently redirecting.
- **FR-5** — A stuck reader can unlock the next level manually, from the locked
  level's own page, without clearing progress. The action is deliberate and
  labelled as skipping, and the level is recorded as `skipped`, not `completed`.
  *Rationale: G5. Hard gating's failure mode is a wall; this keeps the ordering
  meaningful without letting one bad challenge end the campaign.* — **confirm**
- **FR-6** — A campaign map shows every level with state: `locked`, `available`,
  `in progress`, `complete`, `skipped`, and marks the suggested next level.

### Challenges

- **FR-7** — A challenge presents starter code in the existing editor and runs
  it against test cases in Pyodide.
- **FR-8** — Results report per-test pass/fail with the failing input, the
  expected value, and the actual value. A bare "wrong" is not acceptable.
- **FR-9** — A challenge passes only when every required test passes. Passing
  marks the level complete.
- **FR-10** — Attempts are unlimited and counted. Counting must never be framed
  punitively.
- **FR-11** — A hint is available on demand, and the worked solution after
  either a pass or an explicit "show me" — never auto-revealed on failure.
- **FR-12** — Runtime errors (syntax, exception, timeout) are reported as
  outcomes with the traceback, distinct from test failures.
- **FR-13** — `gauntlet` sub-challenges are tracked and resumable individually.

### Progress

- **FR-14** — Progress persists in `localStorage` on the reader's device.
- **FR-15** — Progress survives reload, navigation, and site redeploys.
- **FR-16** — Progress is versioned and migrated forward; an unreadable or
  future-versioned record resets to empty rather than throwing.
- **FR-17** — The reader can reset all progress, behind a confirmation.
- **FR-18** — With `localStorage` unavailable (private mode, blocked storage),
  the campaign still runs for the session and says progress won't be saved.
- **FR-19** — The guide's existing behaviour is unchanged when Story Mode is
  never opened.

### Entry points

- **FR-20** — The guide links to the campaign, and each level links back to its
  section. Neither is a dead end.
- **FR-21** — Returning readers land on their current level from the campaign
  entry point.

## 7. Non-functional requirements

- **NFR-1 · Static** — Builds to static files served from the repo root by
  GitHub Pages. No server, database, or auth. (G4)
- **NFR-2 · Privacy** — No telemetry, no analytics, no network calls carrying
  reader data. Progress never leaves the browser. The only third-party request
  is the Pyodide CDN fetch.
- **NFR-3 · Performance** — The campaign map and level pages must render without
  loading Pyodide. The runtime loads only when a reader opens a challenge.
- **NFR-4 · Resilience** — If the Pyodide CDN is unreachable, levels still read
  and the challenge explains that grading is unavailable.
- **NFR-5 · Progressive enhancement** — The reference guide must render and be
  fully readable with JavaScript disabled. Story Mode may require JavaScript;
  it must say so rather than render blank.
- **NFR-6 · Accessibility** — Keyboard-operable throughout; visible focus;
  pass/fail announced to assistive technology; honours
  `prefers-reduced-motion`; meets contrast in both themes.
- **NFR-7 · Responsive** — Works at 390 px with no horizontal overflow, matching
  the standard already met by the guide.
- **NFR-8 · Visual consistency** — Uses the existing design tokens and
  components. Story Mode must look like the same product.
- **NFR-9 · Safety** — Reader code runs in a Web Worker with a hard timeout, as
  the existing runner does.

## 8. Constraints and assumptions

- **C-1** — Hosting is GitHub Pages, "deploy from a branch → root". Build output
  is committed. No CI build step is available (the session token lacks
  `workflow` scope), so `npm run build` is run locally before commit.
- **C-2** — Python only. Pyodide ships CPython; every existing snippet is
  stdlib-only.
- **C-3** — Content authoring is Markdown with inline HTML, per the existing
  pipeline, including the blank-line rule documented in the README.
- **C-4** — Test code is delivered to the browser and is therefore readable by a
  determined reader. Accepted: this is a learning tool, not an exam (NG1).
- **C-5** — First challenge run downloads ≈7 MB of runtime. Mitigated by
  warming, but unavoidable on first use.

## 9. Success measures

Given NFR-2 forbids telemetry, these are evaluated by hand, not dashboards:

- **S1** — All 14 levels are completable start to finish by someone who has not
  seen the answers.
- **S2** — Every challenge's tests pass against its own reference solution and
  fail against at least one plausible wrong approach — in particular, quadratic
  solutions must fail the scale tests where the level is about complexity.
- **S3** — Time from landing to first executed challenge is under 60 seconds on
  a warm cache.
- **S4** — The guide's existing reading experience is unchanged: same render,
  no regressions in the checks already in place.

## 10. Risks

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Fiction undercuts credibility (G3) | Core audience disengages | Keep incidents realistic and short; the cold opens stay in the existing voice; no fantasy elements |
| §6 is too big as one level | Reader stalls two-thirds through | Sub-challenge tracking and resumability; split as a fallback (OQ-2) |
| Challenge tests are wrong or brittle | Reader blocked by our bug | S2 required before ship; FR-5 escape hatch; tests accept any correct approach, never a specific implementation |
| Scope creep into a platform | Never ships | Phase 1 is the campaign shell plus three levels, then reassess |
| Pyodide payload deters casual readers | Bounce before first run | NFR-3 defers loading; the guide itself never needs it |

## 11. Open questions

- **OQ-1** — Confirm **FR-5** (manual skip). It softens the gating you chose; it
  exists to prevent dead-ends. Keep, or enforce strict unlock-by-completion?
- **OQ-2** — Does §6 stay one `gauntlet` level, or split into 06a–06h if it
  proves unwieldy?
- **OQ-3** — Do `briefing` levels (01, 11, 12) need any check at all, or is
  "continue" enough to mark them done?
- **OQ-4** — Should the campaign live at `/play` on this site, or eventually as
  its own deployment?
- **OQ-5** — How many challenges per `drill` — exactly one, or one required plus
  optional extras?

---

*Next: the technical specification, which implements these requirements.*
