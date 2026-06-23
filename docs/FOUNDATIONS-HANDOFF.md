# FOUNDATIONS HANDOFF — how PAL teaches (the KNOW frame), and why PL needs an interactive lab

_Authored 2026-06-23 by the PAL session, as a mentor note to the Programming Lab (PL) build. The first handoff (`SQL-LAB-HANDOFF.md`) covered the **DO frame** — fluency banks where you write code and get graded. This one covers the **KNOW frame** — the Foundation rooms, where PAL **teaches a concept interactively** before you ever practice it. PL's current build (Python Gotchas, Drills, Idioms, OOP, pandas/numpy) is all DO. **You're missing KNOW, and KNOW is where the best programming teaching actually lives. This doc is a push to build it.**_

---

## 0. The thesis (read this first)

A grader tells a learner they're wrong. It does not tell them **why their mental model is broken.** That's what the Foundation rooms do: they take the one concept underneath a whole class of mistakes and let you *play with a live model of it* until the intuition clicks. You don't read about a z-score — you drag a slider and watch the tail area shrink. You don't read about the central limit theorem — you draw samples and watch the sampling distribution go normal.

**For programming this is even more true than for statistics.** The hardest beginner confusions in Python — references vs values, mutability/aliasing, the call stack, how a dict hashes, why a list comprehension beats a loop, async/the event loop, copy-vs-view in pandas — are *impossible to read your way into and trivial to see.* You cannot explain aliasing in prose as well as one animation of two variables changing at once. So: **programming is the best possible fit for an interactive foundations lab, and PL doesn't have one yet. Build it.**

---

## 1. What the Foundation rooms are

PAL has **four Foundation rooms**, all in the KNOW frame, ~120 modules total:

| Room | Modules | Teaches |
|---|---|---|
| Stat Foundations | 32 | data types → central tendency → spread → normal/z → CLT → CI → hypothesis testing → power → causal (DiD/RD/IV) → bias |
| Metrics Foundations | 13 | what a metric is → rates/ratios → guardrails → north-star → instrumentation |
| RCA Foundations | 12 | the 4-layer diagnosis framework for "the metric dropped" |
| A/B (Experimentation) Foundations | 15 | hypothesis → design → run → read → pitfalls |

They are **sequential, short (4–6 min each), and free/cheap** — they're the on-ramp. A user with no stats background can start at "what is data?" and arrive at "design an experiment" without ever hitting a wall. This is the **"beginner access layer."** It's why PAL doesn't lose the career-switcher on day one.

---

## 2. How a module works (the anatomy)

A module is **two things**: a data record + an interactive component.

**(a) The data record** (in `src/data/statsFoundationsModules.js` etc.):
```js
{
  id: 'sf05', index: 5, title: 'Z-Scores',
  subtitle: 'How unusual is this value?',
  difficulty: 'Beginner', tags: [...], estimatedMin: 6, isFree: true,
  keyInsight: '...a concrete work moment, then the concept...',
  connection: '...how this shows up in the real analyst job...',
  playbookLinks: [{ id, label }],   // jump to deeper articles
}
```

The `keyInsight` is the most important field in the whole system. **Every one opens with a real work situation, never with theory:**
> *"You're in a review and someone asks why you used a z-test on session-length data that's clearly not bell-shaped. The answer requires understanding what the normal distribution actually is…"*

Not "The normal distribution is a continuous probability distribution…". The concept is **earned by a moment of need.** Copy this religiously.

**(b) The interactive component** (in `src/components/statsFoundations/modules/Module05_ZScores.jsx`): a real, manipulable model. The z-scores module renders a normal curve in SVG, gives the learner **sliders** for the population mean, SD, and a value, and live-computes the z-score, the shaded tail area, the percent above/below, and a plain-English read of where the value sits. The learner *drives* it. That's the lesson — not the prose around it.

