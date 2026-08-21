/*
 * One interface, three runtimes.
 *
 *   python      Pyodide in a Web Worker      (~7 MB once, then local)
 *   javascript  a Web Worker                 (nothing to download)
 *   cpp         Wandbox, over the network    (leaves the browser)
 *
 * Only C++ sends anything off the machine. Everything else runs locally, and
 * the UI says so before the reader submits.
 */

import type { Lang } from '../problems/_types';
import { JS_HARNESS, CPP_HARNESS, CPP_RESULT_MARKER, cppMain } from './harnesses';

export interface TestResult {
  label: string;
  ok: boolean;
  actual: string;
  expected: string;
}

export type Outcome =
  | { kind: 'graded'; results: TestResult[]; ms: number }
  | { kind: 'ran'; ms: number }
  | { kind: 'error'; message: string }
  | { kind: 'timeout' }
  | { kind: 'unavailable'; message: string };

export interface RunRequest {
  lang: Lang;
  code: string;
  /** Omit to just run the code and show its output. */
  tests?: string;
  onOutput: (text: string, isError: boolean) => void;
  signal?: AbortSignal;
}

export const RUN_TIMEOUT_MS = 15_000;
/** Compiling and running remotely is slower than local execution. */
export const REMOTE_TIMEOUT_MS = 45_000;

export const isRemote = (lang: Lang) => lang === 'cpp';

// ---------------------------------------------------------------- workers --

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');
const WORKER_URL: Record<'python' | 'javascript', string> = {
  python: `${BASE}/py-worker.js`,
  javascript: `${BASE}/js-worker.js`,
};

const workers: Partial<Record<'python' | 'javascript', Worker>> = {};
const listeners: Partial<Record<'python' | 'javascript', (m: any) => void>> = {};

/** True once Python's runtime is downloaded, so the UI can stop warning. */
export let pythonBooted = false;

function getWorker(lang: 'python' | 'javascript'): Worker {
  let w = workers[lang];
  if (!w) {
    w = new Worker(WORKER_URL[lang]);
    w.onmessage = (e) => listeners[lang]?.(e.data);
    w.onerror = () => listeners[lang]?.({ type: 'boot-error', message: 'Could not start the worker.' });
    workers[lang] = w;
  }
  return w;
}

export function killWorker(lang: 'python' | 'javascript') {
  workers[lang]?.terminate();
  delete workers[lang];
  if (lang === 'python') pythonBooted = false;
}

/** Warms the Python runtime so the first Run isn't a cold download. */
export function preloadPython() {
  if (!pythonBooted) getWorker('python').postMessage({ type: 'preload' });
}

function runInWorker(req: RunRequest): Promise<Outcome> {
  const lang = req.lang as 'python' | 'javascript';
  return new Promise((resolve) => {
    const done = (o: Outcome) => {
      window.clearTimeout(timer);
      listeners[lang] = undefined;
      resolve(o);
    };
    const timer = window.setTimeout(() => {
      killWorker(lang);
      done({ kind: 'timeout' });
    }, RUN_TIMEOUT_MS);

    listeners[lang] = (m) => {
      switch (m.type) {
        case 'ready':
          pythonBooted = true;
          break;
        case 'out':
          req.onOutput(m.text, m.stream === 'err');
          break;
        case 'graded':
          done({ kind: 'graded', results: m.results, ms: m.ms });
          break;
        case 'done':
          done({ kind: 'ran', ms: m.ms });
          break;
        case 'error':
          done({ kind: 'error', message: m.message });
          break;
        case 'boot-error':
          killWorker(lang);
          done({ kind: 'unavailable', message: m.message });
          break;
      }
    };

    getWorker(lang).postMessage({
      type: req.tests ? 'grade' : 'run',
      code: req.code,
      tests: req.tests,
      harness: lang === 'javascript' ? JS_HARNESS : undefined,
    });
  });
}

// ------------------------------------------------------------------- c++ --

/**
 * Wandbox: free, no API key, and CORS-open, which is what makes it usable from
 * a static page. If it ever closes up (Piston's public API went whitelist-only
 * in Feb 2026), this is the single function to repoint.
 */
const WANDBOX_URL = 'https://wandbox.org/api/compile.json';

async function runCpp(req: RunRequest): Promise<Outcome> {
  const program = req.tests
    ? CPP_HARNESS + '\n' + req.code + '\n' + cppMain(req.tests)
    : req.code;

  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), REMOTE_TIMEOUT_MS);
  req.signal?.addEventListener('abort', () => controller.abort());

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
      signal: controller.signal,
    });
    if (!res.ok) {
      return { kind: 'unavailable', message: `Compiler service returned ${res.status}.` };
    }
    payload = await res.json();
  } catch (e: any) {
    if (e?.name === 'AbortError') return { kind: 'timeout' };
    return {
      kind: 'unavailable',
      message: 'Could not reach the C++ compiler service. Python and JavaScript still run locally.',
    };
  } finally {
    window.clearTimeout(timer);
  }

  if (payload.compiler_error) {
    // A failed compile is an outcome to read, not a crash.
    return { kind: 'error', message: payload.compiler_error.trim() };
  }

  const stdout: string = payload.program_output ?? '';
  const stderr: string = payload.program_error ?? '';
  if (stderr.trim()) req.onOutput(stderr.trim(), true);

  const marker = stdout.indexOf(CPP_RESULT_MARKER);
  const visible = marker >= 0 ? stdout.slice(0, marker) : stdout;
  if (visible.trim()) req.onOutput(visible.replace(/\n+$/, ''), false);

  if (!req.tests) return { kind: 'ran', ms: 0 };

  if (marker < 0) {
    return {
      kind: 'error',
      message: stderr.trim() || 'The program did not finish — it may have crashed or been stopped.',
    };
  }
  try {
    const json = stdout.slice(marker + CPP_RESULT_MARKER.length).trim();
    return { kind: 'graded', results: JSON.parse(json), ms: 0 };
  } catch {
    return { kind: 'error', message: 'Could not read the test results from the program output.' };
  }
}

// ------------------------------------------------------------------ entry --

export function execute(req: RunRequest): Promise<Outcome> {
  return req.lang === 'cpp' ? runCpp(req) : runInWorker(req);
}

export function stop(lang: Lang) {
  if (lang !== 'cpp') killWorker(lang as 'python' | 'javascript');
}
