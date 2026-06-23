#!/usr/bin/env python3
"""PL problem-bank audit — the committed quality gate (the Python analog of PAL's
scripts/audit_sql_lab.py). Tier 1 FAIL blocks commit; Tier 2 WARN is logged.

Run from the repo root (needs node + pandas + numpy):
    python3 scripts/audit_problems.py

What it does (mirrors the SQL Lab discipline, adapted for Python — see the study
in LINEAGE / docs/CONTENT-STANDARD.md):
  - extracts the three banks via node (`_extract_problems.mjs`),
  - runs EVERY test-based solution + its __pl_checks (all must pass),
  - re-runs EVERY gotcha `code`/`fix.code` and diffs against its declared output,
  - required-fields, duplicate-id, pattern-membership, difficulty checks,
  - AST safety sandbox (the analog of the SQL DROP/DELETE keyword ban): blocks
    imports outside an allow-list and dangerous builtins (open/eval/exec/...).
"""
import ast, io, json, subprocess, sys, contextlib, traceback
from collections import Counter

ALLOWED_IMPORTS = {
    'pandas', 'numpy', 'collections', 'heapq', 'itertools', 'functools', 'math',
    'decimal', 'datetime', 're', 'bisect', 'string', 'statistics', 'copy', 'random',
    'contextlib', 'dataclasses', 'enum', 'typing', 'abc', 'json', 'operator',
}
BLOCKED_CALLS = {
    'open', 'eval', 'exec', 'compile', 'input', '__import__', 'breakpoint',
}
REQUIRED_TEST = ['id', 'bank', 'pattern', 'title', 'difficulty', 'prompt',
                 'starterCode', 'testSource', 'solution', 'glassBox']
REQUIRED_GOTCHA = ['id', 'cluster', 'title', 'difficulty', 'setup', 'code',
                   'actualOutput', 'glassBox', 'fix', 'debrief']
DIFFS = {'warmup', 'core', 'stretch'}

t1 = []  # (id, msg) — blocks commit
t2 = []  # (category, id, msg) — warn only


def safety_scan(pid, code):
    try:
        tree = ast.parse(code)
    except SyntaxError as e:
        t1.append((pid, f'SYNTAX error in stored code: {e}'))
        return
    for node in ast.walk(tree):
        if isinstance(node, ast.Import):
            for a in node.names:
                if a.name.split('.')[0] not in ALLOWED_IMPORTS:
                    t1.append((pid, f'blocked import: {a.name}'))
        elif isinstance(node, ast.ImportFrom):
            if (node.module or '').split('.')[0] not in ALLOWED_IMPORTS:
                t1.append((pid, f'blocked import-from: {node.module}'))
        elif isinstance(node, ast.Call) and isinstance(node.func, ast.Name):
            if node.func.id in BLOCKED_CALLS:
                t1.append((pid, f'blocked call: {node.func.id}'))


def run_checks(pid, solution, test):
    ns = {}
    try:
        exec(solution, ns)
        exec(test, ns)
    except Exception:
        t1.append((pid, 'solution+test raised: ' + traceback.format_exc().strip().splitlines()[-1]))
        return
    checks = ns.get('__pl_checks')
    if not checks:
        t1.append((pid, 'no __pl_checks defined'))
        return
    for name, fn in checks:
        try:
            ok = bool(fn())
        except Exception:
            ok = False
        if not ok:
            t1.append((pid, f'check FAILED: {name}'))


def run_gotcha(pid, code, expected, label):
    buf = io.StringIO()
    try:
        with contextlib.redirect_stdout(buf):
            exec(compile(code, '<gotcha>', 'exec'), {})
        out = buf.getvalue().rstrip('\n')
    except Exception:
        t1.append((pid, f'{label} raised: ' + traceback.format_exc().strip().splitlines()[-1]))
        return
    if out != (expected or '').rstrip('\n'):
        t1.append((pid, f'{label} output mismatch: got {out!r}, expected {expected!r}'))


