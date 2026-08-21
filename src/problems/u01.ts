/*
 * Unit 01 — Hashing & counting.
 *
 * Same house style as unit 00, in all three languages: reference solutions are
 * written the long way, with explicit loops and names that say what the thing
 * is. Comprehensions and their equivalents appear only as a final "the short
 * way" rung, after the mechanism has been made visible.
 *
 * The varied set is deliberately not four flavours of the same question: an
 * index lookup, a grouping by computed key, a tally, and a set walk. They look
 * different on the page and are the same skill underneath — which is the point.
 *
 * C++ suites assert correctness only; wall-clock on a shared public compiler
 * service cannot meet the 50x margin rule (see unit 00's header).
 */

import type { Problem } from './_types';

export const problems: Problem[] = [
  {
    id: 'u01-lookup-service',
    title: 'One query, then two hundred more',
    statement:
      'An endpoint takes a list of user ids and returns each user\'s display name. `profiles` holds every profile record. Return the names in the same order the ids were given.\n\nAssume every id exists in `profiles`.',
    origin: 'original',
    source: {
      name: 'Related: Two Sum (the same "look it up instead of scanning" move)',
      url: 'https://leetcode.com/problems/two-sum/',
    },
    entry: 'names_for',
    hints: [
      'For each id you are searching the whole profile list. How many times does the same record get re-read?',
      'The profile list does not change while you work, so the searching is wasted effort. Index it once.',
      'A lookup table from id to name costs one pass to build and makes every later lookup direct.',
    ],
    skills: ['hash-map'],
    impls: {
      python: {
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
        wrongApproach:
          'def names_for(ids, profiles):\n    out = []\n    for i in ids:\n        for p in profiles:\n            if p["id"] == i:\n                out.append(p["name"])\n                break\n    return out\n',
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
              'One loop to build the index, one loop to use it — side by side instead of nested. This is the same fix as an N+1 query in your ORM.',
          },
          {
            label: 'the short way (same thing)',
            code: `def names_for(ids, profiles):
    name_of = {p["id"]: p["name"] for p in profiles}
    return [name_of[i] for i in ids]
`,
            complexity: 'O(len(profiles) + len(ids)) — identical to the rung above',
            insight:
              'A dict comprehension is just that first loop on one line. Read it as: "for every profile, map its id to its name."',
          },
        ],
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

      javascript: {
        starter:
          'function namesFor(ids, profiles) {\n  // ids:      user ids to resolve, in order\n  // profiles: [{ id: 1, name: "ada" }, ...]\n}\n',
        solution: `function namesFor(ids, profiles) {
  // Step 1: index the profiles once, id -> name.
  const nameOf = new Map();
  for (const profile of profiles) {
    nameOf.set(profile.id, profile.name);
  }

  // Step 2: answer each id with a direct lookup.
  const names = [];
  for (const userId of ids) {
    names.push(nameOf.get(userId));
  }

  return names;
}
`,
        wrongApproach: `function namesFor(ids, profiles) {
  const out = [];
  for (const id of ids) {
    for (const p of profiles) {
      if (p.id === id) { out.push(p.name); break; }
    }
  }
  return out;
}
`,
        ladder: [
          {
            label: 'search for each id',
            code: `function namesFor(ids, profiles) {
  const names = [];
  for (const userId of ids) {
    for (const profile of profiles) {      // restarts from the top every time
      if (profile.id === userId) {
        names.push(profile.name);
        break;
      }
    }
  }
  return names;
}
`,
            complexity: 'O(ids.length × profiles.length)',
            diesAt: '80,000 profiles × 20,000 ids → seconds',
            insight: 'The inner loop starts over for every id, re-reading records it has already seen.',
          },
          {
            label: 'index once, look up many',
            code: `function namesFor(ids, profiles) {
  const nameOf = new Map();
  for (const profile of profiles) {
    nameOf.set(profile.id, profile.name);
  }

  const names = [];
  for (const userId of ids) {
    names.push(nameOf.get(userId));
  }
  return names;
}
`,
            complexity: 'O(profiles.length + ids.length) time, O(profiles.length) space',
            insight: 'Two loops side by side instead of nested. A Map answers by key without scanning.',
          },
          {
            label: 'the short way (same thing)',
            code: `function namesFor(ids, profiles) {
  const nameOf = new Map(profiles.map((p) => [p.id, p.name]));
  return ids.map((id) => nameOf.get(id));
}
`,
            complexity: 'O(profiles.length + ids.length) — identical to the rung above',
            insight:
              '`new Map(pairs)` is that first loop; `ids.map` is the second. Same machine, fewer keystrokes.',
          },
        ],
        ladderDemo: `
// Setup: a big profile table, and a request resolving many ids at once.
const profiles = [];
for (let i = 0; i < 80000; i++) profiles.push({ id: i, name: "user-" + i });

const ids = [];
for (let i = 0; i < 80000; i += 4) ids.push(i);

const start = performance.now();
const names = namesFor(ids, profiles);
const elapsed = (performance.now() - start) / 1000;

console.log("resolved", ids.length, "ids against", profiles.length, "profiles");
console.log("first three:", names.slice(0, 3));
console.log("took " + elapsed.toFixed(3) + "s");
`,
        tests: `
const P = [{ id: 1, name: "ada" }, { id: 2, name: "grace" }, { id: 3, name: "alan" }];
expect(namesFor([2, 1], P), ["grace", "ada"], "order follows the ids");
expect(namesFor([], P), [], "no ids");
expect(namesFor([3, 3], P), ["alan", "alan"], "repeated id");
expect(namesFor([1, 2, 3], P), ["ada", "grace", "alan"], "all of them");

const big = [];
for (let i = 0; i < 80000; i++) big.push({ id: i, name: "user-" + i });
const ask = [];
for (let i = 0; i < 80000; i += 1) ask.push(i);
under(3.0, "stays fast at 80k profiles", () => namesFor(ask, big));
`,
      },

      cpp: {
        note: 'Profiles arrive as (id, name) pairs. C++ suites check correctness only.',
        starter:
          'vector<string> names_for(const vector<int>& ids,\n                         const vector<pair<int, string>>& profiles) {\n    // ids:      user ids to resolve, in order\n    // profiles: (id, name) pairs\n}\n',
        solution: `vector<string> names_for(const vector<int>& ids,
                         const vector<pair<int, string>>& profiles) {
    // Step 1: index the profiles once, id -> name.
    unordered_map<int, string> name_of;
    for (const auto& profile : profiles) {
        name_of[profile.first] = profile.second;
    }

    // Step 2: answer each id with a direct lookup.
    vector<string> names;
    for (int user_id : ids) {
        names.push_back(name_of[user_id]);
    }

    return names;
}
`,
        wrongApproach: `vector<string> names_for(const vector<int>& ids,
                         const vector<pair<int, string>>& profiles) {
    vector<string> names;
    for (int user_id : ids) {
        for (const auto& p : profiles) {
            if (p.first == user_id) { names.push_back(p.second); break; }
        }
    }
    reverse(names.begin(), names.end());   // wrong: order must follow the ids
    return names;
}
`,
        ladder: [
          {
            label: 'search for each id',
            code: `vector<string> names_for(const vector<int>& ids,
                         const vector<pair<int, string>>& profiles) {
    vector<string> names;
    for (int user_id : ids) {
        for (const auto& profile : profiles) {   // restarts from the top
            if (profile.first == user_id) {
                names.push_back(profile.second);
                break;
            }
        }
    }
    return names;
}
`,
            complexity: 'O(ids.size() × profiles.size())',
            diesAt: 'C++ keeps this survivable for longer — which is exactly how it reaches production',
            insight:
              'Each step is cheap in C++, so the quadratic hides behind fast constants until the data grows.',
          },
          {
            label: 'index once, look up many',
            code: `vector<string> names_for(const vector<int>& ids,
                         const vector<pair<int, string>>& profiles) {
    unordered_map<int, string> name_of;
    for (const auto& profile : profiles) {
        name_of[profile.first] = profile.second;
    }

    vector<string> names;
    for (int user_id : ids) {
        names.push_back(name_of[user_id]);
    }
    return names;
}
`,
            complexity: 'O(profiles.size() + ids.size()) average',
            insight: 'One pass to build the map, one to use it. The nesting is gone.',
          },
        ],
        ladderDemo: `
vector<pair<int, string>> profiles;
for (int i = 0; i < 80000; i++) profiles.push_back({i, "user-" + to_string(i)});

vector<int> ids;
for (int i = 0; i < 80000; i += 4) ids.push_back(i);

auto start = chrono::steady_clock::now();
vector<string> names = names_for(ids, profiles);
double elapsed = chrono::duration<double>(chrono::steady_clock::now() - start).count();

cout << "resolved " << ids.size() << " ids against " << profiles.size() << " profiles" << endl;
cout << "first: " << names[0] << endl;
cout << "took " << fixed << setprecision(3) << elapsed << "s" << endl;
`,
        tests: `
  vector<pair<int, string>> P = {{1, "ada"}, {2, "grace"}, {3, "alan"}};
  expect(names_for({2, 1}, P), vector<string>{"grace", "ada"}, "order follows the ids");
  expect(names_for({}, P), vector<string>{}, "no ids");
  expect(names_for({3, 3}, P), vector<string>{"alan", "alan"}, "repeated id");
  expect(names_for({1, 2, 3}, P), vector<string>{"ada", "grace", "alan"}, "all of them");
`,
      },
    },
  },

  {
    id: 'u01-canonical-skus',
    title: 'The same product, three spellings',
    statement:
      'A catalogue import produced SKU codes whose letters were shuffled by an upstream system: `"abc"`, `"cab"` and `"bca"` are all the same product. Group them.\n\nReturn a list of groups. Sort each group alphabetically, then sort the list of groups, so the result is deterministic.',
    origin: 'original',
    source: { name: 'Related: Group Anagrams', url: 'https://leetcode.com/problems/group-anagrams/' },
    entry: 'group_skus',
    hints: [
      'Two SKUs belong together when something you can compute from each of them is equal. What is that something?',
      'Sorting the letters of a code gives every member of a group the same string.',
      'Use that string as a key and append each sku into its bucket.',
    ],
    skills: ['hash-map', 'counter'],
    impls: {
      python: {
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
      javascript: {
        starter: 'function groupSkus(skus) {\n  // skus: array of code strings\n}\n',
        solution: `function groupSkus(skus) {
  // Step 1: two skus belong together when their letters, sorted, match.
  const groups = new Map();
  for (const sku of skus) {
    const letters = sku.split("").sort();   // "cab" -> ["a","b","c"]
    const key = letters.join("");           // -> "abc"
    if (!groups.has(key)) {
      groups.set(key, []);
    }
    groups.get(key).push(sku);
  }

  // Step 2: tidy the output so the answer is deterministic.
  const result = [];
  for (const group of groups.values()) {
    result.push(group.slice().sort());
  }
  result.sort(compareGroups);

  return result;
}

// Compare two groups item by item, the way Python compares lists.
function compareGroups(a, b) {
  for (let i = 0; i < Math.min(a.length, b.length); i++) {
    if (a[i] < b[i]) return -1;
    if (a[i] > b[i]) return 1;
  }
  return a.length - b.length;
}
`,
        wrongApproach: 'function groupSkus(skus) {\n  return skus.map((s) => [s]).sort();\n}\n',
        tests: `
expect(groupSkus(["abc", "cab", "xy"]), [["abc", "cab"], ["xy"]], "two groups");
expect(groupSkus([]), [], "nothing to group");
expect(groupSkus(["a"]), [["a"]], "single sku");
expect(groupSkus(["ab", "ba", "ab"]), [["ab", "ab", "ba"]], "duplicates stay");
expect(groupSkus(["ab", "cd"]), [["ab"], ["cd"]], "no shared group");

const big = [];
for (let i = 0; i < 60000; i++) big.push(("sku" + (i % 5000)).split("").sort().join(""));
under(5.0, "stays fast on a big catalogue", () => groupSkus(big));
`,
      },
      cpp: {
        note: 'C++ suites check correctness only.',
        starter: 'vector<vector<string>> group_skus(const vector<string>& skus) {\n    // skus: code strings\n}\n',
        solution: `vector<vector<string>> group_skus(const vector<string>& skus) {
    // Step 1: two skus belong together when their letters, sorted, match.
    map<string, vector<string>> groups;
    for (const string& sku : skus) {
        string key = sku;
        sort(key.begin(), key.end());     // "cab" -> "abc"
        groups[key].push_back(sku);
    }

    // Step 2: tidy the output so the answer is deterministic.
    vector<vector<string>> result;
    for (auto& entry : groups) {
        vector<string> group = entry.second;
        sort(group.begin(), group.end());
        result.push_back(group);
    }
    sort(result.begin(), result.end());

    return result;
}
`,
        wrongApproach: `vector<vector<string>> group_skus(const vector<string>& skus) {
    vector<vector<string>> result;
    for (const string& sku : skus) result.push_back({sku});
    sort(result.begin(), result.end());
    return result;
}
`,
        tests: `
  expect(group_skus({"abc", "cab", "xy"}),
         vector<vector<string>>{{"abc", "cab"}, {"xy"}}, "two groups");
  expect(group_skus({}), vector<vector<string>>{}, "nothing to group");
  expect(group_skus({"a"}), vector<vector<string>>{{"a"}}, "single sku");
  expect(group_skus({"ab", "ba", "ab"}),
         vector<vector<string>>{{"ab", "ab", "ba"}}, "duplicates stay");
  expect(group_skus({"ab", "cd"}),
         vector<vector<string>>{{"ab"}, {"cd"}}, "no shared group");
`,
      },
    },
  },

  {
    id: 'u01-top-error',
    title: 'What is actually failing?',
    statement:
      'Given a list of error codes from the last hour, return the code that appears most often. If several tie, return the one that is alphabetically first.',
    origin: 'original',
    entry: 'top_error',
    hints: [
      'One pass to tally, then one pass over the tally to pick a winner.',
      'Do not scan the original list again to count — that is the slow way.',
      'For the tie, only replace the best when the count is higher, or equal and the code sorts earlier.',
    ],
    skills: ['counter'],
    impls: {
      python: {
        note: 'Return None when there are no errors.',
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
      javascript: {
        note: 'Return null when there are no errors.',
        starter: 'function topError(codes) {\n  // codes: error codes seen in the last hour\n}\n',
        solution: `function topError(codes) {
  if (codes.length === 0) {
    return null;
  }

  // Step 1: tally how many times each code appeared.
  const counts = new Map();
  for (const code of codes) {
    if (counts.has(code)) {
      counts.set(code, counts.get(code) + 1);
    } else {
      counts.set(code, 1);
    }
  }

  // Step 2: pick the winner. On a tie, the alphabetically first code wins.
  let bestCode = null;
  let bestCount = 0;
  for (const [code, count] of counts) {
    if (bestCode === null) {
      bestCode = code;
      bestCount = count;
    } else if (count > bestCount) {
      bestCode = code;
      bestCount = count;
    } else if (count === bestCount && code < bestCode) {
      bestCode = code;
    }
  }

  return bestCode;
}
`,
        wrongApproach: `function topError(codes) {
  if (codes.length === 0) return null;
  let best = codes[0];
  for (const c of codes) {
    if (codes.filter((x) => x === c).length > codes.filter((x) => x === best).length) best = c;
  }
  return best;
}
`,
        tests: `
expect(topError(["500", "404", "500"]), "500", "clear winner");
expect(topError(["404", "500"]), "404", "tie goes alphabetical");
expect(topError([]), null, "no errors");
expect(topError(["a"]), "a", "single code");
expect(topError(["b", "b", "a", "a"]), "a", "tie at the top");

const big = [];
for (let i = 0; i < 20000; i++) big.push("code-" + (i % 900));
under(1.0, "stays fast on an hour of logs", () => topError(big));
`,
      },
      cpp: {
        note: 'Return "" when there are no errors. C++ suites check correctness only.',
        starter:
          'string top_error(const vector<string>& codes) {\n    // codes: error codes seen in the last hour; return "" if empty\n}\n',
        solution: `string top_error(const vector<string>& codes) {
    if (codes.empty()) {
        return "";
    }

    // Step 1: tally how many times each code appeared.
    unordered_map<string, int> counts;
    for (const string& code : codes) {
        counts[code] = counts[code] + 1;
    }

    // Step 2: pick the winner. On a tie, the alphabetically first code wins.
    bool have_best = false;
    string best_code;
    int best_count = 0;
    for (const auto& entry : counts) {
        const string& code = entry.first;
        int count = entry.second;
        if (!have_best || count > best_count) {
            have_best = true;
            best_code = code;
            best_count = count;
        } else if (count == best_count && code < best_code) {
            best_code = code;
        }
    }

    return best_code;
}
`,
        wrongApproach: `string top_error(const vector<string>& codes) {
    if (codes.empty()) return "";
    unordered_map<string, int> counts;
    for (const string& c : codes) counts[c]++;
    string best = codes[0];
    for (const auto& e : counts) if (e.second > counts[best]) best = e.first;
    return best;   // wrong: ignores the alphabetical tie-break
}
`,
        tests: `
  expect(top_error({"500", "404", "500"}), string("500"), "clear winner");
  expect(top_error({"404", "500"}), string("404"), "tie goes alphabetical");
  expect(top_error({}), string(""), "no errors");
  expect(top_error({"a"}), string("a"), "single code");
  expect(top_error({"b", "b", "a", "a"}), string("a"), "tie at the top");
`,
      },
    },
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
    hints: [
      'Put the days in a set first, so checking whether a day is present costs nothing.',
      'Walking upward from every day is quadratic. Walk only from days that begin a run.',
      'A day begins a run when the day before it is not in the set.',
    ],
    skills: ['hash-map'],
    impls: {
      python: {
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
      javascript: {
        starter: 'function longestStreak(days) {\n  // days: day numbers the user was active, unsorted\n}\n',
        solution: `function longestStreak(days) {
  // A Set makes "was the user active on day X?" free to ask.
  const active = new Set(days);

  let best = 0;
  for (const day of active) {
    // Only start counting from the FIRST day of a run. Without this guard
    // we would re-walk the same run from every day inside it.
    if (active.has(day - 1)) {
      continue;
    }

    let length = 1;
    let nextDay = day + 1;
    while (active.has(nextDay)) {
      length = length + 1;
      nextDay = nextDay + 1;
    }

    if (length > best) {
      best = length;
    }
  }

  return best;
}
`,
        wrongApproach: `function longestStreak(days) {
  const have = new Set(days);
  let best = 0;
  for (const d of have) {
    let length = 1;
    while (have.has(d + length)) length++;
    if (length > best) best = length;
  }
  return best;
}
`,
        tests: `
expect(longestStreak([100, 4, 200, 1, 3, 2]), 4, "1,2,3,4");
expect(longestStreak([]), 0, "never active");
expect(longestStreak([5]), 1, "one day");
expect(longestStreak([1, 1, 2]), 2, "duplicates do not extend a run");
expect(longestStreak([9, 7]), 1, "no consecutive days");

// The guard matters: without it this input is quadratic.
const big = [];
for (let i = 0; i < 60000; i++) big.push(i);
under(2.0, "stays linear on one long run", () => longestStreak(big));
`,
      },
      cpp: {
        note: 'C++ suites check correctness only.',
        starter:
          'int longest_streak(const vector<int>& days) {\n    // days: day numbers the user was active, unsorted\n}\n',
        solution: `int longest_streak(const vector<int>& days) {
    // A hash set makes "was the user active on day X?" free to ask.
    unordered_set<int> active(days.begin(), days.end());

    int best = 0;
    for (int day : active) {
        // Only start counting from the FIRST day of a run.
        if (active.count(day - 1) > 0) {
            continue;
        }

        int length = 1;
        int next_day = day + 1;
        while (active.count(next_day) > 0) {
            length = length + 1;
            next_day = next_day + 1;
        }

        if (length > best) {
            best = length;
        }
    }

    return best;
}
`,
        wrongApproach: `int longest_streak(const vector<int>& days) {
    unordered_set<int> have(days.begin(), days.end());
    return have.empty() ? 0 : (int)have.size();   // wrong: assumes one long run
}
`,
        tests: `
  expect(longest_streak({100, 4, 200, 1, 3, 2}), 4, "1,2,3,4");
  expect(longest_streak({}), 0, "never active");
  expect(longest_streak({5}), 1, "one day");
  expect(longest_streak({1, 1, 2}), 2, "duplicates do not extend a run");
  expect(longest_streak({9, 7}), 1, "no consecutive days");
`,
      },
    },
  },

  {
    id: 'u01-first-unique',
    title: 'The one that only happened once',
    statement:
      'A support tool needs the first request id in a log that appears exactly once in the whole log.\n\nNo pattern is named here. Decide what to reach for before you start typing.',
    origin: 'original',
    entry: 'first_unique',
    hints: [
      'You cannot decide whether the first id is unique until you have read the whole log.',
      'That points at two passes: one to learn the counts, one to answer.',
      'The answer depends on order, so the second pass walks the original list — not the tally.',
    ],
    skills: ['counter', 'hash-map'],
    impls: {
      python: {
        note: 'Return None when every id repeats.',
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
        wrongApproach:
          'def first_unique(ids):\n    for i in ids:\n        if ids.count(i) == 1:\n            return i\n    return None\n',
        tests: `
expect(first_unique(["a", "b", "a"]), "b", "b is unique")
expect(first_unique(["a", "a"]), None, "everything repeats")
expect(first_unique([]), None, "empty log")
expect(first_unique(["x"]), "x", "single entry")
expect(first_unique(["a", "b", "b", "a", "c"]), "c", "unique appears last")
expect(first_unique(["a", "b", "a", "c", "d"]), "b", "first of several uniques")

big = ["id-%d" % (i % 3_000) for i in range(6_000)] + ["only-me"]
under(0.5, "stays fast on a long log", lambda: first_unique(big))
`,
      },
      javascript: {
        note: 'Return null when every id repeats.',
        starter: 'function firstUnique(ids) {\n  // ids: request ids, in the order they were logged\n}\n',
        solution: `function firstUnique(ids) {
  // Pass 1: you cannot know an id is unique until you have seen the
  // whole log, so count everything first.
  const counts = new Map();
  for (const requestId of ids) {
    if (counts.has(requestId)) {
      counts.set(requestId, counts.get(requestId) + 1);
    } else {
      counts.set(requestId, 1);
    }
  }

  // Pass 2: walk the log in its original order and return the first
  // id whose count is one.
  for (const requestId of ids) {
    if (counts.get(requestId) === 1) {
      return requestId;
    }
  }

  return null;
}
`,
        wrongApproach: `function firstUnique(ids) {
  for (const id of ids) {
    if (ids.filter((x) => x === id).length === 1) return id;
  }
  return null;
}
`,
        tests: `
expect(firstUnique(["a", "b", "a"]), "b", "b is unique");
expect(firstUnique(["a", "a"]), null, "everything repeats");
expect(firstUnique([]), null, "empty log");
expect(firstUnique(["x"]), "x", "single entry");
expect(firstUnique(["a", "b", "b", "a", "c"]), "c", "unique appears last");
expect(firstUnique(["a", "b", "a", "c", "d"]), "b", "first of several uniques");

const big = [];
for (let i = 0; i < 30000; i++) big.push("id-" + (i % 15000));
big.push("only-me");
under(1.0, "stays fast on a long log", () => firstUnique(big));
`,
      },
      cpp: {
        note: 'Return "" when every id repeats. C++ suites check correctness only.',
        starter:
          'string first_unique(const vector<string>& ids) {\n    // ids: request ids, in log order; return "" if every id repeats\n}\n',
        solution: `string first_unique(const vector<string>& ids) {
    // Pass 1: count everything, because you cannot know an id is unique
    // until the whole log has been read.
    unordered_map<string, int> counts;
    for (const string& request_id : ids) {
        counts[request_id] = counts[request_id] + 1;
    }

    // Pass 2: walk the log in its original order.
    for (const string& request_id : ids) {
        if (counts[request_id] == 1) {
            return request_id;
        }
    }

    return "";
}
`,
        wrongApproach: `string first_unique(const vector<string>& ids) {
    unordered_map<string, int> counts;
    for (const string& id : ids) counts[id]++;
    string found = "";
    for (const string& id : ids) if (counts[id] == 1) found = id;
    return found;   // wrong: keeps the LAST unique id, not the first
}
`,
        tests: `
  expect(first_unique({"a", "b", "a"}), string("b"), "b is unique");
  expect(first_unique({"a", "a"}), string(""), "everything repeats");
  expect(first_unique({}), string(""), "empty log");
  expect(first_unique({"x"}), string("x"), "single entry");
  expect(first_unique({"a", "b", "b", "a", "c"}), string("c"), "unique appears last");
  expect(first_unique({"a", "b", "a", "c", "d"}), string("b"), "first of several uniques");
`,
      },
    },
  },
];
