// interactiveModules — maps a Foundations module id to its DRIVEN model (the F1
// widget slot). A module with an entry here renders a manipulable model; backed
// modules (knowModules) render it inside KnowRunner's slot, interactive-only
// planned modules open a lightweight runner in FoundationsBrowser. Add an entry
// as each room's driven models are authored (build order F1+).
import { AliasingModel } from './AliasingModel.jsx';
import { CopyVsViewModel } from './CopyVsViewModel.jsx';
import { CallStackModel } from './CallStackModel.jsx';
import { BigOModel } from './BigOModel.jsx';
import { HashBucketsModel } from './HashBucketsModel.jsx';
import { VectorizedRaceModel } from './VectorizedRaceModel.jsx';
import { BroadcastModel } from './BroadcastModel.jsx';
import { IndexAlignModel } from './IndexAlignModel.jsx';
import { TruthinessModel } from './TruthinessModel.jsx';
import { DecoratorModel } from './DecoratorModel.jsx';

export const INTERACTIVE_MODULES = {
  'know-names-are-bindings': AliasingModel, // Room 1 · values-and-names (backed → KnowRunner slot)
  'pf-copy-deepcopy': CopyVsViewModel,      // Room 1 · values-and-names (planned → widget runner)
  'know-bool-len-fallback': TruthinessModel, // Room 1 · the-data-model  (backed → KnowRunner slot)
  'know-decorators-from-scratch': DecoratorModel, // Room 1 · decorators  (backed → KnowRunner slot)
  'mc-call-stack': CallStackModel,          // Room 2 · execution        (planned → widget runner)
  'mc-big-o': BigOModel,                    // Room 2 · cost-felt         (planned → widget runner)
  'mc-hash-buckets': HashBucketsModel,      // Room 2 · hashing-and-lookup (planned → widget runner)
  'mc-vectorized': VectorizedRaceModel,     // Room 2 · cost-felt (live numpy race)
  'np-broadcast': BroadcastModel,           // Room 4 · numpy     (broadcasting sim)
  'pd-align': IndexAlignModel,              // Room 4 · pandas    (index alignment, live)
};
