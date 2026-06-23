// pyLabCompanies — a representative company tag per PyLab problem: the kind of place
// this style of question shows up. Deterministic per problem id (stable across reloads),
// drawn from a topic-appropriate pool. This is a flavour/credibility cue (like LeetCode's
// company tags), NOT a verified "asked at X" claim — curate specific ones any time.
const POOLS = {
  'pandas-groupby':  ['Airbnb', 'Meta', 'DoorDash', 'Spotify', 'Netflix', 'Uber', 'Instacart', 'Stripe'],
  'pandas-window':   ['Netflix', 'Spotify', 'Uber', 'Robinhood', 'DoorDash', 'Airbnb'],
  'pandas-merge':    ['Stripe', 'Airbnb', 'Instacart', 'Meta', 'Amazon'],
  'pandas-reshape':  ['Spotify', 'Meta', 'Airbnb', 'Netflix'],
  'numpy-vectorize': ['NVIDIA', 'OpenAI', 'Two Sigma', 'Citadel', 'Databricks', 'Anthropic'],
  'python-core':     ['Google', 'Meta', 'Amazon', 'Microsoft', 'Stripe', 'Bloomberg'],
  'idioms':          ['Google', 'Dropbox', 'Stripe', 'LinkedIn', 'Microsoft'],
  'oop':             ['Amazon', 'Microsoft', 'Bloomberg', 'Uber', 'Google'],
};
const FALLBACK = ['Google', 'Meta', 'Amazon', 'Stripe', 'Netflix'];

const HUE = {
  Stripe: '#635bff', Meta: '#0866ff', Google: '#4285f4', Amazon: '#f0922b', Netflix: '#e50914',
  Airbnb: '#ff5a5f', Uber: '#5a5a5a', DoorDash: '#ff3008', Spotify: '#1db954', Robinhood: '#00c805',
  Databricks: '#ff3621', NVIDIA: '#76b900', OpenAI: '#10a37f', Anthropic: '#cc7a5c',
  Microsoft: '#5b9bd5', Bloomberg: '#5a7fb0', Instacart: '#0aad0a', Dropbox: '#3b82f6',
  LinkedIn: '#0a66c2', 'Two Sigma': '#3f7fe0', Citadel: '#1f8a6e',
};

function hash(s) {
  let h = 2166136261 >>> 0; // FNV-1a — distributes well so similar ids don't cluster
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

export function companyFor(problem) {
  const pool = POOLS[problem.topic] || FALLBACK;
  const name = pool[hash(problem.id) % pool.length];
  return { name, hue: HUE[name] || '#7a7a7a', initial: name[0] };
}

export default companyFor;
