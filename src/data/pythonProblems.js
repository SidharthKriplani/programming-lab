// Bank C (first slice) — famous Python problems, by pattern, easy→med.
// Original problems framed in data scenarios; canon used as taxonomy only (moat).
// Test-based: implement the function so __pl_checks pass. Every solution + test
// VERIFIED in CPython (38/38 across the bank). Stored Python uses "double quotes"
// so the single-quoted JS strings need no inner escaping (house syntax rule).

export const PY_PATTERNS = {
  'hashing':        { label: 'Hashing & Frequency', accent: 'var(--accent)' },
  'sliding-window': { label: 'Sliding Window',      accent: 'var(--teal)' },
  'stack':          { label: 'Stack',               accent: 'var(--yellow)' },
  'prefix-sum':     { label: 'Prefix Sum',          accent: 'var(--green)' },
};
export const PY_PATTERN_ORDER = ['hashing', 'sliding-window', 'stack', 'prefix-sum'];

export const pythonProblems = [
  {
    id: 'py-first-unique',
    bank: 'python',
    pattern: 'hashing',
    title: 'First non-repeating event',
    difficulty: 'warmup',
    prompt: 'A log lists events in order. Return the first event that appears exactly once. If every event repeats (or the log is empty), return None. Aim for O(n) with a single dict — not a nested scan.',
    starterCode: 'from collections import Counter\n\ndef first_unique_event(events):\n    # return the first event that occurs exactly once, else None\n    pass',
    testSource: '__pl_checks = [\n  ("first non-repeat", lambda: first_unique_event(["a","b","a","c","b"]) == "c"),\n  ("all repeat -> None", lambda: first_unique_event(["x","x"]) is None),\n  ("empty -> None", lambda: first_unique_event([]) is None),\n  ("single", lambda: first_unique_event(["z"]) == "z"),\n]',
    solution: 'from collections import Counter\n\ndef first_unique_event(events):\n    counts = Counter(events)\n    for e in events:\n        if counts[e] == 1:\n            return e\n    return None',
    glassBox: { lesson: 'Two passes with a dict is O(n): one to count, one to find the first count==1. The nested-loop version (for each event, scan the rest) is O(n^2) — fine on a tiny log, a timeout at scale.' },
  },
  {
    id: 'py-two-sum',
    bank: 'python',
    pattern: 'hashing',
    title: 'Two transactions that hit a target',
    difficulty: 'core',
    prompt: 'Given a list of amounts and a target, return the indices [i, j] of the first two distinct amounts that sum to the target, or None. One pass, O(n): remember what you have seen.',
    starterCode: 'def find_pair(nums, target):\n    # return [i, j] of two amounts summing to target, else None\n    pass',
    testSource: '__pl_checks = [\n  ("basic", lambda: find_pair([2,7,11,15], 9) == [0,1]),\n  ("middle", lambda: find_pair([3,2,4], 6) == [1,2]),\n  ("no pair", lambda: find_pair([1,2], 10) is None),\n]',
    solution: 'def find_pair(nums, target):\n    seen = {}\n    for i, n in enumerate(nums):\n        if target - n in seen:\n            return [seen[target - n], i]\n        seen[n] = i\n    return None',
    glassBox: { lesson: 'The trick is to look for the *complement* (target - n) in a dict as you go. Membership in a dict is O(1), so the whole thing is one O(n) pass — versus the O(n^2) double loop most people write first.' },
  },
  {
    id: 'py-anagram',
    bank: 'python',
    pattern: 'hashing',
    title: 'Are two tags anagrams?',
    difficulty: 'warmup',
    prompt: 'Return True if b is an anagram of a (same characters, same counts), else False. A frequency count beats sorting at scale, and Counter makes it one line.',
    starterCode: 'from collections import Counter\n\ndef is_anagram(a, b):\n    # True if b is an anagram of a\n    pass',
    testSource: '__pl_checks = [\n  ("anagram", lambda: is_anagram("listen","silent") is True),\n  ("not", lambda: is_anagram("rat","car") is False),\n  ("empty", lambda: is_anagram("","") is True),\n  ("count matters", lambda: is_anagram("aab","abb") is False),\n]',
    solution: 'from collections import Counter\n\ndef is_anagram(a, b):\n    return Counter(a) == Counter(b)',
    glassBox: { lesson: 'Counter(a) == Counter(b) compares character frequencies in O(n). Sorting both and comparing is O(n log n) — correct, but slower, and it allocates two sorted copies.' },
  },
  {
    id: 'py-sliding-window',
    bank: 'python',
    pattern: 'sliding-window',
    title: 'Longest session with no repeated page',
    difficulty: 'core',
    prompt: 'Given a sequence of page views, return the length of the longest contiguous run with no repeated page. Slide a window: move the left edge past the last occurrence when you hit a repeat. O(n), not O(n^2).',
    starterCode: 'def longest_unique_run(seq):\n    # length of the longest contiguous run with no repeats\n    pass',
    testSource: '__pl_checks = [\n  ("abcabcbb", lambda: longest_unique_run("abcabcbb") == 3),\n  ("bbbbb", lambda: longest_unique_run("bbbbb") == 1),\n  ("empty", lambda: longest_unique_run("") == 0),\n  ("pwwkew", lambda: longest_unique_run("pwwkew") == 3),\n  ("list works too", lambda: longest_unique_run([1,2,3,1,2]) == 3),\n]',
    solution: 'def longest_unique_run(seq):\n    seen = {}\n    start = 0\n    best = 0\n    for i, x in enumerate(seq):\n        if x in seen and seen[x] >= start:\n            start = seen[x] + 1\n        seen[x] = i\n        best = max(best, i - start + 1)\n    return best',
    glassBox: { lesson: 'The window [start, i] holds a run with no repeats. On a repeat inside the window, jump start to just past the previous occurrence — never walk backwards. Each index is visited once: O(n). The brute force checks every substring: O(n^2) or worse.' },
  },
  {
    id: 'py-balanced',
    bank: 'python',
    pattern: 'stack',
    title: 'Validate a nested filter expression',
    difficulty: 'core',
    prompt: 'A filter string uses (), [], and {}. Return True if every bracket is closed by the matching type in the right order, else False. A stack is the natural fit: push openers, pop and check on closers.',
    starterCode: 'def is_balanced(s):\n    # True if all brackets () [] {} are matched and nested correctly\n    pass',
    testSource: '__pl_checks = [\n  ("matched", lambda: is_balanced("()[]{}") is True),\n  ("mismatch", lambda: is_balanced("(]") is False),\n  ("nested", lambda: is_balanced("([])") is True),\n  ("unclosed", lambda: is_balanced("(") is False),\n  ("empty", lambda: is_balanced("") is True),\n]',
    solution: 'def is_balanced(s):\n    pairs = {")": "(", "]": "[", "}": "{"}\n    stack = []\n    for ch in s:\n        if ch in "([{":\n            stack.append(ch)\n        elif ch in pairs:\n            if not stack or stack.pop() != pairs[ch]:\n                return False\n    return not stack',
    glassBox: { lesson: 'A stack remembers the most recent unclosed opener — exactly what a closer must match. Push on open, pop+check on close, and the stack must be empty at the end. Trying to do this with counters alone fails on "([)]".' },
  },
  {
    id: 'py-prefix-sum',
    bank: 'python',
    pattern: 'prefix-sum',
    title: 'Day revenue first crosses target',
    difficulty: 'warmup',
    prompt: 'Given daily revenue and a target, return the 1-based day on which the running (cumulative) total first exceeds the target, or -1 if it never does. One pass, carrying a running sum.',
    starterCode: 'def first_day_over(daily, target):\n    # 1-based day the cumulative total first exceeds target, else -1\n    pass',
    testSource: '__pl_checks = [\n  ("crosses day 3", lambda: first_day_over([10,20,30,40], 55) == 3),\n  ("never", lambda: first_day_over([1,1,1], 100) == -1),\n  ("day 1", lambda: first_day_over([100], 50) == 1),\n  ("empty", lambda: first_day_over([], 5) == -1),\n]',
    solution: 'def first_day_over(daily, target):\n    total = 0\n    for i, x in enumerate(daily):\n        total += x\n        if total > target:\n            return i + 1\n    return -1',
    glassBox: { lesson: 'A running total turns "cumulative-over-time" questions into a single pass. Re-summing daily[:i] inside the loop would make it O(n^2) — the prefix sum keeps it O(n).' },
  },
];

export default pythonProblems;
