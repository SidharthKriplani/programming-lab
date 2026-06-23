"""audit_py — PyLab mechanical gate (PYLAB-BUILD-SPEC §6.1).
Tier-1 (BLOCKS commit): every solution AST-passes the sandbox, runs against its fixture,
and returns a non-None DataFrame/Series/ndarray/value. Tier-2 (warns): hints>=2, debrief
present, estimatedMin sane. Usage: node scripts/_extract_pylab.mjs out.json && python3 scripts/audit_py.py out.json
"""
import sys
import pandas as pd
import numpy as np
from _pylab_harness import load, safety_check, run_solution, wrap_method

ALLOWED_OUT = (pd.DataFrame, pd.Series, np.ndarray, int, float, str, bool, list, tuple, set, dict)


def main(path):
    problems, fixtures = load(path)
    t1, t2 = [], []
    for p in problems:
        pid = p['id']
        # safety — solution (full def) + every method (wrapped)
        for issue in safety_check(p['solution']):
            t1.append(pid + ' :: solution ' + issue)
        for m in p.get('methods', []):
            for issue in safety_check(wrap_method(p, m, fixtures)):
                t1.append(pid + ' :: method ' + m['id'] + ' ' + issue)
        if p['fixtureId'] not in fixtures:
            t1.append(pid + ' :: unknown fixtureId ' + p['fixtureId'])
            continue
        # run the solution
        try:
            out = run_solution(p, fixtures)
        except Exception as exc:  # noqa: BLE001
            t1.append(pid + ' :: solution raised ' + type(exc).__name__ + ': ' + str(exc)[:120])
            continue
        if out is None or not isinstance(out, ALLOWED_OUT):
            t1.append(pid + ' :: solution returned ' + type(out).__name__ + ' (expected df/series/array/value)')
        # tier-2 soft checks
        if len(p.get('hints', [])) < 2:
            t2.append(pid + ' :: <2 hints')
        if not p.get('debrief'):
            t2.append(pid + ' :: missing debrief')
        em = p.get('estimatedMin', 0)
        if not (2 <= em <= 25):
            t2.append(pid + ' :: estimatedMin ' + str(em) + ' out of 2-25')

    print('PyLab audit: ' + str(len(problems)) + ' problems')
    print('Tier 1 (BLOCKS): ' + str(len(t1)))
    for f in t1:
        print('  T1 FAIL ' + f)
    print('Tier 2 (warn): ' + str(len(t2)))
    for f in t2:
        print('  T2 ' + f)
    return 1 if t1 else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else 'pylab_extract.json'))
