"""verify_py_methods — PyLab judgment-layer harness (PYLAB-BUILD-SPEC §6.3).
For every problem with methods[]: run each method; assert NON-TRAP methods produce output
identical to the solution (via pl_compare with the problem's `compare` cfg), TRAP methods
RUN AND DIVERGE, canonicalMethodId resolves to a non-trap matching method, and every MCQ
option/answerId references a real method id. BLOCKS on any failure.
Usage: python3 scripts/verify_py_methods.py out.json
"""
import sys
from _pylab_harness import load, run_solution, run_method
from pl_compare import pl_compare


def main(path):
    problems, fixtures = load(path)
    fails = []
    n_layered = 0
    for p in problems:
        methods = p.get('methods', [])
        if not methods:
            continue
        pid = p['id']
        cfg = p.get('compare', {})
        try:
            canon = run_solution(p, fixtures)
        except Exception as exc:  # noqa: BLE001
            fails.append(pid + ' :: solution raised ' + type(exc).__name__)
            continue
        ids = set()
        canonical_ok = False
        has_trap = methods != [] and any(m.get('isTrap') for m in methods)
        multi = len(methods) >= 2
        if multi:
            n_layered += 1
        for m in methods:
            mid = m['id']
            ids.add(mid)
            is_trap = bool(m.get('isTrap'))
            try:
                out = run_method(p, m, fixtures)
            except Exception as exc:  # noqa: BLE001
                # a trap must RUN; a runtime error is not a "runs-but-wrong" trap
                fails.append(pid + ' :: method ' + mid + ' raised ' + type(exc).__name__ + ': ' + str(exc)[:90])
                continue
            ok, msg = pl_compare(canon, out, cfg)
            if is_trap:
                if ok:
                    fails.append(pid + ' :: TRAP ' + mid + ' matches the solution (must diverge)')
            else:
                if not ok:
                    fails.append(pid + ' :: method ' + mid + ' diverges from solution but is not a trap (' + msg + ')')
                if mid == p.get('canonicalMethodId'):
                    canonical_ok = True
        # canonicalMethodId resolves to a real non-trap method that matches
        cmi = p.get('canonicalMethodId')
        if cmi is None or cmi not in ids:
            fails.append(pid + ' :: canonicalMethodId ' + str(cmi) + ' is not a real method id')
        elif not canonical_ok:
            fails.append(pid + ' :: canonicalMethodId ' + str(cmi) + ' did not match the solution output')
        # a layered (multi-method) problem must carry at least one trap (the differentiator)
        if multi and not has_trap:
            fails.append(pid + ' :: multi-method but no isTrap (a fork without a trap is incomplete)')
        # mcq ids must reference real methods
        for q in p.get('mcqs', []):
            for opt in q.get('options', []):
                if opt not in ids:
                    fails.append(pid + ' :: mcq ' + q['id'] + ' option ' + opt + ' is not a method id')
            if q.get('answerId') not in ids:
                fails.append(pid + ' :: mcq ' + q['id'] + ' answerId ' + str(q.get('answerId')) + ' is not a method id')

    print('PyLab method-verify: ' + str(len(problems)) + ' problems, ' + str(n_layered) + ' multi-method')
    print('Failures: ' + str(len(fails)))
    for f in fails:
        print('  FAIL ' + f)
    return 1 if fails else 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else 'pylab_extract.json'))
