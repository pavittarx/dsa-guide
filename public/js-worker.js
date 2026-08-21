/*
 * JavaScript runtime for the course.
 *
 * Runs in a Worker for the same reason the Python one does: a reader's
 * accidental `while (true) {}` only wedges the worker, leaving the page
 * responsive and killable. No runtime download — the browser already has JS.
 */

self.onmessage = (event) => {
  const { type, code, tests, harness } = event.data || {};
  if (type !== 'run' && type !== 'grade') return;

  // Route console output back so `console.log` behaves like Python's print.
  const say = (text, stream) => self.postMessage({ type: 'out', stream, text: String(text) });
  const fmt = (args) =>
    args
      .map((a) => {
        if (typeof a === 'string') return a;
        try {
          return JSON.stringify(a) ?? String(a);
        } catch {
          return String(a);
        }
      })
      .join(' ');
  console.log = (...a) => say(fmt(a), 'out');
  console.error = (...a) => say(fmt(a), 'err');
  console.warn = console.error;

  const started = performance.now();
  try {
    if (type === 'grade') {
      // Harness + reader's code + tests, evaluated together; the trailing
      // expression hands the collected results back.
      const body = `${harness}\n${code}\n${tests}\n;return _RESULTS;`;
      const results = Function(body)();
      self.postMessage({ type: 'graded', results, ms: performance.now() - started });
    } else {
      Function(`${code}`)();
      self.postMessage({ type: 'done', ms: performance.now() - started });
    }
  } catch (error) {
    self.postMessage({
      type: 'error',
      message: String((error && error.stack) || (error && error.message) || error),
      ms: performance.now() - started,
    });
  }
};
