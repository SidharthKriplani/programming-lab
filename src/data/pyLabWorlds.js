// pyLabWorlds — the 7 Worlds that organize PyLab\'s problem bank.
// Each World is a lens over a set of PYLAB_TOPICS. Problems are NOT exclusive to
// one world — the world is the entry point and default level, not a partition.
// Gate state (unlocked / method / defaultLevel) lives in worldGates.js (localStorage).
//
// DATA-FILE SYNTAX: single quotes only; escape apostrophes as \'; no backticks.

export const PYLAB_WORLDS = [
  {
    id: 'python-core',
    label: 'Python Core',
    icon: 'zap',
    tagline: 'The mechanics behind every data task',
    description: 'Variables, strings, lists, dicts, loops, functions, comprehensions. The layer that DA/DS/PA interviews assume you already have.',
    topics: ['python-core', 'idioms'],
    // what level the problem grid defaults to on entry, keyed by unlock method
    unlockDefaultLevel: { self: 'correctness', quiz: 'correctness', tutorial: 'fluency' },
    tutorialEnabled: true,  // this world has a tutorial (pyTutorial)
    quizCount: 3,
  },
  {
    id: 'pandas-numpy',
    label: 'pandas & numpy',
    icon: 'bar-chart',
    tagline: 'The 20 patterns in 90% of DA/DS take-homes',
    description: 'groupby, merge, window, reshape, vectorize — plus the traps that run clean, return plausible numbers, and lie quietly.',
    topics: ['pandas-groupby', 'pandas-merge', 'pandas-reshape', 'pandas-window', 'numpy-vectorize'],
    unlockDefaultLevel: { self: 'correctness', quiz: 'judgment', tutorial: 'fluency' },
    tutorialEnabled: false,
    quizCount: 3,
  },
  {
    id: 'dsa-patterns',
    label: 'DSA Patterns',
    icon: 'layers',
    tagline: '8 patterns that solve 80% of coding screens',
    description: 'Hashing, two-pointer, sliding window, binary search, heap, intervals, DFS/BFS, DP. By pattern, not by problem — no contest grind.',
    topics: ['dsa'],
    unlockDefaultLevel: { self: 'correctness', quiz: 'judgment', tutorial: 'fluency' },
    tutorialEnabled: false,
    quizCount: 3,
  },
  {
    id: 'python-internals',
    label: 'Python Internals',
    icon: 'cpu',
    tagline: 'The gaps between using Python and understanding it',
    description: 'is vs ==, mutable defaults, closures, generators, the GIL, memory model. The questions that separate mid from senior.',
    topics: ['internals'],
    unlockDefaultLevel: { self: 'correctness', quiz: 'judgment', tutorial: 'fluency' },
    tutorialEnabled: false,
    quizCount: 3,
  },
  {
    id: 'oop-design',
    label: 'OOP & Design',
    icon: 'puzzle',
    tagline: 'Design patterns for data and ML engineering',
    description: 'Classes, dunder methods, ABCs, composition, the iterator and context protocols. What separates a script from a system.',
    topics: ['oop'],
    unlockDefaultLevel: { self: 'correctness', quiz: 'judgment', tutorial: 'fluency' },
    tutorialEnabled: false,
    quizCount: 3,
  },
  {
    id: 'data-craft',
    label: 'Data Craft',
    icon: 'target',
    tagline: 'Judgment layer for analysts and scientists',
    description: 'Cleaning pipelines, funnels, retention matrices, the right denominator, metric ambiguity. The layer that separates analysis from arithmetic.',
    topics: ['data-craft'],
    unlockDefaultLevel: { self: 'correctness', quiz: 'judgment', tutorial: 'fluency' },
    tutorialEnabled: false,
    quizCount: 5,
  },
  {
    id: 'code-craft',
    label: 'Code Craft',
    icon: 'hammer',
    tagline: 'Production habits for ML and data engineers',
    description: 'Testing, typing, refactoring, reproducibility, code review. The habits that make the difference in senior+ interviews.',
    topics: ['testing', 'typing', 'code-craft'],
    unlockDefaultLevel: { self: 'correctness', quiz: 'judgment', tutorial: 'fluency' },
    tutorialEnabled: false,
    quizCount: 5,
  },
];

// Set of topic slugs that belong to a given world id.
export function worldTopicSet(worldId) {
  const w = PYLAB_WORLDS.find(x => x.id === worldId);
  return w ? new Set(w.topics) : new Set();
}

// Which world owns this topic (first match — topics should not overlap for now).
export function worldForTopic(topicSlug) {
  return PYLAB_WORLDS.find(w => w.topics.includes(topicSlug)) || null;
}
