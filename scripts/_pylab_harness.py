"""_pylab_harness — shared runner for the PyLab gates. Builds a fresh fixture per run
(no leakage between solution and methods), runs solve(...), and AST-sandboxes code.

Convention: `solution` is a full `def solve(...)`; a method's `code` is the solve BODY
(ending in a return) and is wrapped into a function before running."""
import ast
import json

BANNED_CALLS = {'open', 'eval', 'exec', 'compile', 'input', 'breakpoint', '__import__'}
BANNED_IMPORTS = {'os', 'sys', 'subprocess', 'socket', 'shutil', 'requests',
                  'urllib', 'pathlib', 'glob', 'pickle', 'multiprocessing'}


def load(path):
    with open(path) as f:
        data = json.load(f)
    return data['problems'], data['fixtures']


def safety_check(code):
    """code must be parseable (a full def or a wrapped function). Returns list of issues."""
    try:
        tree = ast.parse(code)
    except SyntaxError as exc:
        return ['syntax: ' + str(exc)]
    issues = []
    for node in ast.walk(tree):
        if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id in BANNED_CALLS:
            issues.append('banned call: ' + node.func.id)
        if isinstance(node, ast.Import):
            for n in node.names:
                if n.name.split('.')[0] in BANNED_IMPORTS:
                    issues.append('banned import: ' + n.name)
        if isinstance(node, ast.ImportFrom):
            if (node.module or '').split('.')[0] in BANNED_IMPORTS:
                issues.append('banned import: ' + str(node.module))
    return issues


def _fresh(fixture):
    ns = {}
    exec(fixture['setup'], ns)
    args = [ns[a] for a in fixture['args']]
    return ns, args


def _indent(code, n=4):
    pad = ' ' * n
    return '\n'.join((pad + line if line else line) for line in code.split('\n'))


def wrap_method(problem, method, fixtures):
    """Build the full `def solve(...)` source for a method body."""
    fx = fixtures[problem['fixtureId']]
    sig = ', '.join(fx['args'])
    return 'def solve(' + sig + '):\n' + _indent(method['code'])


def run_solution(problem, fixtures):
    fx = fixtures[problem['fixtureId']]
    ns, args = _fresh(fx)
    exec(problem['solution'], ns)
    return ns['solve'](*args)


def run_method(problem, method, fixtures):
    fx = fixtures[problem['fixtureId']]
    ns, args = _fresh(fx)
    exec(wrap_method(problem, method, fixtures), ns)
    return ns['solve'](*args)
