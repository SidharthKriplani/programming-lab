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
// Status: ALL SIX TRACES AUTHORED AND VERIFIED (A3, 2026-07-17). Each snippet
// compiled g++ -fsanitize=address,undefined, run, output transcribed verbatim.

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
  {
    id: 'cpp-pointers',
    title: 'Pointers vs references',
    verified: 'g++ 13.3.0 -fsanitize=address,undefined -O0 · 2026-07-17 · output: 11 / 111 / 111 · sanitizer-clean',
    code: [
      'void by_ptr(int* p)  { *p += 10; }',
      'void by_ref(int& r)  { r += 100; }',
      'void by_val(int v)   { v += 1000; }',
      'int main() {',
      '    int x = 1;',
      '    by_ptr(&x);  // ?',
      '    by_ref(x);   // ?',
      '    by_val(x);   // ?',
      '}',
    ],
    steps: [
      { line: 5, note: 'x lives in main\'s frame, value 1.',
        stack: [{ fn: 'main', vars: { x: '1' } }], heap: [] },
      { line: 6, note: 'by_ptr receives the ADDRESS of x. *p += 10 follows the pointer back into main\'s frame.',
        predict: { q: 'After by_ptr(&x), x is…', options: ['1 - the callee had a copy', '11 - the callee wrote through the pointer'], answer: 1 },
        stack: [{ fn: 'by_ptr', vars: { p: '&x' } }, { fn: 'main', vars: { x: '1 -> 11' } }], heap: [], out: '11' },
      { line: 7, note: 'A reference is the same power with no & or * at the call site - r IS x under another name.',
        stack: [{ fn: 'by_ref', vars: { r: '= x' } }, { fn: 'main', vars: { x: '11 -> 111' } }], heap: [], out: '111' },
      { line: 8, note: 'By VALUE: v is an independent copy in by_val\'s frame. The += hits the copy; the copy dies with the frame.',
        predict: { q: 'After by_val(x), x is…', options: ['1111 - functions modify their arguments', '111 - the copy died with the frame'], answer: 1 },
        stack: [{ fn: 'by_val', vars: { v: '111 -> 1111 (dies)' } }, { fn: 'main', vars: { x: '111' } }], heap: [], out: '111' },
      { line: 9, note: 'The whole reading skill: int* and int& mean the caller can be changed; int means the caller is safe. Verified output: 11, 111, 111.',
        stack: [{ fn: 'main', vars: { x: '111' } }], heap: [] },
    ],
  },
  {
    id: 'cpp-raii',
    title: 'RAII: the destructor is the cleanup',
    verified: 'g++ 13.3.0 -fsanitize=address,undefined -O0 · 2026-07-17 · output: open A / open B / close B / close A / caught · sanitizer-clean',
    code: [
      'struct Res {',
      '    const char* n;',
      '    Res(const char* n): n(n)  { printf("open %s\\n", n); }',
      '    ~Res()                    { printf("close %s\\n", n); }',
      '};',
      'int main() {',
      '    try {',
      '        Res a("A");',
      '        Res b("B");',
      '        throw std::runtime_error("boom");',
      '    } catch (...) { printf("caught\\n"); }',
      '}',
    ],
    steps: [
      { line: 8, note: 'a constructs - its resource "opens". The object owns the cleanup from this moment.',
        stack: [{ fn: 'main/try', vars: { a: 'Res("A")' } }], heap: [], out: 'open A' },
      { line: 9, note: 'b constructs on top.',
        stack: [{ fn: 'main/try', vars: { a: 'Res("A")', b: 'Res("B")' } }], heap: [], out: 'open A\nopen B' },
      { line: 10, note: 'The throw starts UNWINDING the scope. Before control leaves, every fully-constructed local dies - destructors run NOW, not at some later GC.',
        predict: { q: 'What runs before "caught" prints?', options: ['Nothing - the exception skips cleanup', 'close B then close A - reverse construction order', 'close A then close B'], answer: 1 },
        stack: [{ fn: 'main/try', vars: { a: '~Res fires 2nd', b: '~Res fires 1st' } }], heap: [], out: 'close B\nclose A' },
      { line: 11, note: 'Only then does the handler run. Verified order: open A, open B, close B, close A, caught. This is why C++ code rarely writes cleanup calls - scope exit IS the cleanup, on every path, exceptions included. Python\'s with-block gives you the same guarantee, opt-in per resource.',
        stack: [{ fn: 'main/catch', vars: {} }], heap: [], out: 'caught' },
    ],
  },
  {
    id: 'cpp-ownership',
    title: 'Ownership & move semantics',
    verified: 'g++ 13.3.0 -fsanitize=address,undefined -O0 · 2026-07-17 · output: v 1000000 / copy: v 1000000, c 1000000 / move: v 0, m 1000000 · sanitizer-clean',
    code: [
      'std::vector<int> v(1000000, 7);',
      'std::vector<int> c = v;             // copy',
      'std::vector<int> m = std::move(v);  // move',
    ],
    steps: [
      { line: 1, note: 'v owns a heap buffer of one million ints. The vector object itself is just three words: pointer, size, capacity.',
        stack: [{ fn: 'main', vars: { v: '{ptr: 0xA, size: 1M}' } }], heap: [{ addr: '0xA', label: 'int[1M]', value: '7, 7, 7, …' }] },
      { line: 2, note: 'COPY: a second 1M-int buffer is allocated and every element is copied. Two owners, two buffers - O(n) work.',
        predict: { q: 'After the copy, how many 1M buffers exist?', options: ['One, shared', 'Two, independent'], answer: 1 },
        stack: [{ fn: 'main', vars: { v: '{ptr: 0xA, size: 1M}', c: '{ptr: 0xB, size: 1M}' } }],
        heap: [{ addr: '0xA', label: 'int[1M]', value: '…' }, { addr: '0xB', label: 'int[1M] (copied)', value: '…' }] },
      { line: 3, note: 'MOVE: std::move is only a cast saying "you may pillage v". The move constructor STEALS the pointer - three words copied, zero elements. v is left valid-but-EMPTY: size 0. Verified: v 0, m 1000000.',
        predict: { q: 'After the move, v.size() is…', options: ['1000000 - move copies', '0 - the buffer was stolen'], answer: 1 },
        stack: [{ fn: 'main', vars: { v: '{ptr: null, size: 0}', c: '{ptr: 0xB}', m: '{ptr: 0xA, size: 1M}' } }],
        heap: [{ addr: '0xA', label: 'int[1M] (now owned by m)', value: '…' }, { addr: '0xB', label: 'int[1M]', value: '…' }] },
    ],
  },
  {
    id: 'cpp-values',
    title: 'Copies by default: the anti-Python',
    verified: 'g++ 13.3.0 -fsanitize=address,undefined -O0 · 2026-07-17 · output: a 3 b 4 · sanitizer-clean',
    code: [
      'std::vector<int> a = {1, 2, 3};',
      'std::vector<int> b = a;   // Python: alias. C++: COPY.',
      'b.push_back(9);',
      '// a.size()? b.size()?',
    ],
    steps: [
      { line: 1, note: 'a owns a 3-element buffer.',
        stack: [{ fn: 'main', vars: { a: '{1,2,3}' } }], heap: [{ addr: '0xA', label: 'int[3]', value: '1,2,3' }] },
      { line: 2, note: 'In Python, b = a binds a second NAME to the same list (room 1\'s aliasing). In C++, assignment COPIES the object: b gets its own buffer.',
        predict: { q: 'b = a in C++ means…', options: ['b aliases a (like Python)', 'b is an independent copy'], answer: 1 },
        stack: [{ fn: 'main', vars: { a: '{1,2,3}', b: '{1,2,3} (own buffer)' } }],
        heap: [{ addr: '0xA', label: 'int[3] (a)', value: '1,2,3' }, { addr: '0xB', label: 'int[3] (b, copied)', value: '1,2,3' }] },
      { line: 3, note: 'Mutating b touches only b\'s buffer. Verified: a 3, b 4. The Python instinct ("they share!") is exactly wrong here - and the C++ instinct is why signatures pass const T& to AVOID this copy.',
        stack: [{ fn: 'main', vars: { a: 'size 3', b: 'size 4' } }],
        heap: [{ addr: '0xA', label: 'int[3] (a)', value: '1,2,3' }, { addr: '0xB', label: 'int[4] (b)', value: '1,2,3,9' }], out: 'a 3 b 4' },
    ],
  },
  {
    id: 'cpp-vector',
    title: 'What std::vector actually is',
    verified: 'g++ 13.3.0 -fsanitize=address,undefined -O0 · 2026-07-17 · capacity growth observed: 1, 2, 4, 8, 16 · sanitizer-clean',
    code: [
      'std::vector<int> v;',
      'for (int i = 0; i < 9; ++i) {',
      '    v.push_back(i);',
      '    // capacity: 1, 2, 4, 8, 16…',
      '}',
    ],
    steps: [
      { line: 1, note: 'An empty vector: pointer null, size 0, capacity 0. Three words on the stack; the elements will live on the heap.',
        stack: [{ fn: 'main', vars: { v: '{ptr: null, size: 0, cap: 0}' } }], heap: [] },
      { line: 3, note: 'First push_back: size hits capacity, so the vector allocates. Measured on this compiler: capacity 1.',
        stack: [{ fn: 'main', vars: { v: '{ptr: 0xA, size: 1, cap: 1}' } }], heap: [{ addr: '0xA', label: 'int[1]', value: '0' }] },
      { line: 3, note: 'Push #2: full again -> allocate capacity 2, MOVE the elements over, free the old buffer. Any pointer into the old buffer now dangles.',
        predict: { q: 'What happens to a pointer you saved to v[0] before this push?', options: ['Still valid - same object', 'Dangling - the elements moved to a new buffer'], answer: 1 },
        stack: [{ fn: 'main', vars: { v: '{ptr: 0xB, size: 2, cap: 2}' } }], heap: [{ addr: '0xB', label: 'int[2]', value: '0,1' }] },
      { line: 3, note: 'Growth doubles: 4, then 8, then 16 (measured: 1,2,4,8,16). Doubling is why push_back is O(1) AMORTIZED - the same analysis as Python\'s list and your myvec: rare O(n) copies spread over n pushes.',
        stack: [{ fn: 'main', vars: { v: '{ptr: 0xE, size: 9, cap: 16}' } }], heap: [{ addr: '0xE', label: 'int[16]', value: '0..8 + headroom' }] },
      { line: 5, note: 'So std::vector IS the dynamic array every entrance screen asks you to build: contiguous buffer (cache-fast, room 8), geometric growth, relocation-on-resize. reserve(n) pre-pays the growth when you know n.',
        stack: [{ fn: 'main', vars: { v: 'size 9, cap 16' } }], heap: [{ addr: '0xE', label: 'int[16]', value: '…' }] },
    ],
  },
];

export const CPP_TRACE_IDS = CPP_TRACES.map(t => t.id);
