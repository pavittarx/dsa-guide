/*
 * Unit 00 — Cost intuition.
 *
 * House style for every reference solution, in all three languages: written
 * the long way on purpose. Explicit loops, one operation per line, names that
 * say what the thing is. The idiomatic one-liner is taught too — as the last
 * rung of a ladder, after the mechanism is visible.
 *
 * On timing gates: Python and JavaScript run locally, so `under(...)` is
 * dependable there. C++ is compiled and run on a shared public service, where
 * wall-clock cannot meet the 50x margin rule the spec sets, so the C++ suites
 * assert correctness only. The cost lesson is carried by the ladder, which
 * prints its own timings.
 */

import type { Problem } from './_types';

export const problems: Problem[] = [
  {
    id: 'u00-flag-check',
    title: 'The access check that got slow',
    statement:
      'A request handler checks whether every feature flag a page needs is enabled for the user. `enabled` is the list of flag names turned on for that user; `needed` is what the page asks for. Return true when every needed flag is enabled.\n\nIt shipped fine. Then the flag list grew, and this handler started showing up at the top of the latency graph.',
    origin: 'original',
    entry: 'has_all',
    hints: [
      'What does checking "is this value in that list" actually do? It walks the list from the start until it finds a match.',
      'That means the check re-walks `enabled` from the beginning for every flag in `needed`.',
      'Pay once to build something that can answer "is this in there?" without walking. A set does that.',
    ],
    skills: ['hash-map'],
    impls: {
      python: {
        starter:
          'def has_all(needed, enabled):\n    # needed:  list of flag names this page requires\n    # enabled: list of flag names turned on for this user\n    ...\n',
        solution: `def has_all(needed, enabled):
    # Step 1: pay once to put every enabled flag in a set.
    # Looking something up in a set does not scan it.
    on = set()
    for flag in enabled:
        on.add(flag)

    # Step 2: check each needed flag against that set.
    for flag in needed:
        if flag not in on:
            return False

    return True
`,
        wrongApproach: 'def has_all(needed, enabled):\n    return all(flag in enabled for flag in needed)\n',
        ladder: [
          {
            label: 'the innocent one-liner',
            code: 'def has_all(needed, enabled):\n    return all(flag in enabled for flag in needed)\n',
            complexity: 'O(len(needed) × len(enabled))',
            diesAt: '120,000 flags × 6,000 lookups → ~10s, not milliseconds',
            insight:
              'There is no nested loop anywhere in this line — and yet there is one. It is hiding inside the word `in`.',
          },
          {
            label: 'the same thing, spelled out',
            code: `def has_all(needed, enabled):
    for flag in needed:
        found = False
        for candidate in enabled:      # <- this is what "in" was doing
            if candidate == flag:
                found = True
                break
        if not found:
            return False
    return True
`,
            complexity: 'O(len(needed) × len(enabled)) — identical to the one-liner',
            insight:
              'Same work, nothing hidden — the nested loop is now on the screen where you can see it, and the problem is obvious: the inner loop restarts from the top every single time. If this rung times a little slower than the one above, that is expected: `in` does the scanning down in C, while this does it in Python. Same shape, slightly heavier steps.',
          },
          {
            label: 'remember what is enabled',
            code: `def has_all(needed, enabled):
    on = set()
    for flag in enabled:
        on.add(flag)

    for flag in needed:
        if flag not in on:
            return False
    return True
`,
            complexity: 'O(len(enabled) + len(needed)) time, O(len(enabled)) space',
            insight:
              'Two loops one after the other instead of one inside the other. That is the whole fix. You spent memory on the set and bought back all that scanning.',
          },
          {
            label: 'the short way (same thing)',
            code: 'def has_all(needed, enabled):\n    on = set(enabled)\n    return all(flag in on for flag in needed)\n',
            complexity: 'O(len(enabled) + len(needed)) — identical to the rung above',
            insight:
              'Once you can see the two loops in your head, this is the version you would write at work. Read it as: "make a set, then check every flag against it."',
          },
        ],
        ladderDemo: `
import time

# Setup: a big list of enabled flags, and a page asking for many of them.
enabled = []
for i in range(120_000):
    enabled.append("flag-%d" % i)

needed = []
for i in range(0, 120_000, 20):
    needed.append("flag-%d" % i)

start = time.perf_counter()
result = has_all(needed, enabled)
elapsed = time.perf_counter() - start

print("checked", len(needed), "flags against", len(enabled), "enabled ->", result)
print("took %.3fs" % elapsed)
`,
        tests: `
expect(has_all(["a"], ["a", "b"]), True, "flag is enabled")
expect(has_all(["z"], ["a", "b"]), False, "flag is missing")
expect(has_all([], ["a"]), True, "asking for nothing is satisfied")
expect(has_all(["a", "a"], ["a"]), True, "repeated request")
expect(has_all(["a", "z"], ["a", "b"]), False, "one of two missing")

big = ["flag-%d" % i for i in range(120_000)]
ask = ["flag-%d" % i for i in range(0, 120_000, 20)]
under(2.5, "stays fast on a large flag list", lambda: has_all(ask, big))
`,
      },

      javascript: {
        starter:
          'function hasAll(needed, enabled) {\n  // needed:  array of flag names this page requires\n  // enabled: array of flag names turned on for this user\n}\n',
        solution: `function hasAll(needed, enabled) {
  // Step 1: pay once to put every enabled flag in a Set.
  // Looking something up in a Set does not scan it.
  const on = new Set();
  for (const flag of enabled) {
    on.add(flag);
  }

  // Step 2: check each needed flag against that Set.
  for (const flag of needed) {
    if (!on.has(flag)) {
      return false;
    }
  }

  return true;
}
`,
        wrongApproach:
          'function hasAll(needed, enabled) {\n  return needed.every((flag) => enabled.includes(flag));\n}\n',
        ladder: [
          {
            label: 'the innocent one-liner',
            code: 'function hasAll(needed, enabled) {\n  return needed.every((flag) => enabled.includes(flag));\n}\n',
            complexity: 'O(needed.length × enabled.length)',
            diesAt: '120,000 flags × 6,000 lookups → seconds',
            insight:
              'No nested loop in sight — but `includes` walks the whole array, and it does that once per needed flag.',
          },
          {
            label: 'the same thing, spelled out',
            code: `function hasAll(needed, enabled) {
  for (const flag of needed) {
    let found = false;
    for (const candidate of enabled) {   // <- this is what includes() was doing
      if (candidate === flag) {
        found = true;
        break;
      }
    }
    if (!found) return false;
  }
  return true;
}
`,
            complexity: 'O(needed.length × enabled.length) — identical',
            insight: 'Same work, now visible. The inner loop restarts from the top for every flag.',
          },
          {
            label: 'remember what is enabled',
            code: `function hasAll(needed, enabled) {
  const on = new Set();
  for (const flag of enabled) {
    on.add(flag);
  }

  for (const flag of needed) {
    if (!on.has(flag)) return false;
  }
  return true;
}
`,
            complexity: 'O(enabled.length + needed.length) time, O(enabled.length) space',
            insight: 'Two loops side by side instead of nested. A Set answers membership without scanning.',
          },
          {
            label: 'the short way (same thing)',
            code: 'function hasAll(needed, enabled) {\n  const on = new Set(enabled);\n  return needed.every((flag) => on.has(flag));\n}\n',
            complexity: 'O(enabled.length + needed.length) — identical to the rung above',
            insight:
              '`new Set(enabled)` is that first loop. `every` is the second. Same machine, fewer keystrokes.',
          },
        ],
        ladderDemo: `
// Setup: a big list of enabled flags, and a page asking for many of them.
const enabled = [];
for (let i = 0; i < 120000; i++) enabled.push("flag-" + i);

const needed = [];
for (let i = 0; i < 120000; i += 20) needed.push("flag-" + i);

const start = performance.now();
const result = hasAll(needed, enabled);
const elapsed = (performance.now() - start) / 1000;

console.log("checked", needed.length, "flags against", enabled.length, "enabled ->", result);
console.log("took " + elapsed.toFixed(3) + "s");
`,
        tests: `
expect(hasAll(["a"], ["a", "b"]), true, "flag is enabled");
expect(hasAll(["z"], ["a", "b"]), false, "flag is missing");
expect(hasAll([], ["a"]), true, "asking for nothing is satisfied");
expect(hasAll(["a", "a"], ["a"]), true, "repeated request");
expect(hasAll(["a", "z"], ["a", "b"]), false, "one of two missing");

const big = [];
for (let i = 0; i < 120000; i++) big.push("flag-" + i);
const ask = [];
for (let i = 0; i < 120000; i += 5) ask.push("flag-" + i);
under(2.0, "stays fast on a large flag list", () => hasAll(ask, big));
`,
      },

      cpp: {
        note: 'C++ suites check correctness only — the compiler runs on a shared public service, so wall-clock there is too noisy to grade against. Use the ladder to see the cost difference.',
        starter:
          'bool has_all(const vector<string>& needed, const vector<string>& enabled) {\n    // needed:  flag names this page requires\n    // enabled: flag names turned on for this user\n}\n',
        solution: `bool has_all(const vector<string>& needed, const vector<string>& enabled) {
    // Step 1: pay once to put every enabled flag in a hash set.
    unordered_set<string> on;
    for (const string& flag : enabled) {
        on.insert(flag);
    }

    // Step 2: check each needed flag against that set.
    for (const string& flag : needed) {
        if (on.find(flag) == on.end()) {
            return false;
        }
    }

    return true;
}
`,
        // Note: a correct-but-quadratic C++ answer passes here, because the C++
        // suites carry no timing gate (see the header comment). So the recorded
        // wrong approach is one that is actually wrong — enough to prove the
        // tests discriminate at all.
        wrongApproach: `bool has_all(const vector<string>& needed, const vector<string>& enabled) {
    for (const string& flag : needed) {
        if (find(enabled.begin(), enabled.end(), flag) != enabled.end()) return true;
    }
    return false;
}
`,
        ladder: [
          {
            label: 'search the vector every time',
            code: `bool has_all(const vector<string>& needed, const vector<string>& enabled) {
    for (const string& flag : needed) {
        bool found = false;
        for (const string& candidate : enabled) {   // restarts from the top
            if (candidate == flag) { found = true; break; }
        }
        if (!found) return false;
    }
    return true;
}
`,
            complexity: 'O(needed.size() × enabled.size())',
            diesAt: 'C++ is fast enough to hide this until the data is much bigger — which is exactly why it ships',
            insight:
              'std::find over a vector is a linear scan, run once per needed flag. C++ makes each step cheap, so the quadratic hides for longer before it hurts.',
          },
          {
            label: 'remember what is enabled',
            code: `bool has_all(const vector<string>& needed, const vector<string>& enabled) {
    unordered_set<string> on;
    for (const string& flag : enabled) {
        on.insert(flag);
    }
    for (const string& flag : needed) {
        if (on.find(flag) == on.end()) return false;
    }
    return true;
}
`,
            complexity: 'O(enabled.size() + needed.size()) average',
            insight:
              'unordered_set hashes the string once and jumps straight to a bucket. Two sequential loops instead of nested ones.',
          },
        ],
        ladderDemo: `
vector<string> enabled;
for (int i = 0; i < 120000; i++) enabled.push_back("flag-" + to_string(i));

vector<string> needed;
for (int i = 0; i < 120000; i += 20) needed.push_back("flag-" + to_string(i));

auto start = chrono::steady_clock::now();
bool result = has_all(needed, enabled);
double elapsed = chrono::duration<double>(chrono::steady_clock::now() - start).count();

cout << "checked " << needed.size() << " flags against " << enabled.size()
     << " enabled -> " << (result ? "true" : "false") << endl;
cout << "took " << fixed << setprecision(3) << elapsed << "s" << endl;
`,
        tests: `
  expect(has_all({"a"}, {"a", "b"}), true, "flag is enabled");
  expect(has_all({"z"}, {"a", "b"}), false, "flag is missing");
  expect(has_all({}, {"a"}), true, "asking for nothing is satisfied");
  expect(has_all({"a", "a"}, {"a"}), true, "repeated request");
  expect(has_all({"a", "z"}, {"a", "b"}), false, "one of two missing");
`,
      },
    },
  },

  {
    id: 'u00-first-repeat',
    title: 'The delivery that arrived twice',
    statement:
      'A queue consumer receives message ids and must stop the first time it sees one it has already handled. Return the first id that appears for a second time.',
    origin: 'original',
    entry: 'first_repeat',
    hints: [
      'For each message you only ever ask one question: "have I already handled this?"',
      'A set answers that without scanning, and you can add to it as you go.',
      'Check before you add — otherwise every message finds itself.',
    ],
    skills: ['hash-map'],
    impls: {
      python: {
        note: 'Return None when every id is unique.',
        starter: 'def first_repeat(ids):\n    # ids: message ids, in the order they arrived\n    ...\n',
        solution: `def first_repeat(ids):
    # Keep a record of everything handled so far.
    seen = set()

    for message_id in ids:
        if message_id in seen:
            return message_id      # handled this one already
        seen.add(message_id)

    return None                    # every id was unique
`,
        wrongApproach:
          'def first_repeat(ids):\n    for i, x in enumerate(ids):\n        if x in ids[:i]:\n            return x\n    return None\n',
        tests: `
expect(first_repeat([1, 2, 3, 2, 1]), 2, "first repeat is 2")
expect(first_repeat([1, 2, 3]), None, "all unique")
expect(first_repeat([]), None, "empty")
expect(first_repeat([5, 5]), 5, "immediate repeat")

big = list(range(150_000)) + [7]
under(2.0, "stays fast on a long stream", lambda: first_repeat(big))
`,
      },
      javascript: {
        note: 'Return null when every id is unique.',
        starter: 'function firstRepeat(ids) {\n  // ids: message ids, in the order they arrived\n}\n',
        solution: `function firstRepeat(ids) {
  // Keep a record of everything handled so far.
  const seen = new Set();

  for (const messageId of ids) {
    if (seen.has(messageId)) {
      return messageId;      // handled this one already
    }
    seen.add(messageId);
  }

  return null;               // every id was unique
}
`,
        wrongApproach:
          'function firstRepeat(ids) {\n  for (let i = 0; i < ids.length; i++) {\n    if (ids.slice(0, i).includes(ids[i])) return ids[i];\n  }\n  return null;\n}\n',
        tests: `
expect(firstRepeat([1, 2, 3, 2, 1]), 2, "first repeat is 2");
expect(firstRepeat([1, 2, 3]), null, "all unique");
expect(firstRepeat([]), null, "empty");
expect(firstRepeat([5, 5]), 5, "immediate repeat");

const big = [];
for (let i = 0; i < 60000; i++) big.push(i);
big.push(7);
under(2.0, "stays fast on a long stream", () => firstRepeat(big));
`,
      },
      cpp: {
        note: 'Return -1 when every id is unique. C++ suites check correctness only.',
        starter:
          'int first_repeat(const vector<int>& ids) {\n    // ids: message ids, in the order they arrived\n    // return -1 if every id is unique\n}\n',
        solution: `int first_repeat(const vector<int>& ids) {
    // Keep a record of everything handled so far.
    unordered_set<int> seen;

    for (int message_id : ids) {
        if (seen.find(message_id) != seen.end()) {
            return message_id;     // handled this one already
        }
        seen.insert(message_id);
    }

    return -1;                     // every id was unique
}
`,
        wrongApproach: `int first_repeat(const vector<int>& ids) {
    for (size_t i = 0; i < ids.size(); i++)
        for (size_t j = 0; j < i; j++)
            if (ids[i] == ids[j]) return ids[j];
    return 0;
}
`,
        tests: `
  expect(first_repeat({1, 2, 3, 2, 1}), 2, "first repeat is 2");
  expect(first_repeat({1, 2, 3}), -1, "all unique");
  expect(first_repeat({}), -1, "empty");
  expect(first_repeat({5, 5}), 5, "immediate repeat");
`,
      },
    },
  },

  {
    id: 'u00-busiest-minute',
    title: 'Which minute hurt?',
    statement:
      'You have a list of event timestamps in seconds. Return the minute that contains the most events — a minute being `timestamp / 60`, rounded down. If several tie, return the earliest.\n\nNo pattern is named for this one. Work out what the problem is really asking before you write anything.',
    origin: 'original',
    entry: 'busiest_minute',
    hints: [
      'Every timestamp belongs to exactly one minute. What turns a timestamp into its minute?',
      'Count per minute in one pass, then pick the winner from the counts in a second pass.',
      'For the tie rule, only replace the current best when the count is higher, or the count is equal and the minute is earlier.',
    ],
    skills: ['hash-map', 'counter'],
    impls: {
      python: {
        note: 'Return None when there are no events.',
        starter: 'def busiest_minute(timestamps):\n    # timestamps: event times, in seconds\n    ...\n',
        solution: `def busiest_minute(timestamps):
    if len(timestamps) == 0:
        return None

    # Step 1: count how many events landed in each minute.
    counts = {}
    for seconds in timestamps:
        minute = seconds // 60
        if minute in counts:
            counts[minute] = counts[minute] + 1
        else:
            counts[minute] = 1

    # Step 2: find the busiest. On a tie, keep the earlier minute.
    best_minute = None
    best_count = 0
    for minute in counts:
        count = counts[minute]
        if best_minute is None:
            best_minute = minute
            best_count = count
        elif count > best_count:
            best_minute = minute
            best_count = count
        elif count == best_count and minute < best_minute:
            best_minute = minute

    return best_minute
`,
        wrongApproach:
          'def busiest_minute(timestamps):\n    if not timestamps:\n        return None\n    return max(t // 60 for t in timestamps)\n',
        tests: `
expect(busiest_minute([0, 1, 2, 61]), 0, "minute 0 has three")
expect(busiest_minute([61, 62, 0]), 1, "minute 1 has two")
expect(busiest_minute([]), None, "no events")
expect(busiest_minute([0, 60]), 0, "tie picks the earliest")
expect(busiest_minute([120, 121, 60]), 2, "later minute can win")

big = [i for i in range(200_000)] + [90] * 10
under(5.0, "stays fast on a long day", lambda: busiest_minute(big))
`,
      },
      javascript: {
        note: 'Return null when there are no events.',
        starter: 'function busiestMinute(timestamps) {\n  // timestamps: event times, in seconds\n}\n',
        solution: `function busiestMinute(timestamps) {
  if (timestamps.length === 0) {
    return null;
  }

  // Step 1: count how many events landed in each minute.
  const counts = new Map();
  for (const seconds of timestamps) {
    const minute = Math.floor(seconds / 60);
    if (counts.has(minute)) {
      counts.set(minute, counts.get(minute) + 1);
    } else {
      counts.set(minute, 1);
    }
  }

  // Step 2: find the busiest. On a tie, keep the earlier minute.
  let bestMinute = null;
  let bestCount = 0;
  for (const [minute, count] of counts) {
    if (bestMinute === null) {
      bestMinute = minute;
      bestCount = count;
    } else if (count > bestCount) {
      bestMinute = minute;
      bestCount = count;
    } else if (count === bestCount && minute < bestMinute) {
      bestMinute = minute;
    }
  }

  return bestMinute;
}
`,
        wrongApproach:
          'function busiestMinute(timestamps) {\n  if (timestamps.length === 0) return null;\n  return Math.max(...timestamps.map((t) => Math.floor(t / 60)));\n}\n',
        tests: `
expect(busiestMinute([0, 1, 2, 61]), 0, "minute 0 has three");
expect(busiestMinute([61, 62, 0]), 1, "minute 1 has two");
expect(busiestMinute([]), null, "no events");
expect(busiestMinute([0, 60]), 0, "tie picks the earliest");
expect(busiestMinute([120, 121, 60]), 2, "later minute can win");

const big = [];
for (let i = 0; i < 200000; i++) big.push(i);
for (let i = 0; i < 10; i++) big.push(90);
under(3.0, "stays fast on a long day", () => busiestMinute(big));
`,
      },
      cpp: {
        note: 'Return -1 when there are no events. C++ suites check correctness only.',
        starter:
          'long long busiest_minute(const vector<long long>& timestamps) {\n    // timestamps: event times, in seconds; return -1 if empty\n}\n',
        solution: `long long busiest_minute(const vector<long long>& timestamps) {
    if (timestamps.empty()) {
        return -1;
    }

    // Step 1: count how many events landed in each minute.
    unordered_map<long long, long long> counts;
    for (long long seconds : timestamps) {
        long long minute = seconds / 60;
        counts[minute] = counts[minute] + 1;
    }

    // Step 2: find the busiest. On a tie, keep the earlier minute.
    bool have_best = false;
    long long best_minute = 0;
    long long best_count = 0;
    for (const auto& entry : counts) {
        long long minute = entry.first;
        long long count = entry.second;
        if (!have_best || count > best_count) {
            have_best = true;
            best_minute = minute;
            best_count = count;
        } else if (count == best_count && minute < best_minute) {
            best_minute = minute;
        }
    }

    return best_minute;
}
`,
        wrongApproach: `long long busiest_minute(const vector<long long>& timestamps) {
    if (timestamps.empty()) return -1;
    long long best = 0;
    for (long long t : timestamps) best = max(best, t / 60);
    return best;
}
`,
        tests: `
  expect(busiest_minute({0, 1, 2, 61}), 0LL, "minute 0 has three");
  expect(busiest_minute({61, 62, 0}), 1LL, "minute 1 has two");
  expect(busiest_minute({}), -1LL, "no events");
  expect(busiest_minute({0, 60}), 0LL, "tie picks the earliest");
  expect(busiest_minute({120, 121, 60}), 2LL, "later minute can win");
`,
      },
    },
  },
];
