// Bank E — BUILD frame: scaffolded mini-projects. A goal, then ordered steps;
// each step is a small runnable function checked by hidden tests, steps unlock
// sequentially, and a later step may call functions defined by earlier steps.
//
// Test-based, same harness as the other banks: each step's testSource defines
// __pl_checks = [(name, fn), ...]. At submit time the runner assembles
//   dataSetup + "\n" + (all PRIOR steps' solutions) + "\n" + the user's step code
// so the fixtures AND every prior-step function are in scope for this step's tests.
//
// Every solution + test VERIFIED in pandas 2.3 / numpy 2.x (CPython): all 12 steps
// across 4 projects pass with the exact stepper assembly (57/57 checks). Stored
// Python uses "double quotes" so the single-quoted JS strings need no inner
// escaping (house syntax rule). No backticks anywhere.

export const BUILD_CLUSTERS = {
  'pipelines': { label: 'Analytics Pipelines', accent: 'var(--accent)' },
  'reliability': { label: 'Data Reliability', accent: 'var(--red)' },
  'etl': { label: 'ETL & Cleaning', accent: 'var(--teal)' },
};
export const BUILD_CLUSTER_ORDER = ['pipelines', 'reliability', 'etl'];

export const buildProjects = [
  // ───────────────────────────────────────────────────────────────────────────
  // 1 — Weekly retention pipeline (cohort -> weeks-since -> pivot)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'build-weekly-retention',
    cluster: 'pipelines',
    title: 'Weekly retention pipeline',
    subtitle: 'Turn a raw event log into a cohort retention matrix, one function at a time.',
    difficulty: 'core',
    estimatedMin: 18,
    tags: ['cohorts', 'groupby', 'pivot', 'datetime'],
    brief: 'Retention is the metric every growth review opens with, and it is almost never sitting in a table ready to read. You start from an event log — one row per user per active day — and you have to derive the cohort each user belongs to, measure how many weeks after signup each event happened, and then collapse all of it into the triangular matrix everyone recognises: cohorts down the side, weeks-since-signup across the top, the share still active in each cell.\n\nYou will build it in three functions. Each one is small and testable on its own, and each later step calls the one before it — so by the last step you are assembling a real pipeline, not three disconnected snippets.',
    dataSetup: 'import pandas as pd\nimport numpy as np\n\n# events: one row per (user_id, activity day). signup_date is the user\'s first-ever day.\nevents = pd.DataFrame({\n    "user_id":    [1, 1, 1, 2, 2, 3, 3, 3, 4],\n    "signup_date":["2024-01-01","2024-01-01","2024-01-01","2024-01-01","2024-01-01","2024-01-08","2024-01-08","2024-01-08","2024-01-08"],\n    "event_date": ["2024-01-01","2024-01-09","2024-01-16","2024-01-02","2024-01-30","2024-01-08","2024-01-15","2024-01-29","2024-01-10"],\n})\nevents["signup_date"] = pd.to_datetime(events["signup_date"])\nevents["event_date"]  = pd.to_datetime(events["event_date"])',
    steps: [
      {
        id: 'week-index',
        title: 'Derive the week index',
        instruction: 'Write add_week_index(events) that returns a COPY of events with two new columns: cohort_week (the start of the ISO week the user signed up in) and week_index (whole weeks between signup_date and event_date, so a same-day event is week 0, day 8 is week 1). Do not mutate the input.',
        starterCode: 'def add_week_index(events):\n    # return a copy with cohort_week and an integer week_index (0 = signup week)\n    pass',
        solution: 'def add_week_index(events):\n    df = events.copy()\n    df["cohort_week"] = df["signup_date"].dt.to_period("W").dt.start_time\n    days = (df["event_date"] - df["signup_date"]).dt.days\n    df["week_index"] = (days // 7).astype(int)\n    return df',
        testSource: 'def _o():\n    return add_week_index(events)\n__pl_checks = [\n  ("week_index column exists", lambda: "week_index" in _o().columns),\n  ("cohort_week column exists", lambda: "cohort_week" in _o().columns),\n  ("same-day event is week 0", lambda: int(_o().loc[0, "week_index"]) == 0),\n  ("8 days later is week 1", lambda: int(_o().loc[1, "week_index"]) == 1),\n  ("15 days later is week 2", lambda: int(_o().loc[2, "week_index"]) == 2),\n  ("does not mutate input", lambda: "week_index" not in events.columns),\n  ("two distinct cohorts", lambda: add_week_index(events)["cohort_week"].nunique() == 2),\n]',
        hint: 'Integer-divide the day gap by 7 for the week index. .dt.to_period("W").dt.start_time snaps a date to the start of its ISO week. Always start with events.copy() so you never write back into the caller\'s frame.',
      },
      {
        id: 'cohort-counts',
        title: 'Count active users per cohort-week',
        instruction: 'Write cohort_week_counts(events). Call add_week_index from step 1, then return a long DataFrame with one row per (cohort_week, week_index) and a column users = the number of DISTINCT users active in that cell. Count distinct users, not raw event rows.',
        starterCode: 'def cohort_week_counts(events):\n    # use add_week_index, then count distinct users per (cohort_week, week_index)\n    pass',
        solution: 'def cohort_week_counts(events):\n    df = add_week_index(events)\n    g = (df.groupby(["cohort_week", "week_index"])["user_id"]\n            .nunique()\n            .reset_index(name="users"))\n    return g',
        testSource: 'def _o():\n    return cohort_week_counts(events)\ndef _lookup(cw_idx, wk):\n    o = _o()\n    cws = sorted(o["cohort_week"].unique())\n    row = o[(o["cohort_week"] == cws[cw_idx]) & (o["week_index"] == wk)]\n    return int(row["users"].iloc[0]) if len(row) else 0\n__pl_checks = [\n  ("has users column", lambda: "users" in _o().columns),\n  ("counts distinct users not rows", lambda: _lookup(0, 0) == 2),\n  ("cohort 1 week 1 has one user", lambda: _lookup(0, 1) == 1),\n  ("cohort 1 week 2 has one user", lambda: _lookup(0, 2) == 1),\n  ("cohort 2 week 0 has two users", lambda: _lookup(1, 0) == 2),\n]',
        hint: 'groupby(["cohort_week", "week_index"])["user_id"].nunique() does the distinct-user count in one pass. reset_index(name="users") turns the grouped Series back into a tidy long frame.',
      },
      {
        id: 'retention-matrix',
        title: 'Pivot into the retention matrix',
        instruction: 'Write retention_matrix(events). Call cohort_week_counts, pivot it so cohort_week is the index and week_index is the columns (missing cells filled with 0), then divide every cohort row by its own week-0 count to get retention RATES rounded to 3 decimals. Week 0 should be 1.0 for every cohort.',
        starterCode: 'def retention_matrix(events):\n    # pivot cohort_week x week_index, then divide each row by its week-0 count\n    pass',
        solution: 'def retention_matrix(events):\n    counts = cohort_week_counts(events)\n    wide = counts.pivot_table(index="cohort_week", columns="week_index",\n                              values="users", fill_value=0)\n    base = wide[0]\n    rates = wide.div(base, axis=0).round(3)\n    return rates',
        testSource: 'def _o():\n    return retention_matrix(events)\n__pl_checks = [\n  ("week 0 is 100 percent for every cohort", lambda: bool((_o()[0] == 1.0).all())),\n  ("cohort 1 week 1 retention is 0.5", lambda: abs(float(_o().iloc[0][1]) - 0.5) < 1e-9),\n  ("cohort 1 week 2 retention is 0.5", lambda: abs(float(_o().iloc[0][2]) - 0.5) < 1e-9),\n  ("rates never exceed 1.0", lambda: bool((_o().values <= 1.0 + 1e-9).all())),\n  ("index is the cohort week", lambda: _o().index.name == "cohort_week"),\n]',
        hint: 'pivot_table(..., fill_value=0) gives you a dense matrix even when a cohort never reached some week. wide.div(wide[0], axis=0) divides each ROW by that row\'s week-0 value — the axis=0 alignment is the whole trick.',
      },
    ],
    debrief: '**Approach:** A retention matrix is three transforms stacked: derive a per-event week offset, aggregate to distinct users per cohort-week, then pivot and normalise. Building it as three named functions instead of one chained expression is what makes it debuggable — when a number looks wrong you know exactly which function to inspect.\n\n**Sanity check:** Week 0 must be 1.0 across every cohort by construction. If it is not, your base (the divisor) is being computed across the wrong axis. The axis=0 in .div(base, axis=0) is the single most common place this pipeline breaks — it tells pandas to align the divisor by row index, not by column.\n\nDistinct-user counts (nunique) versus row counts is the other quiet trap: an event log has multiple rows per user per week, so a naive size() inflates every cell and pushes retention above 100%. The check "rates never exceed 1.0" exists precisely to catch that.\n\n**Interviewer follow-up:** Asked to switch from weekly to monthly retention, you change one line — the period in add_week_index — and nothing downstream moves. That separation is the point of building it in steps.',
    keyTakeaways: [
      'Stage a pipeline as small named functions: derive, aggregate, reshape. Each is independently testable, and a wrong number tells you which stage to open.',
      'Count distinct users (nunique), not event rows, or every retention cell inflates past 100%.',
      'Normalising a pivot by its own first column is .div(base, axis=0) — the axis=0 aligns the divisor by row, and getting it wrong is the classic cohort bug.',
      'Putting the time grain (week vs month) in one function means changing the grain is a one-line edit, not a rewrite.',
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 2 — Metric guardrail validator (guards that RAISE)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'build-guardrail-validator',
    cluster: 'reliability',
    title: 'Metric guardrail validator',
    subtitle: 'Build the guards that stop a broken extract from ever reaching a dashboard.',
    difficulty: 'core',
    estimatedMin: 15,
    tags: ['data-quality', 'assertions', 'validation', 'reliability'],
    brief: 'A silently broken metric is worse than a missing one: nobody notices until a decision has already been made on a bad number. The fix is cheap and it is a habit senior data people build reflexively — guard the data at the boundary, and make the guard RAISE loudly instead of returning a flag everyone forgets to check.\n\nYou will build three guards — rowcount, unique key, and null rate — each a small function that raises ValueError when its invariant is violated, then compose them into one validate_extract that a pipeline calls before it trusts any extract. The final step reuses the guards you wrote in the first two.',
    dataSetup: 'import pandas as pd\n\n# A "good" daily metrics extract and a few deliberately broken ones.\ngood = pd.DataFrame({\n    "date":   ["2024-01-01","2024-01-02","2024-01-03"],\n    "metric": [100.0, 110.0, 105.0],\n})\ndup_key = pd.DataFrame({\n    "date":   ["2024-01-01","2024-01-01","2024-01-03"],\n    "metric": [100.0, 110.0, 105.0],\n})\ntoo_null = pd.DataFrame({\n    "date":   ["2024-01-01","2024-01-02","2024-01-03","2024-01-04"],\n    "metric": [100.0, None, None, 105.0],\n})',
    steps: [
      {
        id: 'rowcount-guard',
        title: 'Guard the row count',
        instruction: 'Write check_rowcount(df, min_rows). If df has fewer than min_rows rows, raise ValueError with a message that names the actual and expected counts. Otherwise return the row count. An empty or truncated extract is the most common silent failure — catch it first.',
        starterCode: 'def check_rowcount(df, min_rows):\n    # raise ValueError if df has fewer than min_rows rows; else return the count\n    pass',
        solution: 'def check_rowcount(df, min_rows):\n    n = len(df)\n    if n < min_rows:\n        raise ValueError("rowcount guard failed: got " + str(n) + " rows, expected at least " + str(min_rows))\n    return n',
        testSource: 'def _raised(fn):\n    try:\n        fn(); return False\n    except ValueError:\n        return True\n__pl_checks = [\n  ("passes when enough rows", lambda: check_rowcount(good, 3) == 3),\n  ("returns the row count", lambda: check_rowcount(good, 1) == 3),\n  ("raises when too few rows", lambda: _raised(lambda: check_rowcount(good, 10))),\n  ("raises ValueError specifically", lambda: _raised(lambda: check_rowcount(good.iloc[:0], 1))),\n]',
        hint: 'len(df) is the row count. Raise inside an if rather than returning False — a guard that returns a flag is a guard everyone forgets to check, but a raise stops the pipeline cold.',
      },
      {
        id: 'unique-key-guard',
        title: 'Guard the key uniqueness',
        instruction: 'Write check_unique_key(df, key). If the key column contains any duplicate values, raise ValueError naming how many duplicates there are. Otherwise return True. A duplicated key is what silently fans out every downstream join.',
        starterCode: 'def check_unique_key(df, key):\n    # raise ValueError if the key column has duplicate values; else return True\n    pass',
        solution: 'def check_unique_key(df, key):\n    dups = int(df.duplicated(subset=[key]).sum())\n    if dups > 0:\n        raise ValueError("unique-key guard failed: " + str(dups) + " duplicate value(s) in " + key)\n    return True',
        testSource: 'def _raised(fn):\n    try:\n        fn(); return False\n    except ValueError:\n        return True\n__pl_checks = [\n  ("passes on a unique key", lambda: check_unique_key(good, "date") is True),\n  ("raises on duplicate keys", lambda: _raised(lambda: check_unique_key(dup_key, "date"))),\n  ("counts the duplicates, still raises", lambda: _raised(lambda: check_unique_key(dup_key, "date"))),\n]',
        hint: 'df.duplicated(subset=[key]).sum() counts the extra occurrences of each value. Any count above 0 means the key is not unique — and that is exactly what would inflate a downstream merge.',
      },
      {
        id: 'compose-validator',
        title: 'Compose the full validator',
        instruction: 'Write validate_extract(df, key, min_rows, max_null_rate). Run check_rowcount and check_unique_key from the earlier steps (let them raise), then compute the null rate of the metric column and raise ValueError if it exceeds max_null_rate. Return True only if every guard passes.',
        starterCode: 'def validate_extract(df, key, min_rows, max_null_rate):\n    # run the rowcount + unique-key guards, then a null-rate guard; return True if all pass\n    pass',
        solution: 'def validate_extract(df, key, min_rows, max_null_rate):\n    check_rowcount(df, min_rows)\n    check_unique_key(df, key)\n    null_rate = float(df["metric"].isna().mean())\n    if null_rate > max_null_rate:\n        raise ValueError("null-rate guard failed: " + ("%.2f" % null_rate) + " > " + ("%.2f" % max_null_rate))\n    return True',
        testSource: 'def _raised(fn):\n    try:\n        fn(); return False\n    except ValueError:\n        return True\n__pl_checks = [\n  ("clean extract passes all guards", lambda: validate_extract(good, "date", 3, 0.1) is True),\n  ("duplicate key trips the unique guard", lambda: _raised(lambda: validate_extract(dup_key, "date", 1, 0.5))),\n  ("too many nulls trips the null guard", lambda: _raised(lambda: validate_extract(too_null, "date", 1, 0.1))),\n  ("loose null threshold lets it pass", lambda: validate_extract(too_null, "date", 1, 0.9) is True),\n  ("too few rows trips the rowcount guard", lambda: _raised(lambda: validate_extract(good, "date", 99, 0.5))),\n]',
        hint: 'Just call the two guards you already wrote — they raise on their own, so you do not re-check their return values. df["metric"].isna().mean() is the null rate as a fraction between 0 and 1.',
      },
    ],
    debrief: '**Approach:** A validator is a stack of cheap invariants that each raise. The order matters: check the row count first (an empty extract makes every other check meaningless), then key uniqueness (a duplicated key poisons joins), then value-level quality like null rate. Composing them into one validate_extract gives a pipeline a single gate to call.\n\n**Wrong answer that runs:** Returning True/False from each guard and collecting the flags looks tidy and is the trap — the caller has to remember to inspect every flag, and the day someone forgets, a broken extract sails through. Raising is non-optional by design: the pipeline cannot continue past a failed guard without explicitly catching it.\n\n**Sanity check:** Run the validator against a known-good extract in your tests, not just broken ones. A guard that raises on everything is as useless as one that raises on nothing — the "clean extract passes" check is what proves the gate actually opens.\n\n**Interviewer follow-up:** Where does this run? At the boundary — right after extraction, before anything downstream reads the data. The whole value is failing at the source, where the blast radius is one job, instead of three dashboards later.',
    keyTakeaways: [
      'Guard data at the boundary and make guards RAISE — a returned flag is a check someone will forget; an exception stops the pipeline cold.',
      'Order guards cheapest-and-most-fundamental first: rowcount, then key uniqueness, then value-level quality like null rate.',
      'Compose small single-purpose guards into one validator the pipeline calls once — easy to test, easy to extend.',
      'Always test the happy path too: a validator that rejects good data is as broken as one that accepts bad data.',
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 3 — Small ETL clean (parse + dedup + typecast)
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'build-etl-clean',
    cluster: 'etl',
    title: 'Clean a messy export',
    subtitle: 'Take a raw CSV-style export and turn it into something you can actually query.',
    difficulty: 'core',
    estimatedMin: 16,
    tags: ['cleaning', 'typecast', 'dedup', 'parsing'],
    brief: 'Real exports arrive hostile: column names with spaces and mixed casing, money stored as "$10.50" strings, dates that are mostly parseable except the one row that is not, and the occasional exact-duplicate row from a double-run upstream. Before any analysis, you normalise it — and you do it in a fixed, repeatable order so the same export cleans the same way every time.\n\nYou will build the cleaner in three steps: standardise the column names, parse and typecast the values, then dedup and finalise. Each step builds on the last, so the final clean_export is the whole pipeline in one call.',
    dataSetup: 'import pandas as pd\n\n# Raw export: messy casing/whitespace, mixed types, an exact dup, a dollar string.\nraw = pd.DataFrame({\n    "Order ID":  ["1001", "1001", "1002", "1003"],\n    "Email":     ["  ALICE@x.com ", "  ALICE@x.com ", "bob@x.com", "carol@x.com"],\n    "Amount":    ["$10.50", "$10.50", "$7.00", "$3.25"],\n    "Signed Up": ["2024-01-01", "2024-01-01", "2024-01-03", "not a date"],\n})',
    steps: [
      {
        id: 'clean-columns',
        title: 'Standardise the column names',
        instruction: 'Write clean_columns(raw) that returns a COPY of raw with every column name trimmed, lowercased, and spaces replaced by underscores — so "Order ID" becomes "order_id" and "Signed Up" becomes "signed_up". Do not mutate the input.',
        starterCode: 'def clean_columns(raw):\n    # return a copy with snake_case column names (trim, lowercase, spaces -> underscores)\n    pass',
        solution: 'def clean_columns(raw):\n    df = raw.copy()\n    df.columns = [c.strip().lower().replace(" ", "_") for c in df.columns]\n    return df',
        testSource: 'def _o():\n    return clean_columns(raw)\n__pl_checks = [\n  ("order id renamed", lambda: "order_id" in _o().columns),\n  ("signed up renamed", lambda: "signed_up" in _o().columns),\n  ("no spaces in any column", lambda: all(" " not in c for c in _o().columns)),\n  ("all column names lowercase", lambda: all(c == c.lower() for c in _o().columns)),\n  ("does not mutate input columns", lambda: "Order ID" in raw.columns),\n]',
        hint: 'A list comprehension over df.columns lets you chain .strip().lower().replace(" ", "_") on each name. Assign the new list back to df.columns. Start from raw.copy() so the caller\'s frame keeps its original names.',
      },
      {
        id: 'typecast',
        title: 'Parse and typecast the values',
        instruction: 'Write typecast(raw). Start by calling clean_columns from step 1, then: trim+lowercase the email column, strip the "$" from amount and cast it to float, and parse signed_up to datetime with errors coerced (so the unparseable row becomes NaT instead of crashing).',
        starterCode: 'def typecast(raw):\n    # clean columns, then fix email, amount (float), and signed_up (datetime, coerce errors)\n    pass',
        solution: 'def typecast(raw):\n    df = clean_columns(raw)\n    df["email"] = df["email"].str.strip().str.lower()\n    df["amount"] = df["amount"].str.replace("$", "", regex=False).astype(float)\n    df["signed_up"] = pd.to_datetime(df["signed_up"], errors="coerce")\n    return df',
        testSource: 'def _o():\n    return typecast(raw)\n__pl_checks = [\n  ("amount is numeric", lambda: str(_o()["amount"].dtype).startswith("float")),\n  ("dollar sign stripped", lambda: abs(float(_o()["amount"].iloc[0]) - 10.5) < 1e-9),\n  ("email trimmed and lowercased", lambda: _o()["email"].iloc[0] == "alice@x.com"),\n  ("signed_up is datetime", lambda: "datetime" in str(_o()["signed_up"].dtype)),\n  ("bad date coerced to NaT", lambda: bool(pd.isna(_o()["signed_up"].iloc[3]))),\n]',
        hint: 'str.replace("$", "", regex=False) before .astype(float) — the dollar sign is a literal, so turn regex off. pd.to_datetime(..., errors="coerce") turns anything unparseable into NaT instead of raising, which is what you want for a single bad row.',
      },
      {
        id: 'dedup-finalize',
        title: 'Dedup and finalise',
        instruction: 'Write clean_export(raw). Call typecast from step 2, drop duplicate rows on order_id (keeping the first), and reset the index. The result should have one row per order, correct types, and a clean 0..n index.',
        starterCode: 'def clean_export(raw):\n    # typecast, then drop duplicate order_id rows and reset the index\n    pass',
        solution: 'def clean_export(raw):\n    df = typecast(raw)\n    df = df.drop_duplicates(subset=["order_id"]).reset_index(drop=True)\n    return df',
        testSource: 'def _o():\n    return clean_export(raw)\n__pl_checks = [\n  ("duplicate order removed", lambda: len(_o()) == 3),\n  ("order ids are unique", lambda: _o()["order_id"].is_unique),\n  ("index reset to range", lambda: list(_o().index) == [0, 1, 2]),\n  ("still typed: amount numeric", lambda: str(_o()["amount"].dtype).startswith("float")),\n  ("kept the first dup row", lambda: _o()["email"].iloc[0] == "alice@x.com"),\n]',
        hint: 'drop_duplicates(subset=["order_id"]) keeps the first occurrence by default. reset_index(drop=True) renumbers 0..n and throws away the old index so you do not carry gaps from the dropped rows.',
      },
    ],
    debrief: '**Before you write:** Cleaning has an order, and getting it wrong costs you. Standardise column names first so every later step references stable names. Typecast before you dedup, because "exact duplicate" is only meaningful once values are in a canonical form — two rows that differ only by trailing whitespace or "$" formatting are duplicates you would miss if you deduped on the raw strings.\n\n**Approach:** Each step returns a fresh frame and calls the previous step, so clean_export(raw) is the entire pipeline expressed as one composition. That makes the cleaner deterministic — the same export always cleans to the same output — and lets you unit-test each transform in isolation.\n\n**Forensic trap:** errors="coerce" is the difference between a pipeline that survives one bad date and one that dies on row 4. It turns the unparseable value into NaT, which you can then count, quarantine, or drop deliberately — a decision you make, instead of a crash you did not.\n\n**Sanity check:** After dedup, assert the key is unique (is_unique) and the row count dropped by exactly the number of dupes you expected. Silent over- or under-deduping is a classic way to lose or double-count revenue.',
    keyTakeaways: [
      'Clean in a fixed order: standardise names, then typecast, then dedup — deduping before typecasting misses duplicates that differ only by formatting.',
      'pd.to_datetime(..., errors="coerce") turns one bad row into NaT instead of crashing the whole job, leaving you in control of what to do with it.',
      'str.replace("$", "", regex=False) before .astype(float): the dollar sign is a literal, so regex off, and cast only after the string is clean.',
      'reset_index(drop=True) after dropping rows gives a clean 0..n index; verify key uniqueness with is_unique so you catch over- or under-deduping.',
    ],
  },

  // ───────────────────────────────────────────────────────────────────────────
  // 4 — Funnel / conversion builder
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'build-funnel-conversion',
    cluster: 'pipelines',
    title: 'Funnel conversion builder',
    subtitle: 'From an event log to step-by-step conversion rates and the worst drop-off.',
    difficulty: 'core',
    estimatedMin: 16,
    tags: ['funnel', 'conversion', 'groupby', 'metrics'],
    brief: 'Every product review eventually asks the same thing: where are we losing people? A funnel answers it — count the distinct users who reached each ordered step, express each step as a rate, and find the worst single drop-off. The data is a flat event log; the structure is something you impose, because the steps have a meaningful order that the rows do not.\n\nYou will build it in three steps: count distinct users per funnel step in the right order, turn those counts into overall and step-over-step conversion rates, then surface the step with the biggest fall. Each step uses the one before it.',
    dataSetup: 'import pandas as pd\n\n# events: one row per (user, funnel step reached). steps are ordered below.\nevents = pd.DataFrame({\n    "user_id": [1, 1, 1, 2, 2, 3, 3, 3, 4],\n    "step":    ["visit","signup","purchase","visit","signup","visit","signup","purchase","visit"],\n})\nSTEP_ORDER = ["visit", "signup", "purchase"]',
    steps: [
      {
        id: 'users-per-step',
        title: 'Count distinct users per step',
        instruction: 'Write users_per_step(events, step_order) that returns a pandas Series indexed by step_order (in that exact order), where each value is the number of DISTINCT users who reached that step. A step nobody reached should still appear, with a count of 0.',
        starterCode: 'def users_per_step(events, step_order):\n    # distinct users per step, as a Series indexed in step_order (missing steps -> 0)\n    pass',
        solution: 'def users_per_step(events, step_order):\n    counts = (events.groupby("step")["user_id"].nunique())\n    out = pd.Series({s: int(counts.get(s, 0)) for s in step_order})\n    return out',
        testSource: 'def _o():\n    return users_per_step(events, STEP_ORDER)\n__pl_checks = [\n  ("visit has 4 users", lambda: int(_o()["visit"]) == 4),\n  ("signup has 3 users", lambda: int(_o()["signup"]) == 3),\n  ("purchase has 2 users", lambda: int(_o()["purchase"]) == 2),\n  ("counts distinct users not rows", lambda: int(_o()["visit"]) == 4),\n  ("series follows the given step order", lambda: list(_o().index) == STEP_ORDER),\n]',
        hint: 'groupby("step")["user_id"].nunique() gives you the distinct count per step, but in alphabetical order. Rebuild the Series from step_order so the funnel reads top-to-bottom, and use counts.get(s, 0) so a never-reached step still shows up.',
      },
      {
        id: 'funnel-table',
        title: 'Build the conversion table',
        instruction: 'Write funnel_table(events, step_order). Call users_per_step, then return a DataFrame with columns step, users, overall_rate (users divided by the top-of-funnel count), and step_rate (users divided by the previous step\'s users). Round rates to 3 decimals; the first step\'s step_rate is 1.0.',
        starterCode: 'def funnel_table(events, step_order):\n    # build a table with users, overall_rate (vs top), and step_rate (vs previous step)\n    pass',
        solution: 'def funnel_table(events, step_order):\n    counts = users_per_step(events, step_order)\n    df = counts.rename("users").reset_index()\n    df.columns = ["step", "users"]\n    top = int(df["users"].iloc[0])\n    df["overall_rate"] = (df["users"] / top).round(3)\n    df["step_rate"] = (df["users"] / df["users"].shift(1)).round(3)\n    df.loc[0, "step_rate"] = 1.0\n    return df',
        testSource: 'def _o():\n    return funnel_table(events, STEP_ORDER)\n__pl_checks = [\n  ("has overall_rate and step_rate", lambda: set(["overall_rate","step_rate"]).issubset(_o().columns)),\n  ("top of funnel overall rate is 1.0", lambda: abs(float(_o()["overall_rate"].iloc[0]) - 1.0) < 1e-9),\n  ("purchase overall rate is 0.5", lambda: abs(float(_o()["overall_rate"].iloc[2]) - 0.5) < 1e-9),\n  ("signup step rate is 0.75", lambda: abs(float(_o()["step_rate"].iloc[1]) - 0.75) < 1e-9),\n  ("first step rate defaults to 1.0", lambda: abs(float(_o()["step_rate"].iloc[0]) - 1.0) < 1e-9),\n]',
        hint: 'overall_rate divides by a single number (the top-of-funnel count); step_rate divides by df["users"].shift(1), which lines each step up against the previous row. shift makes the first step_rate NaN, so overwrite df.loc[0, "step_rate"] with 1.0.',
      },
      {
        id: 'biggest-dropoff',
        title: 'Find the worst drop-off',
        instruction: 'Write biggest_dropoff(events, step_order). Call funnel_table, compute the drop at each step as 1 minus its step_rate (the first step has no drop), and return the NAME of the step with the largest drop. This is the answer to "where are we losing people?"',
        starterCode: 'def biggest_dropoff(events, step_order):\n    # return the name of the step with the largest 1 - step_rate drop\n    pass',
        solution: 'def biggest_dropoff(events, step_order):\n    tbl = funnel_table(events, step_order)\n    drop = 1.0 - tbl["step_rate"]\n    drop.iloc[0] = 0.0\n    i = int(drop.idxmax())\n    return tbl["step"].iloc[i]',
        testSource: 'def _o():\n    return biggest_dropoff(events, STEP_ORDER)\n__pl_checks = [\n  ("returns the worst-converting step", lambda: _o() == "purchase"),\n  ("returns a string step name", lambda: isinstance(_o(), str)),\n  ("step is one of the funnel steps", lambda: _o() in STEP_ORDER),\n]',
        hint: '1 - step_rate is the share lost at each step. Force the first step\'s drop to 0 so the top of the funnel never wins. idxmax gives the positional index of the largest drop; use it to look up the step name.',
      },
    ],
    debrief: '**What this builds:** A funnel imposes order on an unordered event log. The rows do not know that visit comes before purchase — you supply STEP_ORDER, and every step downstream respects it. That is why users_per_step rebuilds the Series from step_order instead of trusting groupby\'s alphabetical output.\n\n**Approach:** Two different rates answer two different questions. overall_rate (versus the top of the funnel) tells you total survivorship — what share of everyone who entered reached this step. step_rate (versus the previous step) tells you the local conversion — and it is the one that locates the leak, because a step can have a low overall rate simply by being deep, not by being leaky.\n\n**Sanity check:** Counts must be non-increasing down a funnel — you cannot have more purchasers than visitors. If a later step shows more users than an earlier one, your event log lets users skip steps and your funnel definition needs to handle that explicitly (e.g. count "reached at least this step").\n\n**Interviewer follow-up:** "Biggest drop-off" means biggest step-over-step fall, not lowest overall rate — those differ. The purchase step here has both the lowest overall rate and the biggest single drop, but in a longer funnel they routinely point at different steps, and conflating them sends the team to optimise the wrong screen.',
    keyTakeaways: [
      'A funnel imposes order the event log does not have — rebuild counts in your explicit step_order, never trust groupby\'s alphabetical sort.',
      'Distinguish overall rate (vs top of funnel, = survivorship) from step rate (vs previous step, = local conversion); they answer different questions.',
      'The biggest drop-off is the largest step-over-step fall (1 - step_rate), which is not the same as the lowest overall rate in a multi-step funnel.',
      'Funnel counts must be non-increasing; a later step with more users than an earlier one means your definition lets people skip steps.',
    ],
  },
];

export default buildProjects;