**The flow inside a module** (built from shared primitives, §4): `HowTo` (the skill + ≤3 steps) → `InsightBox` (the key insight) → `InstructionBox` ("now drag the value up…") → **the interactive widget** (manipulate + see) → `MCQOption`s + `CheckBtn` (a quick comprehension check with reveal/correct/wrong states) → `NextBtn` (advance). Tight, single-idea, ends with momentum.

---

## 3. The pedagogical bar (the non-negotiables)

1. **Anchor every concept in a work moment first.** The `keyInsight` is a scene from the job, then the idea. If a module opens with a definition, it's wrong.
2. **Teach by manipulation, not exposition.** The center of every module is a live model the learner drives — a slider, a draggable value, a step-through. If the learner only reads and clicks "next," you've built a slideshow, not a foundation.
3. **Connect to the real loop.** Every module says *where this shows up in the actual job* (`connection`). Concepts in a vacuum don't stick.
4. **One idea, 4–6 minutes, end with momentum.** Short and sequential beats comprehensive. The `NextBtn` pulls them forward.
5. **Check understanding lightly.** A 1–2 question MCQ with reveal — not a graded test. The point is the "aha," not the score.

---

## 4. The architecture (a shared scaffold, thin per-room config)

All four rooms run on **one shared system** — copy this structure exactly:

- **`FoundationBrowser.jsx`** — a single config-driven grid browser. Each room is a thin wrapper passing its color + modules array. One component, four rooms.
- **`FoundationRunnerShell.jsx`** — the module-runner chrome: back button, progress counter, the current module header, a content slot, and a right-side module index for jumping around.
- **`FoundationPrimitives.jsx`** — the shared, **color-parameterized** building blocks every module imports: `InsightBox` (the key-insight callout), `InstructionBox` (do-this-now), `MCQOption` (interactive choice with selected/correct/wrong/reveal states), `CheckBtn`, `NextBtn`. Each room passes its own accent color, so the same primitives wear Stats-teal, Metrics-green, RCA-teal, A/B-blue.
- **`HowTo.jsx`** — the "skill + ≤3 steps" opener that sets the cognitive frame before the first interaction.
- **The interactive widgets are bespoke per module** (custom SVG + React state), but they all sit in the same shell and reuse the same primitives. That's the trick: **a rigid frame + free interior.** The frame makes 120 modules feel like one product; the free interior lets each concept get the exact visualization it needs.

So: 90% of a new module is config + primitives; the 10% that's bespoke is the visualization that makes that one concept click.

---

## 5. The mentoring push — PL needs a KNOW frame, and here's why it'll be your best work

You've built (or are building) the DO frame: gotchas, drills, idioms, OOP, pandas. Good — that's fluency. But fluency banks assume the learner already has the **mental model.** Most don't. The person who fails the "mutate a list inside a function" drill doesn't need another drill — they need to *see* that the list inside and outside the function are the same object. That's a KNOW-frame job, and you don't have one.

Here's the argument I want you to sit with: **the things that make programming hard to learn are exactly the things that are easy to show and impossible to tell.** A foundation room is the single highest-leverage teaching surface you can build, and Python hands you a perfect syllabus of "must-see" concepts. Don't ship a SWE problem-grinder with no on-ramp. Build "Python Foundations" (and "CS Foundations") in KNOW, on the same scaffold as PAL's, and you'll have the thing no LeetCode clone has: a place where the model gets installed before the reps begin.

---

## 6. Concrete interactive modules to build (the starter syllabus)

These are chosen by one rule: **biggest beginner confusion × biggest payoff from seeing it.** Each is a live, manipulable model, not a page.

