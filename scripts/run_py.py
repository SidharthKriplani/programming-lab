"""run_py — PyLab authoring tool (PYLAB-BUILD-SPEC §6.4). Run a problem's solution (or a
method) against its fixture and print the output; --diverge A B runs two methods and reports
whether they diverge. Author debriefs from REAL output; prove a trap diverges before writing it.
  python3 scripts/run_py.py out.json <problem_id>
  python3 scripts/run_py.py out.json <problem_id> --method <method_id>
  python3 scripts/run_py.py out.json <problem_id> --diverge <idA> <idB>
"""
import sys
from _pylab_harness import load, run_solution, run_method
from pl_compare import pl_compare


def find(problems, pid):
    for p in problems:
        if p['id'] == pid:
            return p
    raise SystemExit('no problem ' + pid)


def method(p, mid):
    for m in p.get('methods', []):
        if m['id'] == mid:
            return m
    raise SystemExit('no method ' + mid + ' in ' + p['id'])


def main(argv):
    path, pid = argv[0], argv[1]
    problems, fixtures = load(path)
    p = find(problems, pid)
    if '--diverge' in argv:
        i = argv.index('--diverge')
        a, b = argv[i + 1], argv[i + 2]
        oa = run_method(p, method(p, a), fixtures)
        ob = run_method(p, method(p, b), fixtures)
        ok, msg = pl_compare(oa, ob, p.get('compare', {}))
        print('=== ' + a + ' ===\n' + str(oa) + '\n\n=== ' + b + ' ===\n' + str(ob))
        print('\nDIVERGE: ' + ('NO (identical)' if ok else 'YES (' + msg + ')'))
        return 0
    if '--method' in argv:
        mid = argv[argv.index('--method') + 1]
        out = run_method(p, method(p, mid), fixtures)
    else:
        out = run_solution(p, fixtures)
    print(out)
    return 0


if __name__ == '__main__':
    sys.exit(main(sys.argv[1:]))