def lesson_len(p):
    return len(((p.get('glassBox') or {}).get('lesson')) or '')


def audit():
    raw = subprocess.run(['node', 'scripts/_extract_problems.mjs'], capture_output=True, text=True)
    if raw.returncode != 0:
        print('EXTRACT FAILED (run from repo root):\n' + raw.stderr)
        sys.exit(1)
    data = json.loads(raw.stdout)

    all_ids = set()
    titles, sols = {}, {}

    for bank in ('gotchas', 'python', 'pandas', 'idioms', 'oop'):
        groups = set(data[bank]['groups'])
        for p in data[bank]['problems']:
            pid = p.get('id', '<no-id>')
            if pid in all_ids:
                t1.append((pid, 'duplicate id'))
            all_ids.add(pid)
            if p.get('difficulty') not in DIFFS:
                t2.append(('difficulty', pid, f"difficulty '{p.get('difficulty')}'"))

            if bank == 'gotchas':
                for f in REQUIRED_GOTCHA:
                    if p.get(f) in (None, '', []):
                        t1.append((pid, f'missing {f}'))
                if p.get('cluster') not in groups:
                    t1.append((pid, f"cluster '{p.get('cluster')}' not in CLUSTERS"))
                safety_scan(pid, p.get('code', ''))
                safety_scan(pid, (p.get('fix') or {}).get('code', ''))
                run_gotcha(pid, p.get('code', ''), p.get('actualOutput', ''), 'code')
                run_gotcha(pid, (p.get('fix') or {}).get('code', ''), (p.get('fix') or {}).get('output', ''), 'fix')
                if lesson_len(p) < 40:
                    t2.append(('lesson', pid, 'glassBox.lesson <40 chars'))
            else:
                for f in REQUIRED_TEST:
                    if p.get(f) in (None, '', []):
                        t1.append((pid, f'missing {f}'))
                if p.get('pattern') not in groups:
                    t1.append((pid, f"pattern '{p.get('pattern')}' not in PATTERNS"))
                safety_scan(pid, p.get('solution', ''))
                safety_scan(pid, p.get('testSource', ''))
                run_checks(pid, p.get('solution', ''), p.get('testSource', ''))
                if len(p.get('prompt', '')) < 40:
                    t2.append(('prompt', pid, 'prompt <40 chars'))
                if 'pass' not in p.get('starterCode', '') and '...' not in p.get('starterCode', ''):
                    t2.append(('stub', pid, 'starterCode has no stub'))
                if not p.get('hints'):
                    t2.append(('hints', pid, 'no hints[] (content depth — port PAL hintSteps/hints)'))
                if lesson_len(p) < 40:
                    t2.append(('lesson', pid, 'glassBox.lesson <40 chars'))
                titles.setdefault(p.get('title'), []).append(pid)
                sols.setdefault(p.get('solution'), []).append(pid)

    for title, ids in titles.items():
        if len(ids) > 1:
            t2.append(('dup-title', ids[1], f'duplicate title "{title}" with {ids[0]}'))
    for s, ids in sols.items():
        if len(ids) > 1:
            t2.append(('dup-solution', ids[1], f'duplicate solution with {ids[0]}'))

    print(f'=== PL PROBLEM AUDIT === {len(all_ids)} problems')
    print(f'Tier 1 (block commit): {len(t1)}')
    for pid, m in t1:
        print('  T1 FAIL', pid, '::', m)
    cats = Counter(c for c, _, _ in t2)
    print(f'Tier 2 (warn): {len(t2)}  ' + (', '.join(f'{k}={v}' for k, v in cats.items()) if t2 else ''))
    for c, pid, m in [x for x in t2 if x[0] != 'hints'][:30]:
        print('  T2 WARN', pid, '::', m)
    if cats.get('hints'):
        print(f'  T2 WARN (hints): {cats["hints"]} problems have no hints[] — the next content pass.')
    sys.exit(1 if t1 else 0)


if __name__ == '__main__':
    audit()
