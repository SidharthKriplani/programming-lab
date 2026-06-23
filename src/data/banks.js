// banks — the single registry of every content bank in PL (frame, view, total,
// progress key, accent). Used by the Progress dashboard. Mirrors the nav.
import { gotchaProblems } from './gotchaProblems.js';
import { pyLabProblems } from './pyLabProblems.js';
import { knowModules } from './knowModules.js';
import { judgeProblems } from './judgeProblems.js';
import { buildProjects } from './buildProjects.js';
import { BUILD_KEY } from '../utils/problemProgress.js';

export const FRAMES = {
  KNOW:  { label: 'Know',  sub: 'Understand the why', icon: 'book-open' },
  DO:    { label: 'Do',    sub: 'Code it, fast & correct', icon: 'terminal' },
  BUILD: { label: 'Build', sub: 'Own something real', icon: 'hammer' },
  JUDGE: { label: 'Judge', sub: 'Choose & defend', icon: 'scale' },
};
export const FRAME_ORDER = ['KNOW', 'DO', 'BUILD', 'JUDGE'];

export const BANKS = [
  { id: 'know',    label: 'Python & OOP Depth', frame: 'KNOW',  view: 'know',    accent: 'var(--accent)', total: knowModules.length,   progressKey: 'pl-know-progress-v1' },
  { id: 'pylab',   label: 'PyLab',              frame: 'DO',    view: 'pylab',   accent: 'var(--accent)', total: pyLabProblems.length,  progressKey: 'pl-pylab-progress-v1' },
  { id: 'gotchas', label: 'Python Gotchas',     frame: 'DO',    view: 'gotchas', accent: 'var(--yellow)', total: gotchaProblems.length, progressKey: 'pl-gotcha-progress-v1' },
  { id: 'build',   label: 'Mini-Projects',      frame: 'BUILD', view: 'build',   accent: 'var(--green)',  total: buildProjects.length,  progressKey: BUILD_KEY },
  { id: 'judge',   label: 'Spot the Flaw',      frame: 'JUDGE', view: 'judge',   accent: 'var(--red)',    total: judgeProblems.length,  progressKey: 'pl-judge-progress-v1' },
];
