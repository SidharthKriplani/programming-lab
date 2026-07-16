// lessonThreads — Climb mode: the learnpython.org/SQLBolt format, scaled from
// PyTutorial (where it is already proven: lesson ladder + inline runCheck
// grading) to the Foundations rooms (D-PL-25).
//
// A THREAD is a room's modules re-sequenced as a guided climb:
//   read (<=120 words) -> drive the module's model -> YOUR TURN (graded in
//   Pyodide via runCheck) -> next. Browse mode stays; Climb is the on-ramp.
//
// Schema per thread:
//   room     — foundationsRooms room id
//   status   — 'planned' | 'ready'
//   steps    — ordered [{ module, read, yourTurn?: { prompt, starter, check } }]
//     module   — module id from foundationsRooms (the model to drive)
//     read     — the <=120-word setup (authored at build time; stubs say what it must teach)
//     yourTurn — optional graded exercise (same check format as pyTutorial tasks)
//
// Status: SKELETON. Room 1's thread is sequenced with step intents; the A1
// authoring session writes the read/yourTurn content to CONTENT-STANDARD and
// flips status. Remaining trunk rooms get threads room-by-room (A2+). C++
// (room 11) is thread + CppTrace, no code-writing grading — reading-first by
// design (the recorded seam: compiled C++ grading lives outside PL).

export const LESSON_THREADS = [
  {
    room: 'python-foundations',
    status: 'planned',
    title: 'Climb: Python Foundations',
    steps: [
      { module: 'pf-binding',         read: 'STUB: names point at objects; variables are labels, not boxes. Sets up the aliasing demo.' },
      { module: 'pf-mutate-vs-rebind', read: 'STUB: two ways a name and its object part company. append vs = [9].',
        yourTurn: { prompt: 'Fix shared-list aliasing so each player gets an independent scoreboard.', starter: 'STUB', check: 'STUB' } },
      { module: 'pf-copy-deepcopy',   read: 'STUB: shallow copies share the inner layers.' },
      { module: 'pf-mutable-default', read: 'STUB: defaults evaluate once, at def time.',
        yourTurn: { prompt: 'Repair the accumulating-default function with the None sentinel.', starter: 'STUB', check: 'STUB' } },
      { module: 'pf-legb',            read: 'STUB: the four scopes a name climbs.' },
      { module: 'pf-late-binding',    read: 'STUB: closures capture names, not values.' },
      { module: 'pf-args',            read: 'STUB: how Python binds call arguments to parameters.' },
      { module: 'pf-generators',      read: 'STUB: lazy, one-shot, and why that saves memory.',
        yourTurn: { prompt: 'Convert the list-builder to a generator; prove memory stays flat.', starter: 'STUB', check: 'STUB' } },
      { module: 'pf-dunders',         read: 'STUB: the language calls your object; dunders are how it asks.' },
      { module: 'pf-truthiness',      read: 'STUB: __bool__ then __len__ then default True.' },
      { module: 'pf-iteration',       read: 'STUB: what a for-loop actually calls.' },
      { module: 'pf-is-vs-eq',        read: 'STUB: identity vs equality; the small-int cache lies to you.' },
      { module: 'pf-bytes-str',       read: 'STUB: text is str, the wire is bytes; encoding is the border crossing.',
        yourTurn: { prompt: 'Decode the mystery bytes correctly; explain the mojibake attempt.', starter: 'STUB', check: 'STUB' } },
      { module: 'pf-classes',         read: 'STUB: instance __dict__ vs class __dict__.' },
      { module: 'pf-inheritance',     read: 'STUB: the MRO settles the diamond.' },
      { module: 'pf-dataclasses',     read: 'STUB: structure for free; where generated methods come from.' },
      { module: 'pf-decorators',      read: 'STUB: a function wrapping a function, nothing more.',
        yourTurn: { prompt: 'Write a timing decorator that preserves the wrapped identity (wraps).', starter: 'STUB', check: 'STUB' } },
      { module: 'pf-context',         read: 'STUB: __enter__/__exit__; cleanup runs even on the raise path.' },
    ],
  },
  // A2+: one thread per trunk room, authored in build order.
  { room: 'the-machine',              status: 'planned', title: 'Climb: The Machine',              steps: [] },
  { room: 'dsa-foundations',          status: 'planned', title: 'Climb: DSA',                      steps: [] },
  { room: 'array-dataframe-foundations', status: 'planned', title: 'Climb: NumPy & pandas',        steps: [] },
  { room: 'concurrency-foundations',  status: 'planned', title: 'Climb: Concurrency',              steps: [] },
  { room: 'shipping-python',          status: 'planned', title: 'Climb: Shipping Python',          steps: [] },
  // Branch threads come after the trunk has climbs; room 11's pairs with CPP_TRACES.
];

export const THREAD_BY_ROOM = Object.fromEntries(LESSON_THREADS.map(t => [t.room, t]));
