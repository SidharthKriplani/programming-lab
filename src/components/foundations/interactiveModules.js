// interactiveModules — maps a Foundations module id to its DRIVEN model.
// Three kinds of entry:
//   • StateTrace template (foundationsModels.js) — "binding & identity" shapes as DATA.
//   • ArrayTrace template (arrayTraceModels.js) — "array + indices + step" DSA traces as DATA.
//   • bespoke widgets — only where the picture/dynamics genuinely need custom viz.
// Backed modules (knowModules ids) render in KnowRunner's slot; interactive-only
// planned ids open a lightweight runner in FoundationsBrowser.
import { createElement } from 'react';
import { StateTrace } from './StateTrace.jsx';
import { ALIASING, COPY_DEEPCOPY, MUTABLE_DEFAULT, IS_VS_EQ } from './foundationsModels.js';
import { ArrayTrace } from './ArrayTrace.jsx';
import { TWO_POINTER, SLIDING_WINDOW, BINARY_SEARCH } from './arrayTraceModels.js';
import { CallStackModel } from './CallStackModel.jsx';
import { BigOModel } from './BigOModel.jsx';
import { HashBucketsModel } from './HashBucketsModel.jsx';
import { VectorizedRaceModel } from './VectorizedRaceModel.jsx';
import { BroadcastModel } from './BroadcastModel.jsx';
import { IndexAlignModel } from './IndexAlignModel.jsx';
import { TruthinessModel } from './TruthinessModel.jsx';
import { DecoratorModel } from './DecoratorModel.jsx';
import { GeneratorModel } from './GeneratorModel.jsx';
import { AsyncTimelineModel } from './AsyncTimelineModel.jsx';
import { UniquePathsModel } from './UniquePathsModel.jsx';
import { AutogradModel } from './AutogradModel.jsx';

const trace = (cfg) => () => createElement(StateTrace, { config: cfg });
const atrace = (cfg) => () => createElement(ArrayTrace, { config: cfg });

export const INTERACTIVE_MODULES = {
  // ── StateTrace template (binding & identity — config = data) ──
  'know-names-are-bindings': trace(ALIASING),
  'pf-copy-deepcopy': trace(COPY_DEEPCOPY),
  'know-mutable-default-args': trace(MUTABLE_DEFAULT),
  'know-is-vs-equals': trace(IS_VS_EQ),
  // ── ArrayTrace template (DSA array patterns — config = data) ──
  'dsa-two-pointer': atrace(TWO_POINTER),
  'dsa-window': atrace(SLIDING_WINDOW),
  'dsa-binary-search': atrace(BINARY_SEARCH),
  // ── Room 1 bespoke (backed → KnowRunner slot) ──
  'know-bool-len-fallback': TruthinessModel,
  'know-decorators-from-scratch': DecoratorModel,
  'know-generators-are-lazy': GeneratorModel,
  // ── bespoke (the picture/dynamics need custom viz) ──
  'mc-call-stack': CallStackModel,       // Room 2 · execution
  'mc-big-o': BigOModel,                 // Room 2 · cost-felt
  'mc-hash-buckets': HashBucketsModel,   // Room 2 · hashing
  'mc-vectorized': VectorizedRaceModel,  // Room 2 · cost-felt (live numpy)
  'np-broadcast': BroadcastModel,        // Room 4 · numpy
  'pd-align': IndexAlignModel,           // Room 4 · pandas (live)
  'sp-async': AsyncTimelineModel,        // Room 5 · concurrency
  'cp-dp-shapes': UniquePathsModel,      // Room 6 · dynamic programming
  'ta-backward': AutogradModel,          // Room 7 · autograd
};
