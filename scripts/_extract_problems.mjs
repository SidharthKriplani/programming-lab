// Dump the PL problem banks to JSON for the Python audit (mirrors PAL's
// scripts/_extract_sql_data.mjs). Run from the repo root via the audit script.
import { gotchaProblems, CLUSTERS } from '../src/data/gotchaProblems.js';
import { pythonProblems, PY_PATTERNS } from '../src/data/pythonProblems.js';
import { pandasProblems, PD_PATTERNS } from '../src/data/pandasProblems.js';

process.stdout.write(JSON.stringify({
  gotchas: { problems: gotchaProblems, groups: Object.keys(CLUSTERS) },
  python:  { problems: pythonProblems, groups: Object.keys(PY_PATTERNS) },
  pandas:  { problems: pandasProblems, groups: Object.keys(PD_PATTERNS) },
}));
