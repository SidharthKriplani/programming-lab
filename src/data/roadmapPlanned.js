// roadmapPlanned — the NON-problem skeleton registry (D-PL-22 companion).
// pyLabPlanned.js carries planned PROBLEMS; this file carries the planned
// STRUCTURES the strategy memos promised: bridge tracks, the Notebook->Service
// campaign schema, the problem-format engine roadmap, and cross-lab bridge
// links. All status 'planned' — display-only on RoadmapPage, zero build impact
// on gates/grading. Fleshing an item updates the page automatically.
// House syntax: single quotes; escape apostrophes as \' ; NO backticks.

// ── 1. BRIDGE TRACKS — career-transition flagships ─────────────────────────
// People buy transitions, not topics. Each track is an ordered spine over
// surfaces that already exist (worlds, rooms) or are stubbed (pyLabPlanned /
// foundationsRooms ids). prereqs = the tags the prerequisite-spine play uses.
export const BRIDGE_TRACKS = [
  {
    id: 'track-ds-mle',
    title: 'The DS -> MLE Bridge',
    tag: 'FLAGSHIP',
    audience: 'Notebook-fluent DS who has never shipped a package.',
    promise: 'One messy notebook in, one engineer out — the jump interviews actually test.',
    status: 'planned',
    spine: [
      { label: 'Python Foundations (rooms 1-2)', surface: 'foundations', prereq: 'pl-core' },
      { label: 'Testing & guardrails (room 6)', surface: 'foundations' },
      { label: 'Notebook -> Service campaign, stages 1-5', surface: 'campaign-n2s' },
      { label: 'Design katas: the object-design round', surface: 'format-kata' },
      { label: 'Multi-file repo problems', surface: 'format-multifile' },
    ],
  },
  {
    id: 'track-aie-floor',
    title: 'The AIE Software Floor',
    tag: 'ASYNC-FIRST',
    audience: 'Anyone building LLM apps without SWE formation — the 80%-software role.',
    promise: 'The concurrency, API, and design floor every AIE loop assumes and nobody teaches.',
    status: 'planned',
    spine: [
      { label: 'Concurrency & Parallelism (room 5)', surface: 'foundations', prereq: 'pl-async' },
      { label: 'Async world: semaphore-bounded gather, races, backpressure', surface: 'plan-async-*' },
      { label: 'Design kata: the rate-limited LLM client', surface: 'format-kata' },
      { label: 'Patterns through real source (sklearn / PyTorch / LangChain)', surface: 'format-patterns' },
      { label: 'Bridge links into GSL tool-call & serving modules', surface: 'bridge-links' },
    ],
  },
  {
    id: 'track-systems-depth',
    title: 'Systems Depth (senior MLE / AIE)',
    tag: 'THE DEEP END',
    audience: 'Mid-career MLE/AIE augmenting into infra / inference / performance work.',
    promise: 'Measure the machine instead of reciting it — cache, GIL, floats, the GPU model.',
    status: 'planned',
    spine: [
      { label: 'The Machine (room 2) -> The Metal (room 8)', surface: 'foundations', prereq: 'pl-systems' },
      { label: 'Systems floor world: strides, GIL bench, Amdahl, float traps', surface: 'plan-sys-*' },
      { label: 'Tensors & Autograd (room 9)', surface: 'foundations' },
      { label: 'Error autopsy on perf misses', surface: 'format-autopsy' },
      { label: 'Bridge links into MSL eval / GSL inference modules', surface: 'bridge-links' },
    ],
  },
];

// ── 2. NOTEBOOK -> SERVICE — the campaign schema ────────────────────────────
// The stage SCHEMA + progression contract, so the engine build is fill-in.
// Progression: linear; passing stage N unlocks N+1; per-stage state
// locked | available | passed, persisted under pl_campaign_n2s_v1 (localStorage,
// same pattern as pl_tracks). Stage stubs live in pyLabPlanned (plan-n2s-*).
export const N2S_CAMPAIGN = {
  id: 'campaign-n2s',
  title: 'Notebook -> Service',
  premise: 'One realistic, messy analysis notebook, refactored across five graded stages into a tested, packaged, mock-served pipeline.',
  progression: 'linear-unlock',
  stateKey: 'pl_campaign_n2s_v1',
  status: 'planned',
  stages: [
    { n: 1, stubId: 'plan-n2s-stage1', title: 'Extract functions from the mess', gradedBy: 'tests', skills: ['pure functions', 'explicit inputs', 'kill hidden state'] },
    { n: 2, stubId: 'plan-n2s-stage2', title: 'Dicts become classes at the boundary', gradedBy: 'tests + AST', skills: ['dataclasses', 'interfaces between stages'] },
    { n: 3, stubId: 'plan-n2s-stage3', title: 'Package structure + config', gradedBy: 'tests + AST', skills: ['modules', 'config out of code', 'no globals'] },
    { n: 4, stubId: 'plan-n2s-stage4', title: 'Tests around the pipeline', gradedBy: 'meta-tests', skills: ['pytest', 'fixtures', 'edge matrix'] },
    { n: 5, stubId: 'plan-n2s-stage5', title: 'A mock inference endpoint', gradedBy: 'simulated requests', skills: ['handler contract', 'validation', '4xx vs 5xx'] },
  ],
};

