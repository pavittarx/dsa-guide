/*
 * Drivers for the runnable code blocks.
 *
 * The blocks in the guide are teaching snippets: most define a function and
 * never call it, so on their own they'd print nothing. Each entry here adds
 * the sample input needed to make the block produce meaningful output.
 *
 * `before` is prepended (setup the block depends on), `after` is appended
 * (the call that exercises it). Both are shown to the reader in the editor,
 * so nothing runs that they can't see and change.
 */

export interface Demo {
  before?: string;
  after?: string;
}

export const DEMOS: Record<string, Demo> = {
  'two-sum-brute': {
    after: `
nums, target = [2, 7, 11, 15, 1, 8], 23
print("indices:", two_sum(nums, target))`,
  },

  'two-sum-hash': {
    after: `
nums, target = [2, 7, 11, 15, 1, 8], 23
print("indices:", two_sum(nums, target))`,
  },

  'longest-unique': {
    after: `
for s in ["abcabb", "bbbbb", "pwwkew", ""]:
    print(f"{s!r:10} -> {longest_unique(s)}")`,
  },

  'min-capacity': {
    after: `
weights = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
for days in (1, 5, 10):
    print(f"{days:2} days -> capacity {min_capacity(weights, days)}")`,
  },

  'next-greater': {
    after: `
temps = [73, 74, 75, 71, 69, 72, 76, 73]
print("input: ", temps)
print("answer:", next_greater(temps))`,
  },

  bfs: {
    after: `
graph = {"a": ["b", "c"], "b": ["d"], "c": ["d"], "d": []}
print("distances from 'a':", bfs("a", graph))`,
  },

  'climb-naive': {
    after: `
import time

# Exponential. Nudge n up and watch the wall clock explode.
n = 30
start = time.perf_counter()
result = climb(n)
print(f"climb({n}) = {result}")
print(f"took {time.perf_counter() - start:.3f}s")`,
  },

  'climb-cache': {
    after: `
import time

n = 30
start = time.perf_counter()
print(f"climb({n}) = {climb(n)}")
print(f"took {time.perf_counter() - start:.6f}s   <- same n as the naive version")

# Now a size the naive version could never reach.
print(f"climb(90) = {climb(90)}")`,
  },

  'climb-mutable-default': {
    // The block itself is a deliberate stub (`...`), so the driver demonstrates
    // the bug it's warning about on a function you can actually run.
    after: `
# The default is created ONCE, at definition time, and reused for every call.
def collect(x, acc=[]):
    acc.append(x)
    return acc

print(collect(1))
print(collect(2))   # <- still holding 1
print(collect(3))   # <- and 2

# The fix: a fresh object per call.
def collect_ok(x, acc=None):
    acc = [] if acc is None else acc
    acc.append(x)
    return acc

print(collect_ok(1), collect_ok(2), collect_ok(3))`,
  },

  'climb-bottom-up': {
    after: `
print("climb(30) =", climb(30))
print("climb(90) =", climb(90))`,
  },

  'climb-two-vars': {
    after: `
print("climb(30) =", climb(30))
print("climb(90) =", climb(90))`,
  },

  'max-subarray': {
    after: `
print(max_subarray([-2, 1, -3, 4, -1, 2, 1, -5, 4]))   # expect 6
print(max_subarray([-3, -1, -7]))                      # all negative -> -1`,
  },

  'max-profit': {
    after: `
print(max_profit([7, 1, 5, 3, 6, 4]))   # expect 5
print(max_profit([7, 6, 4, 3, 1]))      # only losses -> 0`,
  },

  'dfs-iterative': {
    after: `
graph = {"a": ["b", "c"], "b": ["d"], "c": ["d"], "d": []}
print(dfs("a", graph))
# None — this version only walks the graph. Add \`return seen\` to the
# function above and run again to see what it visited.`,
  },

  'dupes-counter': {
    after: `
print(dupes([1, 2, 2, 3, 4, 4, 4, 5]))
print(dupes(["a", "b", "a", "c"]))`,
  },

  'orm-n-plus-one': {
    // Stands in for the Django models the snippet assumes, and counts the
    // SELECTs so the 1 + N pattern shows up as a number, not just a claim.
    before: `
# ---- stand-in for the ORM, counting every SELECT it issues ----
QUERIES = 0

class Customer:
    def __init__(self, name):
        self._name = name

    @property
    def name(self):
        global QUERIES
        QUERIES += 1          # lazy load: one SELECT per access
        return self._name

class Row:
    def __init__(self, i):
        self.customer = Customer(f"customer-{i}")

class _Manager:
    def filter(self, **kwargs):
        global QUERIES
        QUERIES += 1          # the initial SELECT
        return [Row(i) for i in range(8)]

class Order:
    objects = _Manager()

user = "u1"
# ---------------------------------------------------------------`,
    after: `
print(f"\\n{QUERIES} SQL queries for {len(orders)} orders  (1 + N)")`,
  },

  'rate-limiter': {
    after: `
# limit=3 per 60s window
for t in (0, 1, 2, 3, 61):
    print(f"t={t:3}s -> {'allow' if allow(t, limit=3, span=60) else 'DENY '}   window={list(window)}")`,
  },
};
