/*
 * Problem integrity check (requirements S2, S3).
 *
 *   npm run verify              all languages
 *   npm run verify -- python    just one
 *
 * For every problem, in every language it has been written in:
 *   1. the reference solution must pass all of its own tests,
 *   2. the recorded wrong approach must FAIL at least one test,
 *   3. every complexity gate must clear the reference time by >= 50x.
 *
 * Python and JavaScript run locally. C++ is compiled by Wandbox over the
 * network, so those checks are slower and need a connection — and carry no
 * timing gates, because a shared public box cannot meet the margin rule.
 *
 * Runs locally rather than in CI: this repo has no CI build (constraint C-1).
 */

import { fileURLToPath } from 'node:url';
import path from 'node:path';
import vm from 'node:vm';
import { createRequire } from 'node:module';
import { ALL, langsOf, implOf } from '../src/problems/index.js';
import type { Lang } from '../src/problems/_types.js';
import { JS_HARNESS, CPP_HARNESS, CPP_RESULT_MARKER, cppMain } from '../src/scripts/harnesses.js';

const require = createRequire(import.meta.url);
const here = path.dirname(fileURLToPath(import.meta.url));
const PYODIDE_DIR = path.resolve(here, '../.verify/pyodide');
const WANDBOX_URL = 'https://wandbox.org/api/compile.json';

const only = process.argv.slice(2).filter((a) => !a.startsWith('-')) as Lang[];
const wanted = (l: Lang) => only.length === 0 || only.includes(l);

interface Result { label: string; ok: boolean; actual: string; expected: string; seconds?: number; took?: number }
type Run = Result[] | { error: string };

const PY_HARNESS = `
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

// ---- python ---------------------------------------------------------------
let pyodide: any = null;
async function runPython(code: string, tests: string): Promise<Run> {
  if (!pyodide) {
    const { loadPyodide } = require(path.join(PYODIDE_DIR, 'pyodide.js'));
    pyodide = await loadPyodide({ indexURL: PYODIDE_DIR + path.sep });
    pyodide.setStdout({ batched: () => {} });
    pyodide.setStderr({ batched: () => {} });
  }
  const globals = pyodide.toPy({});
  try {
    await pyodide.runPythonAsync(
      PY_HARNESS + '\n' + code + '\n' + tests + '\n_RESULTS_JSON = json.dumps(_RESULTS)\n',
      { globals },
    );
    return JSON.parse(globals.get('_RESULTS_JSON') || '[]');
  } catch (e: any) {
    return { error: String(e?.message ?? e).split('\n').slice(-3).join(' ') };
  } finally {
    globals.destroy();
  }
}

// ---- javascript -----------------------------------------------------------
// The browser harness times with performance.now(); give the sandbox one too.
const JS_SHIM = 'const performance = { now: () => Number(process.hrtime.bigint() / 1000n) / 1000 };\n';

async function runJs(code: string, tests: string): Promise<Run> {
  try {
    const src = `${JS_SHIM}${JS_HARNESS}\n${code}\n${tests}\n_RESULTS;`;
    const ctx = vm.createContext({ process, console: { log() {}, error() {} } });
    const raw = vm.runInContext(src, ctx, { timeout: 120_000 });
    // seconds/took aren't exposed by the browser harness, so re-derive the
    // margin from the strings it does produce.
    return (raw as any[]).map((r) => {
      const took = /^([\d.]+)s$/.exec(r.actual)?.[1];
      const limit = /^< ([\d.]+)s$/.exec(r.expected)?.[1];
      return took && limit ? { ...r, took: Number(took), seconds: Number(limit) } : r;
    });
  } catch (e: any) {
    return { error: String(e?.message ?? e).split('\n').slice(0, 2).join(' ') };
  }
}

// ---- c++ ------------------------------------------------------------------
async function runCpp(code: string, tests: string): Promise<Run> {
  const program = CPP_HARNESS + '\n' + code + '\n' + cppMain(tests);
  let payload: any;
  try {
    const res = await fetch(WANDBOX_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: program,
        compiler: 'gcc-head',
        // No 'warning' flag: with it, compiler_error carries warnings too
        // and a clean compile looks like a failure.
        options: '',
        // Wandbox splits raw options on newlines, not spaces.
        'compiler-option-raw': '-O2\n-std=c++17',
      }),
      signal: AbortSignal.timeout(90_000),
    });
    if (!res.ok) return { error: `compiler service ${res.status}` };
    payload = await res.json();
  } catch (e: any) {
    return { error: `network: ${String(e?.message ?? e).slice(0, 80)}` };
  }
  if (payload.compiler_error) {
    return { error: 'compile: ' + String(payload.compiler_error).split('\n').filter((l: string) => l.includes('error')).slice(0, 2).join(' | ').slice(0, 200) };
  }
  const stdout: string = payload.program_output ?? '';
  const at = stdout.indexOf(CPP_RESULT_MARKER);
  if (at < 0) return { error: 'no results marker: ' + (payload.program_error || stdout).slice(0, 120) };
  try {
    return JSON.parse(stdout.slice(at + CPP_RESULT_MARKER.length).trim());
  } catch {
    return { error: 'unparseable results' };
  }
}

const RUNNERS: Record<Lang, (c: string, t: string) => Promise<Run>> = {
  python: runPython,
  javascript: runJs,
  cpp: runCpp,
};

// ---- drive ----------------------------------------------------------------
let failures = 0;
const MIN_MARGIN = 50;

for (const p of ALL) {
  for (const lang of langsOf(p)) {
    if (!wanted(lang)) continue;
    const impl = implOf(p, lang);
    const notes: string[] = [];
    let bad = false;

    const solved = await RUNNERS[lang](impl.solution, impl.tests);
    if ('error' in solved) {
      notes.push(`   solution failed to run: ${solved.error}`);
      bad = true;
    } else {
      for (const r of solved.filter((x) => !x.ok)) {
        notes.push(`   solution fails "${r.label}" — expected ${r.expected}, got ${r.actual}`);
        bad = true;
      }
      for (const r of solved) {
        if (r.seconds === undefined || r.took === undefined) continue;
        const margin = r.took > 0 ? r.seconds / r.took : Infinity;
        const line = `   gate "${r.label}": ref ${r.took.toFixed(3)}s vs limit ${r.seconds}s → ${margin === Infinity ? '∞' : margin.toFixed(0)}×`;
        if (margin < MIN_MARGIN) { notes.push(line + `  ← TOO TIGHT (need ${MIN_MARGIN}×)`); bad = true; }
        else notes.push(line);
      }
    }

    if (impl.wrongApproach) {
      const wrong = await RUNNERS[lang](impl.wrongApproach, impl.tests);
      if ('error' in wrong) notes.push(`   wrong approach rejected at runtime (counts as caught)`);
      else if (wrong.every((r) => r.ok)) { notes.push('   wrong approach PASSED — the tests do not discriminate'); bad = true; }
      else notes.push(`   wrong approach caught by: ${wrong.filter((r) => !r.ok).map((r) => r.label).join(', ')}`);
    } else {
      notes.push('   no wrongApproach recorded');
    }

    if (bad) failures++;
    console.log(`${bad ? '❌' : '✅'} ${p.id} [${lang}]`);
    notes.forEach((n) => console.log(n));
  }
}

console.log(failures === 0 ? '\nAll problems verified.' : `\n${failures} problem/language pair(s) need attention.`);
process.exit(failures === 0 ? 0 : 1);
