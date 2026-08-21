/*
 * Python runtime for the guide's runnable code blocks.
 *
 * Pyodide (CPython compiled to WebAssembly) runs here in a Web Worker rather
 * than on the main thread for one specific reason: this is a DSA guide, so
 * readers *will* write an accidental infinite loop. In a worker that only
 * wedges the worker — the page stays responsive and the main thread can
 * terminate it. On the main thread it would hard-freeze the tab.
 */

const PYODIDE_VERSION = '0.29.3';
const INDEX_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

let pyodideReady = null;

function boot() {
  if (!pyodideReady) {
    pyodideReady = (async () => {
      importScripts(`${INDEX_URL}pyodide.js`);
      const pyodide = await loadPyodide({ indexURL: INDEX_URL });
      pyodide.setStdout({ batched: (text) => self.postMessage({ type: 'out', stream: 'out', text }) });
      pyodide.setStderr({ batched: (text) => self.postMessage({ type: 'out', stream: 'err', text }) });
      return pyodide;
    })();
  }
  return pyodideReady;
}

/*
 * Grading harness. Injected ahead of the reader's code so `expect` and `under`
 * exist when the test block runs. Results are collected rather than raised, so
 * one failing case doesn't hide the rest.
 */
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
    _RESULTS.append({"label": label, "ok": _dt < seconds,
                     "actual": f"{_dt:.3f}s", "expected": f"< {seconds:.1f}s"})
`;

const TAIL = `
_RESULTS_JSON = json.dumps(_RESULTS)
`;

self.onmessage = async (event) => {
  const { type, code, tests } = event.data || {};

  if (type === 'preload') {
    try {
      await boot();
      self.postMessage({ type: 'ready' });
    } catch (error) {
      self.postMessage({ type: 'boot-error', message: String(error && error.message ? error.message : error) });
    }
    return;
  }

  if (type !== 'run' && type !== 'grade') return;

  let pyodide;
  try {
    pyodide = await boot();
    self.postMessage({ type: 'ready' });
  } catch (error) {
    self.postMessage({
      type: 'boot-error',
      message: String(error && error.message ? error.message : error),
    });
    return;
  }

  // Each run gets a fresh globals dict, so one block can't leak names into
  // the next — every block behaves like its own little script.
  const globals = pyodide.toPy({});
  const started = performance.now();
  try {
    if (type === 'grade') {
      await pyodide.runPythonAsync(HARNESS + '\n' + code + '\n' + tests + TAIL, { globals });
      const raw = globals.get('_RESULTS_JSON');
      self.postMessage({
        type: 'graded',
        results: JSON.parse(raw || '[]'),
        ms: performance.now() - started,
      });
    } else {
      await pyodide.runPythonAsync(code, { globals });
      self.postMessage({ type: 'done', ms: performance.now() - started });
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      message: String(error && error.message ? error.message : error),
      ms: performance.now() - started,
    });
  } finally {
    globals.destroy();
  }
};
