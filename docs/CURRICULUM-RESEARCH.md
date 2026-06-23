# PL CURRICULUM RESEARCH — what a "SWE-for-data-people" fluency lab should teach

_Created 2026-06-23. Public-source research grounding PL's content map in the real GitHub / PyPI / roadmap ecosystem and the canonical books' **pedagogy** (approach only — no copied content). Companion to `PL-BUILD-SPEC.md` (the schema + four banks) and `CONTENT-STANDARD.md` (the bar). This doc answers "WHAT to cover and in what FORMAT," grounded in cited sources; the spec answers "how a problem is shaped."_

> **Scope reminder (D-07 / D-15).** PL = the SWE *fluency floor* for data people: Python / DSA / pandas / OOP that analytics & ML work assumes. Easy->medium ceiling. Runs real Python in Pyodide. Four frames: **KNOW** (depth explainers) - **DO** (drill banks) - **BUILD** (scaffolded mini-projects) - **JUDGE** ("code that runs and lies" forensics). The interview/roadmap/book canon is a **taxonomy of what to cover** — never a source of problem text. No ML model-training internals, no heavy systems.

> **What this research changes vs. the current spec.** The spec's four banks (gotchas - idioms - DSA - pandas/numpy) are confirmed correct and well-scoped by every source. The genuinely **new** territory the research surfaces is the **SWE->AI-Engineering bridge** — APIs/async, typing + pydantic, testing/guardrails, serialization, packaging/reproducibility — the skills that separate a "notebook analyst" from someone who ships. These are PL's biggest untapped expansion, and most have a clean Pyodide-runnable subset. Section D maps them into the four frames.

---

## A. The concept map — recurring clusters across all sources

Ranked by how many independent sources treat the cluster as a top-level grouping (roadmap.sh python/backend/ai-engineer/data-analyst, awesome-python, build-your-own-x, practical-python, coding-interview-university, NeetCode, TheAlgorithms, project-based-learning). Each line: the cluster + why a data/AI person needs it.

