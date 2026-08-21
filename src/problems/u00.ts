/*
 * Unit 00 — Cost intuition.
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
    starter: 'def has_all(needed, enabled):\n    # enabled: list of flag names turned on for this user\n    ...\n',
    solution:
      'def has_all(needed, enabled):\n    on = set(enabled)\n    return all(flag in on for flag in needed)\n',
    hints: [
      'What is the cost of `x in some_list`? It is not O(1).',
      'The check re-walks `enabled` from the start for every flag in `needed`.',
      'Pay once to build something with O(1) membership, then ask it many times.',
    ],
    skills: ['hash-map'],
    ladder: [
      {
        label: 'the obvious one-liner',
        code: 'def has_all(needed, enabled):\n    return all(flag in enabled for flag in needed)\n',
        complexity: 'O(len(needed) × len(enabled))',
        diesAt: '120,000 flags × 600 lookups → seconds, not milliseconds',
        insight:
          '`in` on a list is a linear scan. Nothing in this code looks like a nested loop, but there is one hiding inside the `in`.',
      },
      {
        label: 'remember what is enabled',
        code: 'def has_all(needed, enabled):\n    on = set(enabled)\n    return all(flag in on for flag in needed)\n',
        complexity: 'O(len(enabled) + len(needed)) time, O(len(enabled)) space',
        insight:
          'One pass builds a set; every later membership question is answered in constant time. You bought time with memory.',
      },
    ],
    wrongApproach: 'def has_all(needed, enabled):\n    return all(flag in enabled for flag in needed)\n',
    tests: `
expect(has_all(["a"], ["a", "b"]), True, "flag is enabled")
expect(has_all(["z"], ["a", "b"]), False, "flag is missing")
expect(has_all([], ["a"]), True, "asking for nothing is satisfied")
expect(has_all(["a", "a"], ["a"]), True, "repeated request")
expect(has_all(["a", "z"], ["a", "b"]), False, "one of two missing")

big = ["flag-%d" % i for i in range(120_000)]
ask = ["flag-%d" % i for i in range(0, 120_000, 20)]
under(1.5, "stays fast on a large flag list", lambda: has_all(ask, big))
`,
  },

  {
    id: 'u00-first-repeat',
    title: 'The delivery that arrived twice',
    statement:
      'A queue consumer receives message ids and must stop the first time it sees one it has already handled. Return the first id that appears for a second time, or `None` if every id is unique.',
    origin: 'original',
    entry: 'first_repeat',
    starter: 'def first_repeat(ids):\n    ...\n',
    solution:
      'def first_repeat(ids):\n    seen = set()\n    for i in ids:\n        if i in seen:\n            return i\n        seen.add(i)\n    return None\n',
    hints: [
      'You only need to answer one question per element: "have I seen this before?"',
      'A set answers that in constant time, and you can build it as you go.',
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
    starter: 'def busiest_minute(timestamps):\n    ...\n',
    solution:
      'def busiest_minute(timestamps):\n    if not timestamps:\n        return None\n    counts = {}\n    for t in timestamps:\n        m = t // 60\n        counts[m] = counts.get(m, 0) + 1\n    best = max(counts.values())\n    return min(m for m, c in counts.items() if c == best)\n',
    hints: [
      'Every timestamp belongs to exactly one bucket. What is the bucket key?',
      'Tally per bucket in one pass, then pick the winner from the tally.',
      'For the tie rule, take the smallest key among those holding the maximum count.',
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
