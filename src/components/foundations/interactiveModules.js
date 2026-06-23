// interactiveModules — maps a Foundations module id to its DRIVEN model.
// Two kinds of entry:
//   • StateTrace template, config-driven (foundationsModels.js) — a NEW such model
//     is a DATA config, not a new component. This is the scalable core.
//   • bespoke widgets — only where the picture/dynamics genuinely need custom viz.
// Backed modules (knowModules ids) render the model inside KnowRunner's slot;
// interactive-only planned ids open a lightweight runner in FoundationsBrowser.
import { createElement } from 'react';
import { StateTrace } from './StateTrace.jsx';
import { ALIASING, COPY_DEEPCOPY, MUTABLE_DEFAULT, IS_VS_EQ } from './foundationsModels.js';
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

const trace = (cfg) => () => createElement(StateTrace, { config: cfg });

export const INTERACTIVE_MODULES = {
  // ── StateTrace template (config = data, not code) ──
  'know-names-are-bindings': trace(ALIASING),        // Room 1 · values-and-names (backed)
  'pf-copy-deepcopy': trace(COPY_DEEPCOPY),          // Room 1 · values-and-names (planned)
  'know-mutable-default-args': trace(MUTABLE_DEFAULT), // Room 1 · control (backed) — NEW driven model, config-only
  'know-is-vs-equals': trace(IS_VS_EQ),              // Room 1 · the-data-model (backed) — slider variant
  // ── Room 1 bespoke (backed → KnowRunner slot) ──
  'know-bool-len-fallback': TruthinessModel,         // the-data-model
  'know-decorators-from-scratch': DecoratorModel,    // decorators-and-context
  'know-generators-are-lazy': GeneratorModel,        // evaluation (lazy + one-shot)
  'sp-async': AsyncTimelineModel,                    // Room 5 · concurrency (planned → widget runner)
  // ── bespoke (the picture/dynamics need custom viz) ──
  'mc-call-stack': CallStackModel,                   // Room 2 · execution
  'mc-big-o': BigOModel,                             // Room 2 · cost-felt
  'mc-hash-buckets': HashBucketsModel,               // Room 2 · hashing-and-lookup
  'mc-vectorized': VectorizedRaceModel,              // Room 2 · cost-felt (live numpy race)
  'np-broadcast': BroadcastModel,                    // Room 4 · numpy (broadcasting)
  'pd-align': IndexAlignModel,                       // Room 4 · pandas (index alignment, live)
};
