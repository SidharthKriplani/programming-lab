// ResourcesPage — the curated shelf (PAL/MSL/GSL parity surface). One page,
// grouped by Foundations territory; every entry carries the ONE-line reason it
// is on the shelf. Sources mirror the groundings recorded per-room in
// foundationsRooms.js / FOUNDATIONS-SPEC.md — this page is their reader-facing
// mirror, not a second opinion. External links only; PL never embeds them.
import { Icon } from '../components/shared/Icon.jsx';

const SHELF = [
  {
    id: 'python',
    label: 'Python & the machine under it',
    rooms: 'Rooms 1-2',
    items: [
      { name: 'Python Tutor', url: 'https://pythontutor.com/', why: 'Step any snippet frame by frame — the visualization style PL\'s own state traces are built on.' },
      { name: 'The official Python tutorial', url: 'https://docs.python.org/3/tutorial/', why: 'The canonical tour; read targeted sections, not linearly.' },
      { name: 'roadmap.sh / python', url: 'https://roadmap.sh/python', why: 'The map of what exists — useful for seeing where you are, not for learning from.' },
      { name: 'Fluent Python (Ramalho)', url: 'https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/', why: 'The data model, deeply — the book behind rooms 1-2 once the basics stick.' },
      { name: 'High Performance Python (Gorelick & Ozsvald)', url: 'https://www.oreilly.com/library/view/high-performance-python-3rd/9781098165956/', why: 'Measure before you optimize — The Machine room\'s house philosophy in book form.' },
    ],
  },
  {
    id: 'dsa',
    label: 'DSA & competitive programming',
    rooms: 'Rooms 3, 7',
    items: [
      { name: 'NeetCode 150', url: 'https://neetcode.io/practice', why: 'The pattern-organized problem list; PL\'s DSA room teaches the patterns, this is where you drill them at volume.' },
      { name: 'VisuAlgo', url: 'https://visualgo.net/', why: 'Animated structures and algorithms — the reference visual language for the DSA steppers.' },
      { name: 'USACO Guide', url: 'https://usaco.guide/', why: 'The structured ladder past interview-medium — the CP branch\'s spine.' },
      { name: 'Competitive Programmer\'s Handbook (Laaksonen)', url: 'https://cses.fi/book/book.pdf', why: 'Free, dense, canonical — the CP branch\'s book.' },
      { name: 'CP-Algorithms', url: 'https://cp-algorithms.com/', why: 'The encyclopedia entry for every algorithm the CP branch names.' },
    ],
  },
  {
    id: 'data',
    label: 'NumPy, pandas & tensors',
    rooms: 'Rooms 4, 9',
    items: [
      { name: 'NumPy broadcasting docs', url: 'https://numpy.org/doc/stable/user/basics.broadcasting.html', why: 'The stretch-not-copy model, from the source — room 4\'s central sim is this page, driven.' },
      { name: 'Modern Pandas (Tom Augspurger)', url: 'https://tomaugspurger.net/posts/modern-1-intro/', why: 'Idiomatic pandas from a core dev — the taste layer over the mechanics.' },
      { name: 'PyTorch autograd tutorial', url: 'https://pytorch.org/tutorials/beginner/blitz/autograd_tutorial.html', why: 'Define-by-run and what .backward() records — room 9\'s grounding.' },
    ],
  },
  {
    id: 'shipping',
    label: 'Shipping & concurrency',
    rooms: 'Rooms 5-6',
    items: [
      { name: 'Effective Python (Slatkin)', url: 'https://effectivepython.com/', why: '90 specific habits — the notebook-to-production room in item form.' },
      { name: 'Made With ML', url: 'https://madewithml.com/', why: 'The full notebook-to-production arc for ML code specifically.' },
      { name: 'asyncio docs — the high-level index', url: 'https://docs.python.org/3/library/asyncio.html', why: 'The event-loop API surface once room 5\'s model is installed.' },
    ],
  },
  {
    id: 'systems',
    label: 'The Metal, the OS & C++',
    rooms: 'Rooms 8, 10-11',
    items: [
      { name: 'CS:APP (Bryant & O\'Hallaron)', url: 'https://csapp.cs.cmu.edu/', why: 'THE substrate book — memory hierarchy, representation, optimization. Rooms 8 and 10 shadow its chapters.' },
      { name: 'OSTEP — Operating Systems: Three Easy Pieces', url: 'https://pages.cs.wisc.edu/~remzi/OSTEP/', why: 'Free, readable, canonical — The OS Floor mirrors its three pillars.' },
      { name: 'learncpp.com', url: 'https://www.learncpp.com/', why: 'The C++ mechanics reference — room 11 teaches reading; this teaches writing.' },
      { name: 'cppreference.com', url: 'https://en.cppreference.com/', why: 'The lookup surface every C++ reader lives in.' },
      { name: 'Compiler Explorer (godbolt)', url: 'https://godbolt.org/', why: 'See what the compiler did to your code — the receipt behind room 8\'s optimizer module.' },
      { name: 'What Every Programmer Should Know About Memory (Drepper)', url: 'https://people.freebsd.org/~lstewart/articles/cpumemory.pdf', why: 'The cache-hierarchy paper — selectively, once room 8 makes you want it.' },
    ],
  },
  {
    id: 'wire-storage',
    label: 'The wire & the database',
    rooms: 'Rooms 12-13',
    items: [
      { name: 'High Performance Browser Networking (Grigorik)', url: 'https://hpbn.co/', why: 'Free online — latency, TCP, HTTP; The Wire room\'s grounding text.' },
      { name: 'Latency numbers every programmer should know', url: 'https://colin-scott.github.io/personal_website/research/interactive_latency.html', why: 'The Dean/Norvig ladder, interactive and updated by year.' },
      { name: 'Use The Index, Luke', url: 'https://use-the-index-luke.com/', why: 'SQL indexing from the B-tree up — Storage Engines\' index cluster, in depth.' },
      { name: 'Database Internals (Petrov)', url: 'https://www.databass.dev/', why: 'B-trees, LSM, WAL — the mechanics book under room 13.' },
      { name: 'SQLite EXPLAIN QUERY PLAN docs', url: 'https://www.sqlite.org/eqp.html', why: 'The exact plan format room 13 reads live, since Pyodide ships sqlite3.' },
    ],
  },
];

