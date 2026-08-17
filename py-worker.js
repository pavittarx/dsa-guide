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

self.onmessage = async (event) => {
  const { type, code } = event.data || {};

  if (type === 'preload') {
    try {
      await boot();
      self.postMessage({ type: 'ready' });
    } catch (error) {
      self.postMessage({ type: 'boot-error', message: String(error && error.message ? error.message : error) });
    }
    return;
  }

  if (type !== 'run') return;

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
    await pyodide.runPythonAsync(code, { globals });
    self.postMessage({ type: 'done', ms: performance.now() - started });
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
