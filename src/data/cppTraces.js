// cppTraces — CppTrace: the pythontutor-for-C++ format, PL edition (D-PL-25).
//
// THE HONESTY MODEL. There is no C++ runtime in the browser and PL will not
// fake one (the honest-widget rule). pythontutor's C++ mode compiles
// server-side; PL's equivalent is RECORDED TRUTH: every trace below is
// authored by compiling the exact snippet with g++ -fsanitize=address,undefined,
// running it, and transcribing the real frame/heap states into steps. The
// browser steps through a recording of reality, never a simulation of it.
//
// HOUSE RULE (extends the CPython-verified rule): a CppTrace ships ONLY after
// its snippet compiles and runs sanitizer-clean, and the recorded output
// matches. The verification line is part of the trace object — a trace
// without one fails review.
//
// INTERACTION: predict-then-step. At each step the learner predicts the next
// state (which frame dies, what the heap holds, what prints) BEFORE stepping —
// the same predict-first DNA as the gotchas.
//
// Schema per trace:
//   id        — the foundationsRooms module id this trace teaches
//   title     — display title
//   code      — the exact verified snippet, line-numbered by array index
//   verified  — compiler + flags + date + observed output (the receipt)
//   steps     — [{ line, note, stack: [{fn, vars:{name: value}}], heap: [{addr, label, value, freed?}], out?, predict? }]
//     predict — optional { q, options, answer } asked BEFORE revealing this step
//
// Status: FORMAT SKELETON + one fully-verified pilot trace. The A3 authoring
// session (see FOUNDATIONS-SPEC D-PL-25) fills the remaining room-11 steppers:
// cpp-pointers, cpp-raii, cpp-ownership, cpp-values, cpp-vector.

export const CPP_TRACES = [
  {
    id: 'cpp-stack-heap',
    title: 'Stack vs heap, for real this time',
    verified: 'g++ 13.3.0 -fsanitize=address,undefined -O0 · 2026-07-16 · output: 7 · sanitizer-clean',
    code: [
      'int* make_counter() {',
      '    int local = 5;',
      '    int* heap = new int(7);',
      '    local += 1;',
      '    return heap;',
      '}',
      'int main() {',
      '    int* p = make_counter();',
      '    printf("%d\\n", *p);',
      '    delete p;',
      '}',
    ],
    steps: [
      { line: 7, note: 'main starts. One frame on the stack; the heap is empty.',
        stack: [{ fn: 'main', vars: { p: '?' } }], heap: [] },
      { line: 1, note: 'make_counter is called - a NEW frame pushes on top of main.',
        stack: [{ fn: 'make_counter', vars: {} }, { fn: 'main', vars: { p: '?' } }], heap: [] },
      { line: 2, note: 'local lives INSIDE the frame. No allocation happened - the stack pointer just moved.',
        stack: [{ fn: 'make_counter', vars: { local: '5' } }, { fn: 'main', vars: { p: '?' } }], heap: [] },
      { line: 3, note: 'new int(7) allocates ON THE HEAP; only the POINTER lives in the frame.',
        predict: { q: 'Where does the 7 live?', options: ['In the make_counter frame', 'On the heap', 'In main\'s frame'], answer: 1 },
        stack: [{ fn: 'make_counter', vars: { local: '5', heap: '0x1000' } }, { fn: 'main', vars: { p: '?' } }],
        heap: [{ addr: '0x1000', label: 'int', value: '7' }] },
      { line: 4, note: 'Mutating local touches only the frame.',
        stack: [{ fn: 'make_counter', vars: { local: '6', heap: '0x1000' } }, { fn: 'main', vars: { p: '?' } }],
        heap: [{ addr: '0x1000', label: 'int', value: '7' }] },
      { line: 5, note: 'The frame DIES - local (6) is gone forever. The heap block SURVIVES because the heap does not care about frames. Returning &local instead would hand back a dead address: UB.',
        predict: { q: 'After return, what survives?', options: ['local and the heap int', 'Only the heap int', 'Nothing - both die'], answer: 1 },
        stack: [{ fn: 'main', vars: { p: '0x1000' } }],
        heap: [{ addr: '0x1000', label: 'int', value: '7' }] },
      { line: 9, note: 'main dereferences the pointer: the block is alive, prints 7. Verified output.',
        stack: [{ fn: 'main', vars: { p: '0x1000' } }],
        heap: [{ addr: '0x1000', label: 'int', value: '7' }], out: '7' },
      { line: 10, note: 'delete frees the block. Someone had to - the heap has no auto-cleanup. Forget this line and asan reports a leak; that ownership burden is exactly what RAII (next module) automates.',
        stack: [{ fn: 'main', vars: { p: '0x1000 (dangling)' } }],
        heap: [{ addr: '0x1000', label: 'int', value: '7', freed: true }] },
    ],
  },
  // A3 authoring session fills these five. status 'planned' + verified: null means
  // NOT RENDERABLE - the browser must never step an unverified trace (house rule).
  { id: 'cpp-pointers',  title: 'Pointers vs references', status: 'planned', verified: null, code: [], steps: [],
    intent: '*p, &x, and a reference parameter - which one changes the caller\'s value, traced.' },
  { id: 'cpp-raii',      title: 'RAII: the destructor is the cleanup', status: 'planned', verified: null, code: [], steps: [],
    intent: 'Destructors fire in reverse scope order - including on the exception path - vs Python\'s with.' },
  { id: 'cpp-ownership', title: 'Ownership & move semantics', status: 'planned', verified: null, code: [], steps: [],
    intent: 'A vector passed by value, by reference, and moved - which copies allocate, which steal the pointer.' },
  { id: 'cpp-values',    title: 'Copies by default: the anti-Python', status: 'planned', verified: null, code: [], steps: [],
    intent: 'The same assignment side by side: Python binds a name, C++ copies the object - predict visible mutations.' },
  { id: 'cpp-vector',    title: 'What std::vector actually is', status: 'planned', verified: null, code: [], steps: [],
    intent: 'push_back through a capacity doubling - pointer/size/capacity - the myvec every entrance screen builds.' },
];

export const CPP_TRACE_IDS = CPP_TRACES.map(t => t.id);
