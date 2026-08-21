/*
 * Unit 01 — Hashing & counting.
 *
 * The varied set is deliberately not four flavours of the same question: an
 * index lookup, a grouping by computed key, a tally, and a set walk. They look
 * different on the page and are the same skill underneath — which is the point.
 */

import type { Problem } from './_types';

export const problems: Problem[] = [
  {
    id: 'u01-lookup-service',
    title: 'One query, then two hundred more',
    statement:
      'An endpoint takes a list of user ids and returns each user\'s display name. `profiles` is the full list of profile records, each a dict with `"id"` and `"name"`. Return the names in the same order the ids were given.\n\nAssume every id exists in `profiles`.',
    origin: 'original',
    source: { name: 'Related: Two Sum (the same "look it up instead of scanning" move)', url: 'https://leetcode.com/problems/two-sum/' },
    entry: 'names_for',
    starter:
      'def names_for(ids, profiles):\n    # profiles: [{"id": 1, "name": "ada"}, ...]\n    ...\n',
    solution:
      'def names_for(ids, profiles):\n    by_id = {p["id"]: p["name"] for p in profiles}\n    return [by_id[i] for i in ids]\n',
    hints: [
      'For each id you are searching the whole profile list. How many times do you re-read the same records?',
      'The profile list does not change while you work. Index it once.',
      'A dict from id to name costs one pass and makes every lookup constant.',
    ],
    skills: ['hash-map'],
    ladder: [
      {
        label: 'scan for each id',
        code:
          'def names_for(ids, profiles):\n    out = []\n    for i in ids:\n        for p in profiles:\n            if p["id"] == i:\n                out.append(p["name"])\n                break\n    return out\n',
        complexity: 'O(len(ids) × len(profiles))',
        diesAt: '80,000 profiles × 400 ids → seconds per request',
        insight:
          'Every id re-reads the profile list from the top. The list already held the answer the first time through.',
      },
      {
        label: 'index once, look up many',
        code:
          'def names_for(ids, profiles):\n    by_id = {p["id"]: p["name"] for p in profiles}\n    return [by_id[i] for i in ids]\n',
        complexity: 'O(len(profiles) + len(ids)) time, O(len(profiles)) space',
        insight:
          'One pass to build the index, then constant-time answers. This is the same shape as the classic pair-sum trick, and as the N+1 query in your ORM.',
      },
    ],
    wrongApproach:
      'def names_for(ids, profiles):\n    out = []\n    for i in ids:\n        for p in profiles:\n            if p["id"] == i:\n                out.append(p["name"])\n                break\n    return out\n',
    tests: `
P = [{"id": 1, "name": "ada"}, {"id": 2, "name": "grace"}, {"id": 3, "name": "alan"}]
expect(names_for([2, 1], P), ["grace", "ada"], "order follows the ids")
expect(names_for([], P), [], "no ids")
expect(names_for([3, 3], P), ["alan", "alan"], "repeated id")
expect(names_for([1, 2, 3], P), ["ada", "grace", "alan"], "all of them")

big = [{"id": i, "name": "user-%d" % i} for i in range(80_000)]
ask = [i for i in range(0, 80_000, 66)]
under(1.5, "stays fast at 80k profiles", lambda: names_for(ask, big))
`,
  },

  {
    id: 'u01-canonical-skus',
    title: 'The same product, three spellings',
    statement:
      'A catalogue import produced SKU codes whose letters were shuffled by an upstream system: `"abc"`, `"cab"` and `"bca"` are all the same product. Group them.\n\nReturn a list of groups. Sort each group alphabetically, and sort the list of groups by its first element, so the result is deterministic.',
    origin: 'original',
    source: { name: 'Related: Group Anagrams', url: 'https://leetcode.com/problems/group-anagrams/' },
    entry: 'group_skus',
    starter: 'def group_skus(skus):\n    ...\n',
    solution:
      'def group_skus(skus):\n    buckets = {}\n    for s in skus:\n        key = "".join(sorted(s))\n        buckets.setdefault(key, []).append(s)\n    return sorted([sorted(g) for g in buckets.values()])\n',
    hints: [
      'Two SKUs belong together when something computed from them is equal. What is that something?',
      'Sorting the letters of a code gives every member of a group the same key.',
      'Bucket by that key with a dict, then tidy the output for determinism.',
    ],
    skills: ['hash-map', 'counter'],
    wrongApproach:
      'def group_skus(skus):\n    return sorted([sorted([s]) for s in skus])\n',
    tests: `
expect(group_skus(["abc", "cab", "xy"]), [["abc", "cab"], ["xy"]], "two groups")
expect(group_skus([]), [], "nothing to group")
expect(group_skus(["a"]), [["a"]], "single sku")
expect(group_skus(["ab", "ba", "ab"]), [["ab", "ab", "ba"]], "duplicates stay")
expect(group_skus(["ab", "cd"]), [["ab"], ["cd"]], "no shared group")

big = ["".join(sorted("sku%d" % (i % 5000))) for i in range(60_000)]
under(5.0, "stays fast on a big catalogue", lambda: group_skus(big))
`,
  },

  {
    id: 'u01-top-error',
    title: 'What is actually failing?',
    statement:
      'Given a list of error codes from the last hour, return the code that appears most often. If several tie, return the one that is alphabetically first.',
    origin: 'original',
    entry: 'top_error',
    starter: 'def top_error(codes):\n    ...\n',
    solution:
      'def top_error(codes):\n    if not codes:\n        return None\n    counts = {}\n    for c in codes:\n        counts[c] = counts.get(c, 0) + 1\n    best = max(counts.values())\n    return min(c for c, n in counts.items() if n == best)\n',
    hints: [
      'One pass to tally, one pass over the tally to pick a winner.',
      'The tie rule is a `min` over just the codes that share the top count.',
    ],
    skills: ['counter'],
    wrongApproach:
      'def top_error(codes):\n    if not codes:\n        return None\n    return max(codes, key=codes.count)\n',
    tests: `
expect(top_error(["500", "404", "500"]), "500", "clear winner")
expect(top_error(["404", "500"]), "404", "tie goes alphabetical")
expect(top_error([]), None, "no errors")
expect(top_error(["a"]), "a", "single code")
expect(top_error(["b", "b", "a", "a"]), "a", "tie at the top")

big = ["code-%d" % (i % 900) for i in range(8_000)]
under(0.5, "stays fast on an hour of logs", lambda: top_error(big))
`,
  },

  {
    id: 'u01-active-streak',
    title: 'The longest run of active days',
    statement:
      'You have the day numbers on which a user was active, unsorted and possibly with duplicates. Return the length of the longest run of consecutive days.\n\nSorting would solve it. Solve it without sorting — the input is large and the scan must stay linear.',
    origin: 'original',
    source: { name: 'Related: Longest Consecutive Sequence', url: 'https://leetcode.com/problems/longest-consecutive-sequence/' },
    entry: 'longest_streak',
    starter: 'def longest_streak(days):\n    ...\n',
    solution:
      'def longest_streak(days):\n    have = set(days)\n    best = 0\n    for d in have:\n        if d - 1 in have:\n            continue          # not the start of a run\n        length = 1\n        while d + length in have:\n            length += 1\n        best = max(best, length)\n    return best\n',
    hints: [
      'Put everything in a set first, so "is this day present?" is free.',
      'Walking up from every day is quadratic. Only walk from a day that starts a run.',
      'A day starts a run when `d - 1` is not in the set.',
    ],
    skills: ['hash-map'],
    wrongApproach:
      'def longest_streak(days):\n    have = set(days)\n    best = 0\n    for d in have:\n        length = 1\n        while d + length in have:\n            length += 1\n        best = max(best, length)\n    return best\n',
    tests: `
expect(longest_streak([100, 4, 200, 1, 3, 2]), 4, "1,2,3,4")
expect(longest_streak([]), 0, "never active")
expect(longest_streak([5]), 1, "one day")
expect(longest_streak([1, 1, 2]), 2, "duplicates do not extend a run")
expect(longest_streak([9, 7]), 1, "no consecutive days")

# The guard matters: without it this input is quadratic.
big = list(range(6_000))
under(0.5, "stays linear on one long run", lambda: longest_streak(big))
`,
  },

  {
    id: 'u01-first-unique',
    title: 'The one that only happened once',
    statement:
      'A support tool needs the first request id in a log that appears exactly once in the whole log. Return it, or `None` if every id repeats.\n\nNo pattern is named here. Decide what to reach for before you start typing.',
    origin: 'original',
    entry: 'first_unique',
    starter: 'def first_unique(ids):\n    ...\n',
    solution:
      'def first_unique(ids):\n    counts = {}\n    for i in ids:\n        counts[i] = counts.get(i, 0) + 1\n    for i in ids:\n        if counts[i] == 1:\n            return i\n    return None\n',
    hints: [
      'You cannot know an id is unique until you have seen the whole log.',
      'That suggests two passes: one to learn, one to answer.',
      'Order matters for the answer, so the second pass walks the original list, not the tally.',
    ],
    skills: ['counter', 'hash-map'],
    wrongApproach:
      'def first_unique(ids):\n    for i in ids:\n        if ids.count(i) == 1:\n            return i\n    return None\n',
    tests: `
expect(first_unique(["a", "b", "a"]), "b", "b is unique")
expect(first_unique(["a", "a"]), None, "everything repeats")
expect(first_unique([]), None, "empty log")
expect(first_unique(["x"]), "x", "single entry")
expect(first_unique(["a", "b", "b", "a", "c"]), "c", "unique appears last")

big = ["id-%d" % (i % 3_000) for i in range(6_000)] + ["only-me"]
under(0.5, "stays fast on a long log", lambda: first_unique(big))
`,
  },
];
