/*
 * The Inventory (requirements FR-I1..FR-I5).
 *
 * Promoted from the guide's toolkit table and three-moves frame, and revised
 * rather than copied: a table row cannot teach a heap, so every entry carries a
 * worked micro-example and the one mistake people actually make with it.
 */

import type { Primitive } from '../problems/_types';

export const MOVES = {
  remember: {
    label: 'remember',
    blurb: 'Spend memory so you never compute the same thing twice.',
    symptom: 'The inner loop is re-deriving a fact the outer loop already knew.',
  },
  order: {
    label: 'order',
    blurb: 'Impose structure once, then exploit it many times.',
    symptom: 'You keep asking for the smallest, nearest, or next larger thing.',
  },
  once: {
    label: 'once',
    blurb: 'Touch each element a bounded number of times.',
    symptom: 'Nested loops where the inner one never needs to go backwards.',
  },
  structural: {
    label: 'structural',
    blurb: "Doesn't speed anything up alone — it makes a single pass possible.",
    symptom: 'You need to process something later, in a particular order.',
  },
} as const;

export const PRIMITIVES: Primitive[] = [
  {
    id: 'hash-map',
    name: 'Hash map / set',
    cost: 'O(1) average insert and lookup',
    purpose:
      'Answer "have I seen this?", "how many of each?", and "where is it?" without re-scanning. Solves more real problems than everything else here combined.',
    move: 'remember',
    unit: 1,
    micro: 'seen = {}\nfor i, x in enumerate(nums):\n    if target - x in seen:\n        return [seen[target - x], i]\n    seen[x] = i',
    pitfall:
      'O(1) is the average, not a guarantee — and keys must be hashable, so a list can never be a key while a tuple can.',
  },
  {
    id: 'counter',
    name: 'Counting & grouping',
    cost: 'O(n) to build',
    purpose:
      'Tally occurrences or bucket items by a computed key. Turns "are these anagrams", "most common error", and "group by shape" into two lines.',
    move: 'remember',
    unit: 1,
    micro: 'from collections import Counter\nCounter("mississippi").most_common(2)   # [("i", 4), ("s", 4)]',
    pitfall:
      'Counter returns 0 for missing keys instead of raising, so a typo in a key reads as "seen zero times" rather than an error.',
  },
  {
    id: 'two-pointers',
    name: 'Two pointers',
    cost: 'O(n)',
    purpose:
      'Not a data structure — a discipline. Two indices that only move forward, so the array is covered in one pass instead of n passes.',
    move: 'once',
    unit: 2,
    micro: 'lo, hi = 0, len(a) - 1\nwhile lo < hi:\n    s = a[lo] + a[hi]\n    if s == target: return (lo, hi)\n    if s < target: lo += 1\n    else: hi -= 1',
    pitfall:
      'It needs sortedness (or some other reason the discarded side cannot hold the answer). On unsorted input the argument collapses.',
  },
  {
    id: 'sliding-window',
    name: 'Sliding window',
    cost: 'O(n)',
    purpose:
      'Best contiguous run satisfying a constraint. Expand right, shrink left while violated, record the answer.',
    move: 'once',
    unit: 3,
    micro: 'L = best = 0\nfor R, ch in enumerate(s):\n    while ch in window:\n        window.remove(s[L]); L += 1\n    window.add(ch)\n    best = max(best, R - L + 1)',
    pitfall:
      'Only valid when shrinking can actually fix a violation. Introduce negative numbers into a sum constraint and the window silently returns a wrong answer.',
  },
  {
    id: 'prefix-sums',
    name: 'Prefix sums',
    cost: 'O(n) build, O(1) query',
    purpose:
      'Precompute cumulative totals so any range sum is one subtraction. Turns "sum of every subarray" from quadratic into linear.',
    move: 'remember',
    unit: 4,
    micro: 'pre = [0]\nfor x in nums: pre.append(pre[-1] + x)\nrange_sum = pre[j + 1] - pre[i]',
    pitfall:
      'Off-by-one at the boundary. Keep the leading 0 and the formula stays `pre[j+1] - pre[i]` every time.',
  },
  {
    id: 'binary-search',
    name: 'Binary search',
    cost: 'O(log n)',
    purpose:
      'Find the boundary in anything monotonic — where "no" flips to "yes" and never flips back. Sorted arrays are only the most familiar case.',
    move: 'order',
    unit: 5,
    micro: 'while lo < hi:\n    mid = lo + (hi - lo) // 2\n    if ok(mid): hi = mid\n    else:       lo = mid + 1\nreturn lo',
    pitfall:
      'Pick one template and never deviate. Mixing `<` and `<=` conventions between problems is how the off-by-one gets in.',
  },
  {
    id: 'binary-search-answer',
    name: 'Binary search on the answer',
    cost: 'O(n log range)',
    purpose:
      "When you can't compute the answer but can cheaply check a candidate — and any candidate that works implies all larger ones do — search the answer space itself.",
    move: 'order',
    unit: 6,
    micro: '# what am I searching over? what is the check? is it monotone?\nlo, hi = max(weights), sum(weights)',
    pitfall:
      'Skipping the monotonicity check. If a bigger candidate can fail where a smaller one succeeded, the search is meaningless.',
  },
  {
    id: 'stack',
    name: 'Stack & monotonic stack',
    cost: 'O(1) per push/pop',
    purpose:
      '"Deal with this later, most recent first." The monotonic variant answers "next greater/smaller element" for every position in one pass.',
    move: 'structural',
    unit: 7,
    micro: 'for i, x in enumerate(nums):\n    while stack and nums[stack[-1]] < x:\n        res[stack.pop()] = x\n    stack.append(i)',
    pitfall:
      'Decide up front whether ties count: `<` versus `<=` silently changes the answer on inputs with duplicates.',
  },
  {
    id: 'deque',
    name: 'Queue / deque',
    cost: 'O(1) at both ends',
    purpose: '"Deal with this later, oldest first." BFS, sliding-window maxima, ring buffers.',
    move: 'structural',
    unit: 11,
    micro: 'from collections import deque\nq = deque([start]); q.popleft()',
    pitfall: '`list.pop(0)` is O(n) and turns a linear scan quadratic. Use `deque.popleft()`.',
  },
  {
    id: 'heap',
    name: 'Heap',
    cost: 'O(log n) push/pop, O(1) peek',
    purpose:
      'Repeatedly get the current smallest or largest while the set keeps changing. Top-k, merging streams, schedulers.',
    move: 'order',
    unit: 8,
    micro: 'import heapq\nheap = []\nfor x in stream:\n    heapq.heappush(heap, x)\n    if len(heap) > k: heapq.heappop(heap)   # keeps the k largest',
    pitfall:
      'A heap is not a sorted list. Only `heap[0]` is meaningful — printing the rest looks scrambled because it is.',
  },
  {
    id: 'memoisation',
    name: 'Memoisation',
    cost: 'varies',
    purpose:
      'One decorator that turns exponential recursion into polynomial. The highest-leverage line of code in this list.',
    move: 'remember',
    unit: 13,
    micro: 'from functools import cache\n\n@cache\ndef climb(n):\n    return n if n <= 2 else climb(n-1) + climb(n-2)',
    pitfall:
      'It only helps when subproblems actually repeat, and the arguments must be hashable. `def f(x, memo={})` shares one dict across every call, forever.',
  },
];

export const byId = (id: string) => PRIMITIVES.find((p) => p.id === id);
