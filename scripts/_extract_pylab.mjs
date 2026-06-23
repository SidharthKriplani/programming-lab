// _extract_pylab — dump the PyLab JS data to JSON so the Python gates can read it.
// Mirrors _extract_problems.mjs. Usage: node scripts/_extract_pylab.mjs [outPath]
import { writeFileSync } from 'fs';
import { pyLabProblems } from '../src/data/pyLabProblems.js';
import { pyLabFixtures } from '../src/data/pyLabFixtures.js';

const out = { problems: pyLabProblems, fixtures: pyLabFixtures };
const path = process.argv[2] || 'pylab_extract.json';
writeFileSync(path, JSON.stringify(out));
console.error('extracted ' + pyLabProblems.length + ' problems, ' + Object.keys(pyLabFixtures).length + ' fixtures -> ' + path);
