// scripts/validate-content-status.mjs — family recordkeeping enforcement, PL
// edition (ported from GSL/MSL/PAL). Exits 1 if any 'clean' entry in
// src/data/contentStatus.js lacks a real 3-part verifiedBy receipt.
// Run: npm run check:content-status
import { readFileSync } from 'node:fs';

const src = readFileSync(new URL('../src/data/contentStatus.js', import.meta.url), 'utf8');

// Parse entries: 'id': { ... } — tolerant text scan (the file is data-only).
const entryRe = /'([a-z0-9-]+)':\s*\{([^}]*)\}/g;
let m, total = 0, clean = 0;
const failures = [];
while ((m = entryRe.exec(src)) !== null) {
  total += 1;
  const [, id, body] = m;
  if (!/status:\s*'clean'/.test(body)) continue;
  clean += 1;
  const vb = body.match(/verifiedBy:\s*(['"`])([\s\S]*?)\1/);
  const receipt = vb ? vb[2] : '';
  const problems = [];
  if (!receipt) problems.push('no verifiedBy receipt at all');
  else {
    if (!/20\d\d-\d\d-\d\d/.test(receipt)) problems.push('receipt has no timestamp (YYYY-MM-DD)');
    if (!/(grep|node |npm |python|rg |scripts\/|\.mjs|\.py|:\d+)/.test(receipt)) problems.push('receipt has no re-runnable command/grep/file:line');
    if (receipt.trim().length < 40) problems.push('receipt too short to state what was specifically confirmed');
  }
  if (problems.length) failures.push(`${id}: ${problems.join('; ')}`);
}

console.log(`contentStatus: ${total} tracked, ${clean} clean`);
if (failures.length) {
  console.error(`\nFAIL — ${failures.length} 'clean' entr${failures.length === 1 ? 'y' : 'ies'} without a real receipt:`);
  for (const f of failures) console.error('  - ' + f);
  process.exit(1);
}
console.log('OK — every clean entry carries a real receipt.');