export function ResourcesPage() {
  return (
    <div className='pal-page-enter'>
      <div style={{ marginBottom: '1.2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
          <Icon name='book-open' size={18} color='var(--accent)' />
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 800, color: 'var(--text)' }}>Resources</h1>
        </div>
        <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '62ch', lineHeight: 1.55 }}>
          The shelf behind the rooms. Short by design — every entry is the grounding source a
          Foundations room is actually built on, with the one reason it earns the slot. PL installs
          the model; these are where you go deeper.
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.4rem' }}>
        {SHELF.map(group => (
          <section key={group.id}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.6rem', marginBottom: '0.55rem' }}>
              <h2 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: 'var(--text)' }}>{group.label}</h2>
              <span style={{ fontSize: '0.62rem', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)', letterSpacing: '0.06em' }}>{group.rooms}</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '0.6rem' }}>
              {group.items.map(item => (
                <a key={item.name} href={item.url} target='_blank' rel='noopener noreferrer'
                   className='pal-card-hover'
                   style={{
                     display: 'block', textDecoration: 'none',
                     background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 10,
                     padding: '0.7rem 0.85rem',
                   }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text)' }}>{item.name}</span>
                    <Icon name='arrow-right' size={11} color='var(--text-dim)' />
                  </div>
                  <div style={{ fontSize: '0.73rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{item.why}</div>
                </a>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export default ResourcesPage;
