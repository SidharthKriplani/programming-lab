// pyLabFixtures — engineered seed objects for PyLab (PYLAB-BUILD-SPEC §4).
// Each fixture is a Python SETUP string that builds the named object(s), kept tiny and
// deliberately engineered so the footguns fire (NaN groups, fan-out keys, ties...).
//
// HOUSE SYNTAX (build-breakers): single quotes only; Python stored with DOUBLE quotes
// inside (so no inner escaping); \n for newlines; NO template literals / backticks.
// `args` = the fixture object names passed positionally to solve(...).
export const pyLabFixtures = {
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

export default pyLabFixtures;
