/*
 * Grading harnesses.
 *
 * Each language gets its own `expect(actual, expected, label)` and
 * `under(seconds, label, fn)`, and every one of them produces the same JSON
 * shape so the UI renders results identically:
 *
 *   { label, ok, actual, expected }
 *
 * The C++ harness also carries a sentinel line so we can find the results in
 * stdout even when the reader's own prints are mixed in.
 */

export const CPP_RESULT_MARKER = '___RESULTS___';

/** Prepended to the reader's JavaScript, inside a Worker. */
export const JS_HARNESS = `
const _RESULTS = [];
const _repr = (v) => {
  if (typeof v === 'string') return JSON.stringify(v);
  if (v instanceof Set) return 'Set(' + JSON.stringify([...v]) + ')';
  if (v instanceof Map) return 'Map(' + JSON.stringify([...v]) + ')';
  try { return JSON.stringify(v) ?? String(v); } catch { return String(v); }
};
const _same = (a, b) => {
  if (a === b) return true;
  if (Number.isNaN(a) && Number.isNaN(b)) return true;
  if (Array.isArray(a) && Array.isArray(b))
    return a.length === b.length && a.every((x, i) => _same(x, b[i]));
  if (a && b && typeof a === 'object' && typeof b === 'object') {
    const ka = Object.keys(a), kb = Object.keys(b);
    return ka.length === kb.length && ka.every((k) => _same(a[k], b[k]));
  }
  return false;
};
function expect(actual, expected, label) {
  _RESULTS.push({
    label,
    ok: _same(actual, expected),
    actual: _repr(actual).slice(0, 200),
    expected: _repr(expected).slice(0, 200),
  });
}
function under(seconds, label, fn) {
  const t0 = performance.now();
  fn();
  const dt = (performance.now() - t0) / 1000;
  _RESULTS.push({
    label,
    ok: dt < seconds,
    actual: dt.toFixed(3) + 's',
    expected: '< ' + seconds.toFixed(1) + 's',
  });
}
`;

/**
 * Prepended to the reader's C++. Their code defines functions; the tests are
 * statements that run inside main().
 */
export const CPP_HARNESS = `#include <bits/stdc++.h>
using namespace std;

static vector<string> _RESULTS;

static string _esc(const string& s) {
  string o;
  for (char c : s) {
    if (c == '"' || c == '\\\\') { o += '\\\\'; o += c; }
    else if (c == '\\n') o += "\\\\n";
    else if (c == '\\t') o += "\\\\t";
    else if ((unsigned char)c < 0x20) o += ' ';
    else o += c;
  }
  return o;
}

static string _repr(const string& v) { return "\\"" + v + "\\""; }
static string _repr(const char* v)   { return string("\\"") + v + "\\""; }
static string _repr(bool v)          { return v ? "true" : "false"; }
template <class T> static string _repr(const T& v) { ostringstream o; o << v; return o.str(); }
template <class T> static string _repr(const vector<T>& v) {
  string o = "[";
  for (size_t i = 0; i < v.size(); i++) { if (i) o += ", "; o += _repr(v[i]); }
  return o + "]";
}

template <class A, class B>
void expect(const A& actual, const B& expected, const string& label) {
  bool ok = (actual == expected);
  _RESULTS.push_back(string("{\\"label\\":\\"") + _esc(label) + "\\",\\"ok\\":" + (ok ? "true" : "false") +
                     ",\\"actual\\":\\"" + _esc(_repr(actual)) + "\\",\\"expected\\":\\"" + _esc(_repr(expected)) + "\\"}");
}

void under(double seconds, const string& label, const function<void()>& fn) {
  auto t0 = chrono::steady_clock::now();
  fn();
  double dt = chrono::duration<double>(chrono::steady_clock::now() - t0).count();
  ostringstream a, e;
  a << fixed << setprecision(3) << dt << "s";
  e << "< " << fixed << setprecision(1) << seconds << "s";
  _RESULTS.push_back(string("{\\"label\\":\\"") + _esc(label) + "\\",\\"ok\\":" + (dt < seconds ? "true" : "false") +
                     ",\\"actual\\":\\"" + a.str() + "\\",\\"expected\\":\\"" + e.str() + "\\"}");
}

static void _emit() {
  string o = "[";
  for (size_t i = 0; i < _RESULTS.size(); i++) { if (i) o += ","; o += _RESULTS[i]; }
  cout << "\\n${CPP_RESULT_MARKER}" << o << "]" << endl;
}
`;

/** Wraps the reader's C++ tests into a main() that emits results at the end. */
export const cppMain = (tests: string) => `
int main() {
${tests}
  _emit();
  return 0;
}
`;
