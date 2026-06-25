/**
 * glassbox.js — timing/memory helpers built on the Pyodide runtime.
 *
 * raceMethods(codeA, codeB): runs two Python snippets through the glass-box
 * harness and returns the timing + memory profile for each, so a future DSA
 * runner can render a canonical-vs-brute race bar. For Bank A (gotchas) the race
 * is usually unused — the per-cell footer (timeMs / peakKb) is the main surface.
 *
 * Returns: {
 *   a: { timeMs, peakKb, stdout, error },
 *   b: { timeMs, peakKb, stdout, error },
 *   ratio: number|null   // b.timeMs / a.timeMs when both > 0, else null
 * }
 */
import { loadPython, runPythonGlassBox } from './pyodideRuntime.js';

export async function raceMethods(codeA, codeB, onProgress) {
  await loadPython(onProgress);

  const a = await runPythonGlassBox(codeA);
  const b = await runPythonGlassBox(codeB);

  const ratio = a.timeMs > 0 && b.timeMs > 0 ? b.timeMs / a.timeMs : null;

  return {
    a: { timeMs: a.timeMs, peakKb: a.peakKb, stdout: a.stdout, error: a.error },
    b: { timeMs: b.timeMs, peakKb: b.peakKb, stdout: b.stdout, error: b.error },
    ratio,
  };
}

/**
 * formatGlassBox({ timeMs, peakKb }) -> "⏱ 0.4 ms · 🧠 12 KB peak"
 * Shared formatter so the cell footer and any race bar read identically.
 */
export function formatGlassBox({ timeMs, peakKb }) {
  const t = typeof timeMs === 'number' ? timeMs : 0;
  const m = typeof peakKb === 'number' ? peakKb : 0;
  const tStr = t < 1 ? t.toFixed(3) : t < 10 ? t.toFixed(2) : t.toFixed(1);
  const mStr = m < 1024 ? `${m.toFixed(m < 10 ? 1 : 0)} KB` : `${(m / 1024).toFixed(2)} MB`;
  return `time: ${tStr} ms · mem: ${mStr} peak`;
}

/**
 * glassBoxParts({ timeMs, peakKb }) -> { time: '0.42', mem: '1.2 MB' }
 * Structured values for the CRT HUD readout (emoji-free, labeled cells).
 */
export function glassBoxParts({ timeMs, peakKb }) {
  const t = typeof timeMs === 'number' ? timeMs : 0;
  const m = typeof peakKb === 'number' ? peakKb : 0;
  const time = t < 1 ? t.toFixed(3) : t < 10 ? t.toFixed(2) : t.toFixed(1);
  const mem = m < 1024 ? `${m.toFixed(m < 10 ? 1 : 0)} KB` : `${(m / 1024).toFixed(2)} MB`;
  return { time, mem };
}
