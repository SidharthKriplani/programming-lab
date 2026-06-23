// pyLabFixtures — engineered seed objects for PyLab (PYLAB-BUILD-SPEC §4).
// Each fixture is a Python SETUP string that builds the named object(s), kept tiny and
// deliberately engineered so the footguns fire (NaN groups, fan-out keys, ties...).
//
// HOUSE SYNTAX (build-breakers): single quotes only; Python stored with DOUBLE quotes
// inside (so no inner escaping); \n for newlines; NO template literals / backticks.
// `args` = the fixture object names passed positionally to solve(...).
import { fixtures as _fGroupby } from './pyLabBatch_groupby.js';
import { fixtures as _fMergeReshape } from './pyLabBatch_mergereshape.js';
import { fixtures as _fWindowMissing } from './pyLabBatch_windowmissing.js';
import { fixtures as _fMisc } from './pyLabBatch_misc.js';
import { fixtures as _fOop } from './pyLabBatch_oop.js';
import { fixtures as _fDrills1 } from './pyLabBatch_drills1.js';
import { fixtures as _fIdioms } from './pyLabBatch_idioms.js';
import { fixtures as _fDrills3 } from './pyLabBatch_drills3.js';
import { fixtures as _fDrills2 } from './pyLabBatch_drills2.js';

const _seedFixtures = {
  'fx_sales': {
    args: ['sales'],
    setup: 'import pandas as pd\nsales = pd.DataFrame({"region": ["West", "West", "East", "East"], "rep": ["ana", "bo", "cara", "dan"], "amount": [100, 300, 150, 50]})',
    preview: 'sales: region, rep, amount  (West totals 400 - ana 100, bo 300; East totals 200 - cara 150, dan 50)',
  },
  'fx_sales_nan': {
    args: ['sales'],
    setup: 'import pandas as pd\nsales = pd.DataFrame({"region": ["West", "West", "East", None], "rep": ["ana", "bo", "cara", "dan"], "amount": [100, 300, 150, 50]})',
    preview: 'sales with one row whose region is unknown (None) - the groupby footgun fixture',
  },
  'fx_pairs': {
    args: ['pairs'],
    setup: 'pairs = [("A", "ann"), ("B", "bob"), ("A", "amy")]',
    preview: 'a list of (team, name) pairs; team A appears twice (ann, then amy)',
  },
};

// Merge the seed fixtures + every migrated batch (pandas, then python/idioms/oop later).
export const pyLabFixtures = { ..._seedFixtures, ..._fGroupby, ..._fMergeReshape, ..._fWindowMissing, ..._fMisc, ..._fOop, ..._fDrills1, ..._fDrills3, ..._fDrills2, ..._fIdioms };

export default pyLabFixtures;