// ── 3. PROBLEM FORMATS — the engine roadmap ────────────────────────────────
// Each format = a problem SHAPE the engine must learn to grade. schema = the
// fields a problem of this format carries; grading = how truth is decided.
// The exemplar-first discipline: each format ships with 1-2 harness-verified
// exemplars before any catalog authoring.
export const FORMATS_PLANNED = [
  {
    id: 'format-multifile',
    label: 'Multi-file repo problems',
    engine: 'Pyodide virtual FS: present a mini-repo, mount every file, run the test file against the learner\'s edits.',
    schema: 'files{path -> content} · editable[] · entryTest · solutionPatch',
    grading: 'pytest-style run: solution patch passes, starter fails',
    firstExemplar: 'edit pipeline/transforms.py until tests/test_pipeline.py goes green',
    status: 'planned',
  },
  {
    id: 'format-autopsy',
    label: 'Error autopsy',
    engine: 'Failure taxonomy + classifier hook on Submit: every miss tagged (wrong axis, mutation, off-by-one, dtype, boundary).',
    schema: 'taxonomy[] · classifier(submission, expected) -> tag · repsByTag',
    grading: 'classification only — feeds targeted-rep queues, never blocks',
    firstExemplar: 'axis-confusion tag wired to 3 existing numpy problems',
    status: 'planned',
  },
  {
    id: 'format-kata',
    label: 'Design katas',
    engine: 'Interface-contract grading: tests target a REQUIRED class interface; AST checks enforce structure (no globals, composition where specified).',
    schema: 'contract{className, methods[]} · behaviourTests · astRules[]',
    grading: 'tests against the contract + AST structure rules',
    firstExemplar: 'rate-limited LLM client: retries, timeout, usage counter',
    status: 'planned',
  },
  {
    id: 'format-patterns',
    label: 'Pattern-spotting reps',
    engine: 'Real library source excerpts (sklearn / PyTorch / LangChain) + which-pattern-and-why MCQ with distractor rationale.',
    schema: 'excerpt · source · pattern · distractors[] · whyTheyNeededIt',
    grading: 'MCQ with explanation gate',
    firstExemplar: 'sklearn estimator API as template method',
    status: 'planned',
  },
  {
    id: 'format-async-replay',
    label: 'Deterministic async races',
    engine: 'Seeded scheduler so races REPRODUCE: tests replay a fixed event order; the fix must hold under every replayed interleaving.',
    schema: 'scenario · schedule[] · raceAssertion · fixedAssertion',
    grading: 'replayed interleavings: broken code fails, fixed code passes all',
    firstExemplar: 'two workers, one counter — add the lock',
    status: 'planned',
  },
  {
    id: 'format-blind',
    label: 'Blind mode',
    engine: 'Per-problem toggle: no Check until final Submit; separate rating stream.',
    schema: 'flag on any runnable problem · blindRatingKey',
    grading: 'unchanged — the constraint is the feature',
    firstExemplar: 'any existing PyLab problem, blind toggle on',
    status: 'planned',
  },
];

// ── 4. BRIDGE LINKS — the cross-lab seam, first five ───────────────────────
// Ownership contract: PL owns software MECHANICS; GSL/MSL own domain-in-context.
// A link is a pointer, never a copy. direction: sibling module -> PL rep.
export const BRIDGE_LINKS = [
  { id: 'bl-1', from: { lab: 'GSL', module: 'Tool-calling & the agent loop' }, to: { surface: 'Async world', item: 'plan-async-semaphore' }, why: 'The tool-call loop assumes bounded-concurrency async; PL teaches the mechanic bare.' },
  { id: 'bl-2', from: { lab: 'GSL', module: 'Rate limiting for LLM serving' }, to: { surface: 'Design katas', item: 'format-kata: rate-limited client' }, why: 'GSL owns the serving context; PL owns the token-bucket mechanic and the object design.' },
  { id: 'bl-3', from: { lab: 'MSL', module: 'Numerical stability & precision' }, to: { surface: 'The Metal (room 8)', item: 'mt-precision' }, why: 'fp64 -> fp16 error accumulation is the substrate under every training-instability story.' },
  { id: 'bl-4', from: { lab: 'MSL', module: 'Silent data bugs' }, to: { surface: 'N->S campaign', item: 'plan-n2s-stage4' }, why: 'The cure for silent bugs is tests around the pipeline — the stage-4 skill, drilled.' },
  { id: 'bl-5', from: { lab: 'GSL', module: 'Inference & serving economics' }, to: { surface: 'The Metal (room 8)', item: 'mt-batching' }, why: 'Batch size vs latency is the same trade at two altitudes; PL runs the model of it.' },
];
