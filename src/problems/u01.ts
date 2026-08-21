/*
 * Unit 01 — Hashing & counting.
 *
 * Same house style as unit 00: reference solutions are written the long way,
 * with explicit loops and names that say what the thing is. Comprehensions and
 * `setdefault`-style shortcuts appear only as a final "the short way" rung,
 * after the mechanism has been made visible.
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
    source: {
      name: 'Related: Two Sum (the same "look it up instead of scanning" move)',
      url: 'https://leetcode.com/problems/two-sum/',
    },
    entry: 'names_for',
    starter:
      'def names_for(ids, profiles):\n    # ids:      user ids to resolve, in order\n    # profiles: [{"id": 1, "name": "ada"}, ...]\n    ...\n',
    solution: `def names_for(ids, profiles):
    # Step 1: index the profiles once, id -> name.
    name_of = {}
    for profile in profiles:
        user_id = profile["id"]
        name_of[user_id] = profile["name"]

    # Step 2: answer each id with a direct lookup.
    names = []
    for user_id in ids:
        names.append(name_of[user_id])

    return names
`,
    hints: [
      'For each id you are searching the whole profile list. How many times does the same record get re-read?',
      'The profile list does not change while you work, so the searching is wasted effort. Index it once.',
      'A dict from id to name costs one pass to build and makes every later lookup direct.',
    ],
    skills: ['hash-map'],
    ladder: [
      {
        label: 'search for each id',
        code: `def names_for(ids, profiles):
    names = []
    for user_id in ids:
        for profile in profiles:          # restarts from the top every time
            if profile["id"] == user_id:
                names.append(profile["name"])
                break
    return names
`,
        complexity: 'O(len(ids) × len(profiles))',
        diesAt: '80,000 profiles × 1,200 ids → seconds per request',
        insight:
          'The inner loop starts over for every id. By the time you resolve the last one you have read the same records a thousand times.',
      },
      {
        label: 'index once, look up many',
        code: `def names_for(ids, profiles):
    name_of = {}
    for profile in profiles:
        name_of[profile["id"]] = profile["name"]

    names = []
    for user_id in ids:
        names.append(name_of[user_id])
    return names
`,
        complexity: 'O(len(profiles) + len(ids)) time, O(len(profiles)) space',
        insight:
          'One loop to build the index, one loop to use it — side by side instead of nested. This is the same move as the classic pair-sum trick, and the same fix as an N+1 query in your ORM.',
      },
      {
        label: 'the short way (same thing)',
        code: `def names_for(ids, profiles):
    name_of = {p["id"]: p["name"] for p in profiles}
    return [name_of[i] for i in ids]
`,
        complexity: 'O(len(profiles) + len(ids)) — identical to the rung above',
        insight:
          'A dict comprehension is just that first loop, written on one line. Read it right-to-left: "for every profile, map its id to its name." The second line is the same trick for the output list.',
      },
    ],
    wrongApproach:
      'def names_for(ids, profiles):\n    out = []\n    for i in ids:\n        for p in profiles:\n            if p["id"] == i:\n                out.append(p["name"])\n                break\n    return out\n',
    ladderDemo: `
import time

# Setup: a big profile table, and a request resolving many ids at once.
profiles = []
for i in range(80_000):
    profiles.append({"id": i, "name": "user-%d" % i})

ids = []
for i in range(0, 80_000, 66):
    ids.append(i)

start = time.perf_counter()
names = names_for(ids, profiles)
elapsed = time.perf_counter() - start

print("resolved", len(ids), "ids against", len(profiles), "profiles")
print("first three:", names[:3])
print("took %.3fs" % elapsed)
`,
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
    starter: 'def group_skus(skus):\n    # skus: list of code strings\n    ...\n',
    solution: `def group_skus(skus):
    # Step 1: two skus belong together when their letters, sorted, match.
    # So use that sorted string as the bucket key.
    groups = {}
    for sku in skus:
        letters = sorted(sku)          # e.g. "cab" -> ["a", "b", "c"]
        key = "".join(letters)         # -> "abc"
        if key not in groups:
            groups[key] = []
        groups[key].append(sku)

    # Step 2: tidy the output so the answer is deterministic.
    result = []
    for key in groups:
        group = sorted(groups[key])
        result.append(group)
    result.sort()

    return result
`,
    hints: [
      'Two SKUs belong together when something you can compute from each of them is equal. What is that something?',
      'Sorting the letters of a code gives every member of a group the same string.',
      'Use that string as a dict key and append each sku into its bucket.',
    ],
    skills: ['hash-map', 'counter'],
    wrongApproach: 'def group_skus(skus):\n    return sorted([sorted([s]) for s in skus])\n',
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
    starter: 'def top_error(codes):\n    # codes: error codes seen in the last hour\n    ...\n',
    solution: `def top_error(codes):
    if len(codes) == 0:
        return None

    # Step 1: tally how many times each code appeared.
    counts = {}
    for code in codes:
        if code in counts:
            counts[code] = counts[code] + 1
        else:
            counts[code] = 1

    # Step 2: pick the winner. On a tie, the alphabetically first code wins.
    best_code = None
    best_count = 0
    for code in counts:
        count = counts[code]
        if best_code is None:
            best_code = code
            best_count = count
        elif count > best_count:
            best_code = code
            best_count = count
        elif count == best_count and code < best_code:
            best_code = code

    return best_code
`,
    hints: [
      'One pass to tally, then one pass over the tally to pick a winner.',
      'Do not scan the original list again to count — that is the slow way.',
      'For the tie, only replace the best when the count is higher, or equal and the code sorts earlier.',
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
    source: {
      name: 'Related: Longest Consecutive Sequence',
      url: 'https://leetcode.com/problems/longest-consecutive-sequence/',
    },
    entry: 'longest_streak',
    starter: 'def longest_streak(days):\n    # days: day numbers the user was active, unsorted\n    ...\n',
    solution: `def longest_streak(days):
    # A set makes "was the user active on day X?" free to ask.
    active = set(days)

    best = 0
    for day in active:
        # Only start counting from the FIRST day of a run.
        # Without this guard we would re-walk the same run from every
        # day inside it, which is what makes the naive version quadratic.
        if day - 1 in active:
            continue

        length = 1
        next_day = day + 1
        while next_day in active:
            length = length + 1
            next_day = next_day + 1

        if length > best:
            best = length

    return best
`,
    hints: [
      'Put the days in a set first, so checking whether a day is present costs nothing.',
      'Walking upward from every day is quadratic. Walk only from days that begin a run.',
      'A day begins a run when the day before it is not in the set.',
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
    starter: 'def first_unique(ids):\n    # ids: request ids, in the order they were logged\n    ...\n',
    solution: `def first_unique(ids):
    # Pass 1: you cannot know an id is unique until you have seen the
    # whole log, so count everything first.
    counts = {}
    for request_id in ids:
        if request_id in counts:
            counts[request_id] = counts[request_id] + 1
        else:
            counts[request_id] = 1

    # Pass 2: walk the log in its original order and return the first
    # id whose count is one.
    for request_id in ids:
        if counts[request_id] == 1:
            return request_id

    return None
`,
    hints: [
      'You cannot decide whether the first id is unique until you have read the whole log.',
      'That points at two passes: one to learn the counts, one to answer.',
      'The answer depends on order, so the second pass walks the original list — not the dict.',
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
