// foundationsModels — DATA configs for the StateTrace template (StateTrace.jsx).
// A "binding & identity" driven model is a config here, NOT a new component. This
// is the scalable core: filling these modules becomes authoring, not engineering.
// ops .label/.code may be a string or fn(count); identity exprs run `A is B`.

export const ALIASING = {
  modeLabel: 'Bind b as',
  setup: ['a = [1, 2]'],
  modes: [
    { id: 'alias', label: 'b = a', code: ['b = a'] },
    { id: 'copy', label: 'b = a.copy()', code: ['b = a.copy()'] },
  ],
  ops: [
    { id: 'append', label: n => 'a.append(' + (3 + n) + ')', code: n => 'a.append(' + (3 + n) + ')', counts: true },
    { id: 'rebind', label: 'a = [99]', code: 'a = [99]' },
  ],
  watch: ['a', 'b'],
  identity: [['a', 'b']],
  render: 'objects',
  takeaway: (s) => !s ? '' : (s.ident.i0
    ? 'One list, two names. Mutating through a shows up in b — they are the same object.'
    : 'a and b point at different objects now — a copy or a rebind broke the link.'),
};

export const COPY_DEEPCOPY = {
  modeLabel: 'Copy as',
  setup: ['import copy', 'x = [[1, 2], [3, 4]]'],
  modes: [
    { id: 'shallow', label: 'y = x.copy()', code: ['y = x.copy()'] },
    { id: 'deep', label: 'y = deepcopy(x)', code: ['y = copy.deepcopy(x)'] },
  ],
  ops: [
    { id: 'inner', label: n => 'x[0].append(' + (9 + n) + ')', code: n => 'x[0].append(' + (9 + n) + ')', counts: true },
    { id: 'outer', label: 'x.append([5,6])', code: 'x.append([5, 6])' },
  ],
  watch: ['x', 'y'],
  identity: [['x[0]', 'y[0]']],
  render: 'values',
  takeaway: (s) => !s ? '' : (s.ident.i0
    ? 'Shallow copy shares the inner lists — mutating x[0] changed y[0] too.'
    : 'Fully independent: deepcopy copied all the way down, so x never touches y.'),
};

export const MUTABLE_DEFAULT = {
  setup: ['def add(x, bucket=[]):', '    bucket.append(x)', '    return bucket'],
  ops: [
    { id: 'call', label: n => 'add(' + (n + 1) + ')', code: n => 'add(' + (n + 1) + ')', counts: true },
  ],
  watch: [{ expr: 'add.__defaults__[0]', label: 'shared default' }],
  identity: [],
  render: 'values',
  takeaway: (s) => !s ? '' : 'The default list is created ONCE at definition and reused on every call with no argument — so it accumulates instead of starting empty. The fix: default to None, build a fresh list inside.',
};
