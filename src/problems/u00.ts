/*
 * Unit 00 — Cost intuition.
 *
 * House style for every reference solution: written the long way on purpose.
 * Explicit loops over comprehensions, one operation per line, and names that
 * say what the thing is. The clever one-liner is taught too — but as the last
 * rung of a ladder, after the mechanism is visible, never as the first thing
 * a reader meets.
 *
 * Problems are ours. Where a canonical exercise is the clearest vehicle for a
 * skill we write our own statement and recast it into the course's production
 * framing; `source` links out for the original (requirements FR-S1..FR-S4).
 */

import type { Problem } from './_types';

export const problems: Problem[] = [
  {
    id: 'u00-flag-check',
    title: 'The access check that got slow',
    statement:
      'A request handler checks whether every feature flag a page needs is enabled for the user. `enabled` is the list of flag names turned on for that user; `needed` is what the page asks for. Return `True` when every needed flag is enabled.\n\nIt shipped fine. Then the flag list grew, and this handler started showing up at the top of the latency graph.',
    origin: 'original',
    entry: 'has_all',
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
    hints: [
      'What does `x in some_list` actually do? Python walks the list from the start until it finds x.',
      'That means the check re-walks `enabled` from the beginning for every flag in `needed`.',
      'Pay once to build something that can answer "is this in there?" without walking. A set does that.',
    ],
    skills: ['hash-map'],
    ladder: [
      {
        label: 'the innocent one-liner',
        code: `def has_all(needed, enabled):
    return all(flag in enabled for flag in needed)
`,
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
        code: `def has_all(needed, enabled):
    on = set(enabled)
    return all(flag in on for flag in needed)
`,
        complexity: 'O(len(enabled) + len(needed)) — identical to the rung above',
        insight:
          'Once you can see the two loops in your head, this is the version you would write at work. Read it as: "make a set, then check every flag against it." Same machine, fewer keystrokes.',
      },
    ],
    wrongApproach: 'def has_all(needed, enabled):\n    return all(flag in enabled for flag in needed)\n',
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

  {
    id: 'u00-first-repeat',
    title: 'The delivery that arrived twice',
    statement:
      'A queue consumer receives message ids and must stop the first time it sees one it has already handled. Return the first id that appears for a second time, or `None` if every id is unique.',
    origin: 'original',
    entry: 'first_repeat',
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
    hints: [
      'For each message you only ever ask one question: "have I already handled this?"',
      'A set answers that without scanning, and you can add to it as you go.',
      'Check before you add — otherwise every message finds itself.',
    ],
    skills: ['hash-map'],
    wrongApproach:
      'def first_repeat(ids):\n    for i, x in enumerate(ids):\n        if x in ids[:i]:\n            return x\n    return None\n',
    tests: `
expect(first_repeat([1, 2, 3, 2, 1]), 2, "first repeat is 2")
expect(first_repeat([1, 2, 3]), None, "all unique")
expect(first_repeat([]), None, "empty")
expect(first_repeat(["a", "b", "a"]), "a", "works on strings")
expect(first_repeat([5, 5]), 5, "immediate repeat")

big = list(range(150_000)) + [7]
under(2.0, "stays fast on a long stream", lambda: first_repeat(big))
`,
  },

  {
    id: 'u00-busiest-minute',
    title: 'Which minute hurt?',
    statement:
      'You have a list of event timestamps in seconds. Return the minute that contains the most events — a minute being `timestamp // 60`. If several tie, return the earliest.\n\nNo pattern is named for this one. Work out what the problem is really asking before you write anything.',
    origin: 'original',
    entry: 'busiest_minute',
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
    hints: [
      'Every timestamp belongs to exactly one minute. What turns a timestamp into its minute?',
      'Count per minute in one pass, then pick the winner from the counts in a second pass.',
      'For the tie rule, only replace the current best when the count is higher, or the count is equal and the minute is earlier.',
    ],
    skills: ['hash-map', 'counter'],
    wrongApproach:
      'def busiest_minute(timestamps):\n    if not timestamps:\n        return None\n    return max(t // 60 for t in timestamps)\n',
    tests: `
expect(busiest_minute([0, 1, 2, 61]), 0, "minute 0 has three")
expect(busiest_minute([61, 62, 0]), 1, "minute 1 has two")
expect(busiest_minute([]), None, "no events")
expect(busiest_minute([0, 60]), 0, "tie picks the earliest")
expect(busiest_minute([120, 121, 60]), 2, "later minute can win")

# Correctness catches the wrong approach here, so this is only a guard
# against something absurdly slow — hence the generous limit.
big = [i for i in range(200_000)] + [90] * 10
under(5.0, "stays fast on a long day", lambda: busiest_minute(big))
`,
  },
];