| Cluster | Source coverage | Why data/AI people need it |
|---|---|---|
| **Data structures** (arrays, dicts/hashmaps, sets, stacks, queues, heaps, trees) | 8 sources | The vocabulary of every pandas op and every coding screen; "dict for O(1) lookup" is the most-reused fix. |
| **Algorithms & patterns** (sorting, search, recursion, sliding-window, two-pointer, prefix-sum, BFS/DFS) | 8 sources | The transferable problem-shapes a DA/MLE coding screen tests; pattern > data-structure as the unit. |
| **Functions / modules / program organization** (scope, decorators, generators, args) | 4 sources | The single habit underneath testing, reuse, typing, and "graduate code out of the notebook." |
| **OOP** (classes, inheritance, encapsulation, the data model) | 4 sources | You read OOP daily (sklearn estimators, pydantic models, ORMs) even if you rarely write it. |
| **Testing** (pytest/unittest, fixtures, assertions, debugging, logging) | 5 sources | The line between "ran once in a notebook" and "trustable in a pipeline." |
| **APIs** (REST, JSON, consuming + designing endpoints) | 5 sources | AI engineering *is* mostly calling model APIs; analytics increasingly pulls from REST sources. |
| **pandas / EDA / vectorization / viz** | 5 sources | PL's core audience lives here; vectorization is the central "feel the machine" lesson. |
| **Concurrency & async** (asyncio, threading, the GIL) | 4 sources | Batched/parallel LLM calls, streaming, and I/O-bound pulls all need async. |
| **Environments & packaging** (venv, pip, poetry, uv, PyPI, lockfiles) | 4 sources | Reproducibility's mechanical half; "works on my machine" is a defect, not an excuse. |
| **Databases / SQL** (relational, ORMs, sqlite) | 4 sources | The substrate under RAG metadata, feature stores, and "talk to your data." (SQL itself is PAL's bank; PL teaches the Python<->SQL seam.) |
| **Version control (Git)** | 4 sources | Table-stakes; versioning prompts/configs/data like code. |
| **Static typing / code quality** (type hints, mypy, black/ruff, pydantic) | 3 sources | Turns silent failures into caught errors; self-documenting interfaces for data functions. |
| **Statistics / math foundations** | 3 sources | Adjacent — owned by PAL/MSL, not PL. Noted for boundary clarity. |
| **System-design-lite / architecture** | 3 sources | The "how do the pieces fit" reasoning for a small pipeline or service. |

**Three takeaways for PL:**
1. **DSA + the Python language core are the universal spine.** Every fundamentals source (NeetCode 18 patterns, CIU, TheAlgorithms, practical-python's 9-module progression) treats `syntax -> data types -> functions -> OOP -> modules -> testing` as the path. PL's gotcha/idiom/DSA banks already cover this; practical-python is the cleanest progression template.
2. **The "fluency beyond syntax" trio is testing, packaging/envs, and concurrency/async** — these appear in the language path AND the backend path AND awesome-python. They're the difference between knowing Python and shipping Python, and PL currently covers none of them.
3. **The application split is web / data / AI**, and the AI path (roadmap.sh/ai-engineer) is dominated by *classic SWE skills applied to a stochastic core* — APIs, serialization, control flow, testing — not novel ML theory. That's exactly PL's lane.

---

## B. The SWE->AIE bridge list — crossover skills + Pyodide status

Which SWE fundamentals "travel over" into AI engineering / production data work, each rated for whether the **core teaching point is demonstrable in Pyodide** (pure-Python, no raw sockets, no server binding, no threading/multiprocessing/subprocess, no Docker). Sourced from roadmap.sh/ai-engineer, Chip Huyen (AI Engineering framing), Goku Mohandas (Made With ML), Eugene Yan, and the official Pyodide constraints docs.

| Crossover skill | Why AI/data people need it | Canonical Python tool | Pyodide-runnable? |
|---|---|---|---|
| **Type hints + validation** | Foundation-model I/O is unstructured; typed schemas catch silent failures and enable structured output. | `typing`, `pydantic`, `dataclasses` | **Yes** — pure-Python; full validation in-browser. |
| **Async concurrency** | Batched/parallel LLM calls, agents, streaming all depend on async. | `asyncio` | **Yes** — runs on the browser event loop; `await`/tasks/`gather` work. (Threading/multiprocessing do **not** — parallelism is conceptual.) |
| **Serialization** | Prompts, responses, embeddings, configs all move as JSON; pickle for object caching. | `json`, `pickle` (stdlib) | **Yes** — fully functional. |
| **Caching** | Caching identical completions/embeddings cuts cost + latency. | `functools.lru_cache`, dict cache | **Yes** — stdlib, fully demonstrable. |
| **Error handling + retries** | Model APIs are flaky (429/5xx/timeout); production needs backoff + graceful degradation. | `try/except`, `tenacity` | **Yes (logic)** — retry/backoff logic runs; the *failing call* it wraps is simulated. |
| **Rate limiting** | Token/request-per-minute caps force throttling or you get 429'd. | `asyncio.Semaphore`, token-bucket | **Yes** — pure logic against simulated calls. |
| **Logging / observability** | Non-deterministic systems fail silently; structured logs are how you debug cost/latency. | `logging` (stdlib) | **Yes** — records/levels/formatters run; output to console, not a real sink. |
| **SQL / ORM seam** | RAG metadata, feature/eval stores sit on SQL; ORMs map rows to typed objects. | `sqlite3` (stdlib), `sqlalchemy` | **Yes** — sqlite3 + SQLAlchemy-on-SQLite run end-to-end. (External Postgres/MySQL won't connect.) |
| **Clean code / design patterns** | ML/AI code rots fast; factory/decorator/strategy keep pipelines maintainable. | language features | **Yes** — decorators, factories, ABCs, mixins, composition all run. |
| **REST / HTTP** | AI engineering is mostly calling model APIs; understand verbs, status, headers, JSON. | `requests`, `httpx` | **Partial** — libs import but route through browser `fetch` (CORS-bound, no raw sockets). Teach request/response anatomy; live calls simulated. |
| **Auth / secrets** | Every model API needs keys/tokens handled safely, never hard-coded. | `os.environ`, `python-dotenv` | **Partial** — header/env construction runs; real OAuth round-trips conceptual. |
| **Testing** | Prompts/agents must be tested vs `(input, expected)` to survive model upgrades. | `pytest`, `unittest` | **Partial** — `unittest` runs natively; pytest *concept* (assert/fixtures/parametrize) demonstrable; the pytest CLI runner is awkward in-browser. |
| **CLI / scripting** | Refactoring notebook code into parameterized scripts is the notebook->prod step. | `argparse` (stdlib), `click`, `typer` | **Partial** — parser logic runs (call with an arg-list); no real shell/`argv`. |
| **System-design-lite** | AI apps are pipelines: context -> guardrails -> router -> cache -> orchestration -> monitoring. | design discipline | **Partial** — individual components codeable; end-to-end deployment conceptual. |
| **Packaging / environments** | Pinned deps + lockfiles + venvs are what make results reproducible. | `venv`, `pip`, `poetry`, `uv` | **Conceptual-only** — manage real OS envs; `micropip` is the in-browser analog for pure-Python wheels only. |
| **Version control (Git)** | Prompts/configs/datasets need diffable, revertible history. | `git` | **Conceptual-only** — CLI/filesystem tool; teach the diff/branch/PR mental model. |
| **Containers (Docker)** | Models ship as images; reproducible runtime is the deploy unit. | Docker | **Conceptual-only** — no container runtime in-browser; Dockerfile/layer mental model only. |
| **Deployment / serving** | A prototype isn't a product; expose behind HTTP with health checks + rollback. | `FastAPI`, `uvicorn` | **Conceptual-only for serving** — can't bind a port; but you *can* define + unit-test routes/DI/models with `TestClient`. |
| **CI/CD** | Continuous test/deploy pipelines ship model/prompt changes safely. | GitHub Actions | **Conceptual-only** — runs on external infra; teach the pipeline-gate mental model. |

**Practitioner synthesis (approach, not quoted).** The consistent thread across Huyen, Mohandas, and Yan: **the hard part of AI is the engineering rigor around a non-deterministic core, not the model call.** Huyen's durable framing is "fundamentals over tools" — eval pipelines built from `(input, expected)` pairs, prompt versioning treated like code, explicit cost/latency analysis, retry/cache/route for unreliable APIs, and a layered production architecture (context -> guardrails -> gateway -> cache -> orchestration -> monitoring). Mohandas's Made With ML operationalizes the same belief into a curriculum that is essentially a SWE-fundamentals checklist applied to ML: refactor notebooks into clean scripts/CLIs, add logging, testing (code/data/model), versioning/reproducibility, serving, CI/CD. Yan adds the maintainability layer (design patterns + pipeline testing). **The net signal for PL:** the load-bearing crossover skills are typing+validation, async, testing, error-handling/retries, caching, logging, serialization, and the SQL seam — and the first nine of those are fully Pyodide-runnable.

---

## C. PyPI must-know stack — library - one concept - in-scope?

Pyodide reference: most heavy hitters ship pre-built (pandas, numpy, polars, pydantic, sqlalchemy, pytest, fastapi, httpx, matplotlib, click, tqdm). Only four targets need a `micropip.install()` (pure-Python): **python-dotenv, tenacity, pandera, great-expectations**.

| Library | One concept it teaches | In-scope for PL? |
|---|---|---|
| **pandas** | Vectorized tabular ops on labeled DataFrames | **Runnable** — ships in Pyodide; PL's core bank. |
| **numpy** | N-dim arrays / vectorization over loops | **Runnable** — ships; foundational. |
| **polars** | Lazy, expression-based DataFrames | **Runnable** — ships; eager + lazy both run. (Differentiator vs pandas-only labs.) |
| **pydantic** | Runtime data validation from typed models | **Runnable** — ships (incl. compiled core); validation/coercion exercisable. |
| **dataclasses + typing** (stdlib) | Structured records + type hints | **Runnable** — ideal in-browser teaching surface. |
| **sqlalchemy** + `sqlite3` (stdlib) | ORM / query building over a relational engine | **Runnable** — Core + ORM against SQLite run end-to-end. |
| **pytest** | Testing: fixtures, assertions, parametrization | **Runnable** — collection/fixtures/assert-rewrite work in-browser. |
| **functools / itertools** (stdlib) | Idioms: `lru_cache`, generators, lazy iteration | **Runnable** — strong in-browser surface. |
| **json / pickle** (stdlib) | Serialization (text vs binary object graphs) | **Runnable** — fully functional. |
| **logging** (stdlib) | Observability via records/handlers/levels | **Runnable** — output to console; handlers/formatters run. |
| **matplotlib** | Plotting / visual data inspection | **Runnable** — ships; renders to a canvas. |
| **requests / httpx** | HTTP clients; sync vs async I/O | **Partial** — ship, but route through browser fetch (CORS, no raw sockets). Teach API shape; expect CORS on arbitrary hosts. |
| **asyncio** (stdlib) | Concurrency for I/O-bound work | **Partial** — runs on `webloop`; `async/await`/tasks/`pyfetch` work; no thread-backed parallelism. |
| **tqdm** | Progress bars by wrapping any iterator | **Partial** — concept runs; live-redraw cosmetics vary by console widget. |
| **click / argparse** (argparse stdlib) | Building CLIs | **Partial** — parser logic runs; no real shell/argv/binary. |
| **fastapi** | REST API design + dependency injection | **Partial** — define routers/models/DI and test via `TestClient`; **no live server bind**. |
| **python-dotenv** | Config/secrets via env vars | **Partial** — `micropip` install; parsing runs; real OS-secrets lesson conceptual. |
| **tenacity** | Retries / backoff for flaky ops | **Partial** — `micropip` install; retry decorators + wait/stop strategies run. (`retrying` is pre-built if a zero-install demo is wanted.) |
| **pandera** | Declarative DataFrame schema validation | **Partial** — `micropip` install; runs against in-browser pandas. Lightweight; usable. |
| **great-expectations** | Expectation-suite data validation | **Conceptual-only** — heavy, many optional backends; teach the concept. |

**In-scope verdict.** The clean fully-runnable core for PL's browser lab: **numpy, pandas, polars, pydantic, sqlalchemy+sqlite3, pytest, matplotlib, and all stdlib (dataclasses/typing, functools/itertools, json/pickle, logging).** Build the new banks on this spine. The **partial** set (httpx/asyncio, click/argparse, fastapi-TestClient, dotenv, tenacity, pandera) is teachable in-browser *if the constraint is framed as part of the lesson* — and "you can't open a raw socket in this sandbox, here's why" is itself a senior-level teaching point. **Conceptual-only** (venv/poetry/uv, Docker, CI/CD, Git, server deployment, great-expectations) goes in KNOW explainers + JUDGE "spot the broken Dockerfile/lockfile" snippets, never as runnable DO drills.

---

## D. Mapped to PL's four frames — NEW clusters + example problem titles

All titles are **original, data/engineering-framed**, easy->medium. They illustrate scope, not final copy. Existing banks (gotchas, idioms, DSA, pandas/numpy) are well-specified in `PL-BUILD-SPEC.md` section 2; this section adds the **NEW** clusters the research surfaces.

### KNOW (depth explainers) — NEW tracks

| New KNOW track | Why | Example explainer titles |
|---|---|---|
| **Packaging & reproducibility** (conceptual-only, but high-value) | The notebook->prod gap's mechanical half; no source omits it. | "venv, pip, and the lockfile: why 'works on my machine' is a bug" - "Pinning vs. resolving: what `requirements.txt` actually promises" - "Seed everything: Python, numpy, and the framework are three different RNGs" |
| **The SWE->AIE bridge map** | Orients the audience: which SWE skills travel into AI work. | "Why AI engineering is 80% classic SWE around a stochastic core" - "The 5-layer LLM app: context -> guardrails -> gateway -> cache -> monitoring" |
| **Typing for data code** | Type hints as self-documenting contracts; the static<->runtime gap. | "Type hints that catch bugs before the code runs" - "Why `df: pd.DataFrame` doesn't tell you which columns exist" - "Pair mypy (compile-time) with pydantic/pandera (runtime)" |
| **Async, the GIL, and I/O-bound work** | The concurrency vs parallelism distinction prevents both deadlocks and wasted spend. | "Async vs threads vs processes: pick by I/O-bound vs CPU-bound" - "Why one slow API call shouldn't block the other nine" |
| **Notebook -> production** | The flagship gap; grounds the whole lab's "ships code" identity. | "Hidden state: why 'Restart & Run All' is the only result you can trust" - "Graduate code out of the notebook: the cell -> pure function -> module path" |

### DO (drill banks) — NEW banks + clusters

| New DO bank / cluster | What it drills | Example problem titles |
|---|---|---|
| **Bank E — Typing & validation** (NEW bank) | Type hints + pydantic/dataclasses as runtime guards over messy data. | "Make this config a dataclass and reject the bad row" - "Annotate the cleaner so mypy flags the caller's mistake" - "A pydantic model that coerces, validates, and fails loud on a bad payload" - "Replace the stringly-typed status with an Enum" |
| **Bank F — APIs & async** (NEW bank, partial-Pyodide) | Request/response anatomy + async I/O patterns, against simulated calls. | "Parse this JSON response into typed records" - "Fire 10 simulated model calls concurrently with `asyncio.gather`" - "Throttle to 3 concurrent calls with a Semaphore" - "Retry-with-backoff a flaky call (and stop after N)" - "Build the right URL + headers for a paginated pull" |
| **Bank G — Testing & guardrails** (NEW bank) | pytest-style assertions, edge cases, and fail-loud data checks. | "Write 3 asserts that would catch this off-by-one" - "Add a boundary assert so a silent NaN can't reach the total" - "Parametrize: same test, four edge inputs (empty, all-dup, single, huge)" - "Schema-check this DataFrame before you transform it (pandera-style)" |
| **Serialization & caching** (cluster, can sit in idioms or Bank F) | json/pickle round-trips + `lru_cache`. | "Round-trip this nested config through JSON without losing the dates" - "Cache the expensive lookup with `lru_cache` and prove the second call is free" |
| **The Python<->SQL seam** (cluster) | sqlite3/SQLAlchemy from Python — the analyst's daily bridge. | "Load a DataFrame into sqlite and answer the question with one query" - "Parameterize the query (and see why string-concat is the injection trap)" |

### BUILD (scaffolded mini-projects) — NEW projects

Each is one small, evolving artifact (the Cosmic-Python "one running codebase" idea), easy->medium, fully Pyodide-runnable.

| New BUILD project | What it integrates | Shape |
|---|---|---|
| **Typed config loader** | dataclasses/pydantic + validation + JSON | Build a loader that reads a config dict, validates types, and fails loud on a bad field — then add a new field and watch the contract enforce it. |
| **A tiny tested pipeline** | functions/modules + pytest + guardrail asserts | Refactor a "notebook blob" into 3 pure functions, write a test per function, add boundary asserts. The notebook->prod arc, made concrete. |
| **Async fan-out client (simulated)** | asyncio + Semaphore + retry/backoff + caching | Call 20 simulated endpoints concurrently, rate-limit to 5, retry failures, cache repeats — the "feel the cost of doing it serially" glass-box race. |
| **DataFrame -> sqlite mini-mart** | pandas + sqlite3 + SQLAlchemy + the Python<->SQL seam | Load a small CSV into pandas, write to sqlite, answer 2 questions via query + via pandas, compare. |
| **Validate-then-transform** | pandera/pydantic schema + pandas chain | A schema gate in front of a clean->group->window pipeline; feed it a corrupt row and watch it stop at the gate, not at the wrong total. |

### JUDGE ("code that runs and lies") — NEW forensic clusters

The flagship differentiator. Each is a snippet that **runs and returns a plausible result but is wrong** — the learner predicts the failure before the glass-box reveal, then applies the minimal fix. Grounded in the real anti-patterns the research named.

| New JUDGE cluster | The lie | Example forensic titles |
|---|---|---|
| **pandas silent-wrongness** (extend existing) | Runs, plausible, wrong. | "The chained-assignment that didn't assign (`SettingWithCopyWarning`)" - "The inner-merge that silently dropped 12% of rows" - "`fillna(0)` on a string column that became `'0'`" - "`groupby` that dropped the NaN-key group" - "`/` vs `//` turned the count into a float" |
| **AI-generated code review** (NEW — high-relevance) | LLM output that looks right. | "Spot the hallucinated API (`pd.read_exel`)" - "The deprecated `df.append()` an assistant suggested (removed in pandas 2.0)" - "The mutable default arg that accumulates across calls" - "The off-by-one in the AI's slicing" |
| **Validation / guardrail failures** (NEW) | Over-defensive code that hides corruption. | "The bare `except:` that swallowed the real error and returned a default" - "The missing boundary check that let a null reach the financial sum" - "The 'fail-silent' that should have been 'fail-loud'" |
| **Type/contract lies** (NEW) | Types that don't match reality. | "The function whose hint says `int` but returns `None` on the empty case" - "The pydantic model that coerced `'5'` to `5` and hid a data bug" |
| **Reproducibility traps** (NEW) | Non-deterministic results dressed as deterministic. | "Why this 'seeded' run still differs (only Python's RNG was seeded, not numpy's)" - "The result that only exists in a 3-hour-old kernel" |

---

## E. Prioritized backlog — top 12 additions (audience value x easy->med browser scope)

Ranked. Each tagged with its frame and Pyodide status. Bias is toward **fully-runnable, high-audience-value, low-authoring-cost** additions that extend PL's signature (glass-box + judgment) into the SWE->AIE bridge.

| # | Addition | Frame | Pyodide | Why it ranks here |
|---|---|---|---|---|
| 1 | **JUDGE: AI-generated code review cluster** (hallucinated/deprecated APIs, mutable defaults, off-by-one) | JUDGE | Runnable | Highest differentiation x audience pull. Nobody else drills "read the LLM's code critically." Directly on PL's "is the code an LLM handed you right?" thesis. |
| 2 | **DO Bank G: Testing & guardrails** (asserts, edge cases, fail-loud, schema-check) | DO | Runnable | The most-cited notebook->prod habit. Low authoring cost, runs cleanly, immediately useful. |
| 3 | **DO Bank E: Typing & validation** (dataclasses, pydantic, Enums) | DO | Runnable | Pure-Python, pre-built, high-leverage; the "make illegal states unrepresentable" lesson. |
| 4 | **JUDGE: validation/guardrail-failure cluster** (bare except, silent coercion, fail-silent) | JUDGE | Runnable | Extends the forensic bank into the "quiet catastrophe" — a crash beats corrupted data. |
| 5 | **KNOW: Notebook -> production** explainer track | KNOW | n/a (explainer) | Frames PL's whole identity; cheap to author; the "why this lab exists" narrative. |
| 6 | **DO Bank F: APIs & async** (parse JSON, `gather`, Semaphore, retry/backoff) | DO | Partial | The single biggest AI-engineering crossover; async + rate-limit + retry are fully runnable as logic. Frame the no-raw-socket constraint as the lesson. |
| 7 | **BUILD: A tiny tested pipeline** (cell-blob -> 3 pure functions + tests + asserts) | BUILD | Runnable | Makes the notebook->prod arc concrete in one project; integrates #2. |
| 8 | **DO: Serialization & caching cluster** (json/pickle round-trip, `lru_cache`) | DO | Runnable | Stdlib, trivial to author, glass-box "the second call is free" demo. |
| 9 | **BUILD: Async fan-out client (simulated)** (concurrency + throttle + retry + cache) | BUILD | Partial | The flagship glass-box race: serial vs concurrent cost, made visible. Integrates #6. |
| 10 | **DO: Python<->SQL seam cluster** (DataFrame->sqlite, parameterized query, injection trap) | DO | Runnable | Bridges to PAL's SQL bank without duplicating it; the analyst's daily seam. |
| 11 | **KNOW: Typing for data code** explainer (hints as contracts, static<->runtime gap) | KNOW | n/a | Backstops banks E + G; explains why `df: pd.DataFrame` under-specifies. |
| 12 | **KNOW: Packaging & reproducibility** explainer (venv/lockfiles/seed-everything) | KNOW | Conceptual | Conceptual-only but completes the "ships code" story; pairs with JUDGE reproducibility traps. |

**Deferred / out of scope (named so they don't re-enter as ideas):** real Docker/CI-CD/Git *drills* (conceptual-only — KNOW + JUDGE-snippet at most), a live FastAPI server (no port bind — `TestClient` route-design is fine), great-expectations as a runnable bank (too heavy — concept only), competitive-DP/segment-trees/contest math (D-07 ceiling), ML model-training internals (MSL's lane).

**Format ideas borrowed from the book canon** (pedagogy only, no content):
- **Effective Python's "Item" card** -> every DO drill / KNOW explainer ships as *naive way -> better way -> why -> "Things to Remember" recap*. (Already aligns with PL's debrief schema.)
- **Fluent Python's "Take #1 -> Take #5" refactor progression** -> KNOW + BUILD evolve ONE artifact through diffable takes; the deltas are the lesson.
- **Cosmic Python's pain-first + Pros/Cons table + "when NOT to"** -> every method-rich problem leads with the pain the approach removes and names its boundary of applicability (feeds PL's judgment dial directly).
- **Zingaro's autograder-verdict-as-feedback + Time-Limit vs Wrong-Answer** -> PL already runs hidden tests in Pyodide; distinguish *wrong* (correctness) from *too-slow* (the glass-box timing) so one problem teaches two failure modes.
- **High Performance Python's "measure before you optimize" as an enforced flow** -> for perf/forensic content, require the profiler/timing step before the "fix" unlocks. This is literally PL's glass-box layer.

---

## F. Sources

**Roadmaps & learning repos**
- roadmap.sh — Python: https://roadmap.sh/python - Backend: https://roadmap.sh/backend - AI Engineer: https://roadmap.sh/ai-engineer - AI & Data Scientist: https://roadmap.sh/ai-data-scientist - Data Analyst: https://roadmap.sh/data-analyst (node lists confirmed via the `kamranahmedse/developer-roadmap` content folders)
- awesome-python: https://github.com/vinta/awesome-python
- build-your-own-x: https://github.com/codecrafters-io/build-your-own-x
- practical-python (Beazley): https://github.com/dabeaz-course/practical-python
- project-based-learning: https://github.com/practical-tutorials/project-based-learning
- coding-interview-university: https://github.com/jwasham/coding-interview-university
- NeetCode roadmap: https://neetcode.io/roadmap
- TheAlgorithms/Python: https://github.com/TheAlgorithms/Python

**SWE->AIE bridge**
- Chip Huyen — Building LLM applications for production: https://huyenchip.com/2023/04/11/llm-engineering.html
- Chip Huyen — 900 open-source AI tools: https://huyenchip.com/2024/03/14/ai-oss.html
- Chip Huyen — AI Engineering book repo + ToC: https://github.com/chiphuyen/aie-book - https://raw.githubusercontent.com/chiphuyen/aie-book/main/ToC.md
- Goku Mohandas — Made With ML (MLOps course + modules): https://madewithml.com/courses/mlops/ - https://github.com/GokuMohandas/Made-With-ML
- Eugene Yan — Design Patterns in ML Code: https://eugeneyan.com/writing/design-patterns/ - More patterns: https://eugeneyan.com/writing/more-patterns/

**Pyodide constraints (load-bearing for runnability verdicts)**
- Packages built in Pyodide: https://pyodide.org/en/stable/usage/packages-in-pyodide.html
- WASM constraints (threading/multiprocessing/sockets non-functional): https://pyodide.org/en/stable/usage/wasm-constraints.html
- pyodide.http (network limits: no raw sockets, CORS): https://pyodide.org/en/stable/usage/api/python-api/http.html
- FAQ (filesystem, threading): https://pyodide.org/en/stable/usage/faq.html

**PyPI headline purposes**
- pandas https://pypi.org/project/pandas/ - numpy https://pypi.org/project/numpy/ - polars https://pypi.org/project/polars/ - pydantic https://pypi.org/project/pydantic/ - fastapi https://pypi.org/project/fastapi/ - SQLAlchemy https://pypi.org/project/SQLAlchemy/ - pytest https://pypi.org/project/pytest/ - httpx https://pypi.org/project/httpx/ - requests https://pypi.org/project/requests/ - click https://pypi.org/project/click/ - python-dotenv https://pypi.org/project/python-dotenv/ - tenacity https://github.com/jd/tenacity - matplotlib https://pypi.org/project/matplotlib/ - pandera https://pypi.org/project/pandera/ - great-expectations https://pypi.org/project/great-expectations/ - tqdm https://tqdm.github.io/

**Notebook -> production gap**
- Joel Grus, "I Don't Like Notebooks" (JupyterCon 2018): https://www.youtube.com/watch?v=7jiPeIFXb6U
- fast.ai nbdev: https://www.fast.ai/posts/2019-11-27-nbdev.html
- pandas "Enhancing performance" (vectorization vs apply vs iterrows): https://pandas.pydata.org/docs/user_guide/enhancingperf.html
- Ted Petrou, Minimally Sufficient Pandas: https://github.com/tdpetrou/Minimally-Sufficient-Pandas
- Tom Augspurger, Modern Pandas (method chaining / performance): https://tomaugspurger.net/posts/method-chaining/ - https://tomaugspurger.net/posts/modern-4-performance/
- Pandera vs Great Expectations (endjin): https://endjin.com/blog/a-look-into-pandera-and-great-expectations-for-data-validation
- Software Carpentry — Defensive Programming (assertions): https://swc-osg-workshop.github.io/2017-05-17-JLAB/novice/python/05-defensive.html
- Dataquest — SettingWithCopyWarning: https://www.dataquest.io/blog/settingwithcopywarning/
- Deprecated-API code-assistant failure mode: https://dev.to/olivia_perell_/when-code-assistants-suggest-deprecated-pandas-apis-a-subtle-production-breaking-failure-mode-3aij
- Package-hallucination research (arXiv): https://arxiv.org/pdf/2509.22202

**Book pedagogy (approach only — public TOC / publisher / author pages, no interiors)**
- Fluent Python (O'Reilly catalog/TOC): https://www.oreilly.com/library/view/fluent-python-2nd/9781492056348/
- Effective Python (author site, Item structure): https://effectivepython.com/
- Robust Python (O'Reilly TOC): https://www.oreilly.com/library/view/robust-python/9781098100650/
- High Performance Python (O'Reilly TOC): https://www.oreilly.com/library/view/high-performance-python/9781492055013/
- Architecture Patterns with Python / Cosmic Python (free, CC-BY-NC-ND): https://www.cosmicpython.com/
- Classic Computer Science Problems in Python (Manning): https://www.manning.com/books/classic-computer-science-problems-in-python
- Learn to Code by Solving Problems (No Starch): https://nostarch.com/learn-code-solving-problems

_All sources public. No pirated or copyrighted book interiors were fetched; books are referenced by publicly-listed structure (chapter/Item/pattern names) and well-known approach only._