- **References vs values / aliasing** — two variables pointing at one list; mutate through one, watch the *other* change. The single most important animation in all of Python. Pair it with the function-argument case (you pass a list, you mutate it, the caller's list changed).
- **Mutable default argument** — call a function three times, watch the "fresh" default accumulate. The classic footgun, made visual.
- **Copy vs view / SettingWithCopy (pandas)** — a memory diagram: slice a DataFrame, assign into the slice, watch the assignment hit a copy and silently vanish. Bridges straight into your pandas DO bank.
- **The call stack & recursion** — step a recursive `factorial`/`fib` and watch frames push and pop; show where the base case stops it and where infinite recursion blows the stack.
- **How a dict works** — drop keys into hash buckets; show a collision; show why lookup is O(1) and why dict ordering is insertion order now.
- **Big-O, felt** — a slider for `n`; watch operation counts for O(1)/O(n)/O(n log n)/O(n²) diverge. Then "vectorized vs Python loop" as the pandas/numpy version of the same lesson.
- **`is` vs `==` & interning** — compare small ints and short strings vs large ones; watch identity flip while equality holds.
- **Index alignment (pandas)** — add two Series with different indexes; watch pandas align by label and produce NaN where they don't match. The thing that silently wrecks beginner pandas.
- **Generators / lazy evaluation** — step a generator; show nothing computes until you ask; contrast memory with the list version.
- **The event loop / async** — a timeline where `await` yields control; watch tasks interleave. (Stretch, but a killer once the basics land.)

Each follows the PAL anatomy: a `keyInsight` that opens with a real bug or review moment ("your test passed locally but mutated a shared list in prod…"), then the live model, then a one-question check, then next.

---

## 7. Architecture mapping (Stat Foundations → Python Foundations)

| PAL (Stat Foundations) | PL (Python/CS Foundations) |
|---|---|
| `FoundationBrowser` (config-driven grid, 4 rooms) | one browser, config per room (Python / CS / pandas foundations) |
| `FoundationRunnerShell` (chrome + module index) | identical |
| `FoundationPrimitives` (InsightBox/InstructionBox/MCQOption/CheckBtn/NextBtn) | identical — build once, color per room |
| `HowTo` (skill + ≤3 steps) | identical |
| module **data**: `{id,index,title,subtitle,difficulty,tags,estimatedMin,isFree,keyInsight,connection,playbookLinks}` | identical shape; `connection` = "where this shows up when you're shipping code" |
| module **component**: bespoke SVG visualization + state (the z-curve) | bespoke visualization per concept (the aliasing animation, the call-stack stepper, the hash-bucket grid) |
| `keyInsight` opens with an analyst moment | opens with a **coding/review/prod moment** |
| color-parameterized per room (teal/green/blue) | per room in PL's accent (violet) |

The substrate difference is small: PAL's widgets are pure React + SVG (no runtime). Yours can be the same for most concepts — and where a concept benefits from *running real code* (generators, async, mutation), you already have **Pyodide**, so you can let the learner edit and run the snippet live and watch the model update. That's a capability PAL doesn't even have. Use it.

---

## 8. The bar, restated

- **Build the KNOW frame.** A SWE lab with no interactive on-ramp loses the exact learners who need it most.
- **Teach by manipulation.** If a module is read-and-click-next, it's a slideshow — rebuild it around a model the learner drives.
- **Anchor in a real coding moment** before any definition. Always.
- **One scaffold, thin config, free interior** — `Browser` + `Shell` + `Primitives` shared; the visualization is the only bespoke part.
- **Run real code where it helps** — Pyodide is your edge over PAL here; use it to make the model *executable*, not just illustrated.
- **Short, sequential, momentum-forward.** 4–6 min, one idea, `NextBtn`.

Build this and PL stops being "LeetCode in violet" and becomes the place where a data person actually *learns how the machine thinks* — then proves it in your DO banks. That's the whole BreakLabs thesis: KNOW earns the right to DO, DO earns BUILD, and judgment is the apex. You can't skip KNOW.

---

_Reference implementations to read directly in `product-analytics-lab`: `src/data/statsFoundationsModules.js` (module data + the `keyInsight` voice), `src/components/statsFoundations/modules/Module05_ZScores.jsx` (a real interactive module — the slider-driven normal curve), `Module09_CLT.jsx` / `Module13_ExperimentDesigner.jsx` (richer simulators), `src/components/shared/FoundationPrimitives.jsx` + `FoundationRunnerShell.jsx` + `FoundationBrowser.jsx` (the shared scaffold), `HowTo.jsx`. Questions back to PAL via `HQ/LEDGER.md`._
