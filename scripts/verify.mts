/*
 * Problem integrity check (requirements S2, S3).
 *
 *   npm run verify
 *
 * For every problem:
 *   1. the reference solution must pass all of its own tests,
 *   2. the recorded wrong approach must FAIL at least one test,
 *   3. every complexity gate must clear the reference time by >= 50x, so a
 *      correct solution can never fail it on a slow machine (spec 6.3).
 *
 * Runs locally rather than in CI: this repo has no CI build (constraint C-1).
 */

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createRequire } from 'node:module';
import { ALL } from '../src/problems/index.js';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const PYODIDE_DIR = path.resolve(here, '../.verify/pyodide');

const HARNESS = `
import json, time
_RESULTS = []

def expect(actual, expected, label):
    _RESULTS.append({"label": label, "ok": actual == expected,
                     "actual": repr(actual)[:200], "expected": repr(expected)[:200]})

def under(seconds, label, fn):
    _t = time.perf_counter()
    fn()
    _dt = time.perf_counter() - _t
    _RESULTS.append({"label": label, "ok": _dt < seconds, "seconds": seconds, "took": _dt,
                     "actual": f"{_dt:.3f}s", "expected": f"< {seconds:.1f}s"})
`;
const TAIL = `\n_RESULTS_JSON = json.dumps(_RESULTS)\n`;

interface Result { label: string; ok: boolean; actual: string; expected: string; seconds?: number; took?: number }

const { loadPyodide } = require(path.join(PYODIDE_DIR, 'pyodide.js'));
const pyodide = await loadPyodide({ indexURL: PYODIDE_DIR + path.sep });
pyodide.setStdout({ batched: () => {} });
pyodide.setStderr({ batched: () => {} });

async function run(code: string, tests: string): Promise<Result[] | { error: string }> {
  const globals = pyodide.toPy({});
  try {
    await pyodide.runPythonAsync(HARNESS + '\n' + code + '\n' + tests + TAIL, { globals });
    return JSON.parse(globals.get('_RESULTS_JSON') || '[]');
  } catch (e: any) {
    return { error: String(e?.message ?? e).split('\n').slice(-3).join(' ') };
  } finally {
    globals.destroy();
  }
}

let failures = 0;
const MIN_MARGIN = 50;

for (const p of ALL) {
  const out: string[] = [];

  // 1 — reference solution must pass everything
  const solved = await run(p.solution, p.tests);
  if ('error' in solved) {
    out.push(`   solution raised: ${solved.error}`);
    failures++;
  } else {
    const bad = solved.filter((r) => !r.ok);
    if (bad.length) {
      failures++;
      bad.forEach((b) => out.push(`   solution fails "${b.label}" — expected ${b.expected}, got ${b.actual}`));
    }

    // 3 — complexity gates need a wide margin so they never flake
    for (const r of solved) {
      if (r.seconds === undefined || r.took === undefined) continue;
      const margin = r.took > 0 ? r.seconds / r.took : Infinity;
      const note = `   gate "${r.label}": ref ${r.took.toFixed(3)}s vs limit ${r.seconds}s → ${margin === Infinity ? '∞' : margin.toFixed(0)}× margin`;
      if (margin < MIN_MARGIN) { failures++; out.push(note + `  ← TOO TIGHT (need ${MIN_MARGIN}×)`); }
      else out.push(note);
    }
  }

  // 2 — a plausible wrong approach must be caught
  if (p.wrongApproach) {
    const wrong = await run(p.wrongApproach, p.tests);
    if ('error' in wrong) {
      out.push(`   wrong approach raised (counts as caught): ${wrong.error.slice(0, 60)}`);
    } else if (wrong.every((r) => r.ok)) {
      failures++;
      out.push('   wrong approach PASSED — the tests do not discriminate');
    } else {
      const caught = wrong.filter((r) => !r.ok).map((r) => r.label);
      out.push(`   wrong approach caught by: ${caught.join(', ')}`);
    }
  } else {
    out.push('   no wrongApproach recorded');
  }

  const ok = !out.some((l) => l.includes('TOO TIGHT') || l.includes('PASSED —') || l.includes('raised:') || l.includes('fails'));
  console.log(`${ok ? '✅' : '❌'} ${p.id}`);
  out.forEach((l) => console.log(l));
}

console.log(failures === 0 ? '\nAll problems verified.' : `\n${failures} problem(s) need attention.`);
process.exit(failures === 0 ? 0 : 1);
