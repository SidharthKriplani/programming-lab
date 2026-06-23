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

export const INTERACTIVE_MODULES = {
  'know-names-are-bindings': AliasingModel, // Room 1 · values-and-names (backed → KnowRunner slot)
  'pf-copy-deepcopy': CopyVsViewModel,      // Room 1 · values-and-names (planned → widget runner)
  'mc-call-stack': CallStackModel,          // Room 2 · execution        (planned → widget runner)
  'mc-big-o': BigOModel,                    // Room 2 · cost-felt         (planned → widget runner)
  'mc-hash-buckets': HashBucketsModel,      // Room 2 · hashing-and-lookup (planned → widget runner)
  'mc-vectorized': VectorizedRaceModel,     // Room 2 · cost-felt (live numpy race)
  'np-broadcast': BroadcastModel,           // Room 4 · numpy     (broadcasting sim)
};
