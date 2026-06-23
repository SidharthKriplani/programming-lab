// arrayTraceModels — DATA configs for the ArrayTrace template (ArrayTrace.jsx).
// A DSA array-pattern trace is a config here, not a component. Each build(arr, p)
// returns steps: { roles:(idx)=>'normal'|'active'|'mid'|'dim'|'found', labels:{idx:str},
// note, tone?:'found'|'done', stats?:[{label,value,hue}] }.

export const TWO_POINTER = {
  array: [2, 3, 5, 8, 11, 14],
  param: { kind: 'slider', label: 'target', min: 5, max: 28, default: 19 },
  build: (arr, target) => {
    const steps = []; let lo = 0, hi = arr.length - 1;
    const labs = (l, h) => { const o = {}; o[l] = l === h ? 'lo·hi' : 'lo'; o[h] = 'hi'; return o; };
    while (lo < hi) {
      const sum = arr[lo] + arr[hi];
      if (sum === target) { const fl = lo, fh = hi; steps.push({ roles: i => (i === fl || i === fh) ? 'found' : 'normal', labels: labs(fl, fh), note: 'sum == target → found ' + arr[fl] + ' + ' + arr[fh], tone: 'found' }); return steps; }
      const cl = lo, ch = hi;
      if (sum < target) { steps.push({ roles: i => (i === cl || i === ch) ? 'active' : 'normal', labels: labs(cl, ch), note: 'sum ' + sum + ' < ' + target + ' → too small, move left pointer right' }); lo++; }
      else { steps.push({ roles: i => (i === cl || i === ch) ? 'active' : 'normal', labels: labs(cl, ch), note: 'sum ' + sum + ' > ' + target + ' → too big, move right pointer left' }); hi--; }
    }
    steps.push({ roles: () => 'normal', labels: labs(lo, hi), note: 'pointers met — no pair sums to ' + target, tone: 'done' });
    return steps;
  },
  footer: 'Sorted order lets one comparison decide which pointer to move. O(n), not the O(n²) nested loop.',
};

export const SLIDING_WINDOW = {
  array: [2, 1, 5, 1, 3, 2],
  param: null,
  label: 'max sum of a window of size 3',
  build: (arr) => {
    const k = 3, steps = []; let sum = 0, mx = -Infinity;
    for (let i = 0; i < arr.length; i++) {
      sum += arr[i];
      if (i >= k) sum -= arr[i - k];
      if (i >= k - 1) {
        const start = i - k + 1, end = i; mx = Math.max(mx, sum);
        const note = start === 0 ? 'first window: add the ' + k + ' elements → sum ' + sum : 'slide: +' + arr[i] + ' (enters) −' + arr[i - k] + ' (leaves) → sum ' + sum;
        steps.push({ roles: idx => (idx >= start && idx <= end) ? 'active' : 'dim', note, stats: [{ label: 'window sum', value: sum, hue: 'var(--accent)' }, { label: 'best so far', value: mx, hue: 'var(--green-text)' }] });
      }
    }
    return steps;
  },
  footer: 'One add + one subtract per slide — never re-sum the window. O(n), not O(n·k).',
};

export const BINARY_SEARCH = {
  array: [1, 4, 7, 9, 12, 15, 18, 21],
  param: { kind: 'select', label: 'target', options: [1, 7, 10, 12, 15, 21], default: 15 },
  build: (arr, target) => {
    const steps = []; let lo = 0, hi = arr.length - 1;
    const labs = (l, h, m) => { const o = {}; o[l] = 'lo'; o[h] = h === l ? 'lo·hi' : 'hi'; o[m] = 'mid'; return o; };
    while (lo <= hi) {
      const mid = (lo + hi) >> 1, cl = lo, ch = hi;
      if (arr[mid] === target) { steps.push({ roles: i => i === mid ? 'found' : (i < cl || i > ch) ? 'dim' : 'normal', labels: labs(cl, ch, mid), note: 'a[mid] = ' + arr[mid] + ' == target → found at index ' + mid, tone: 'found' }); return steps; }
      const role = i => i === mid ? 'mid' : (i < cl || i > ch) ? 'dim' : 'normal';
      if (arr[mid] < target) { steps.push({ roles: role, labels: labs(cl, ch, mid), note: 'a[mid] = ' + arr[mid] + ' < ' + target + ' → discard left half, search right' }); lo = mid + 1; }
      else { steps.push({ roles: role, labels: labs(cl, ch, mid), note: 'a[mid] = ' + arr[mid] + ' > ' + target + ' → discard right half, search left' }); hi = mid - 1; }
    }
    steps.push({ roles: () => 'dim', note: target + ' is not in the array', tone: 'done' });
    return steps;
  },
  footer: 'Half the candidates gone every step: 8 → 4 → 2 → 1. That is O(log n). (Try 10 — it isn\'t there.)',
};
