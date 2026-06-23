"""pl_compare — the PyLab typed comparator (the grading contract, PYLAB-BUILD-SPEC §3).

Compares a candidate output against the canonical solution's output, dispatching on
type: DataFrame -> assert_frame_equal, Series -> assert_series_equal, ndarray -> allclose,
float -> isclose, list/tuple -> elementwise, set/dict/other -> equality.

Returns (ok: bool, msg: str). Used by the gates (CPython) AND mirrored into the Pyodide
runtime (src/components/ide/pyodideRuntime.js -> PL_COMPARE_SRC). Keep the two in sync.

cfg (per-problem 'compare' field), all optional:
  kind        : 'frame'|'series'|'array'|'float'|'seq'|'value'  (inferred from expected if absent)
  checkDtype  : bool (default True)   — frame/series
  checkLike   : bool (default True)   — frame: ignore COLUMN order (match by name)
  ignoreIndex : bool (default True)   — frame/series: reset_index(drop=True) before compare
  checkNames  : bool (default False)  — series name
  float       : bool (default True)   — array: allclose vs array_equal
  rtol, atol  : floats                — array/float tolerance
  unordered   : bool (default False)  — seq: compare as a sorted multiset
"""
import math


def pl_compare(expected, got, cfg=None):
    cfg = cfg or {}
    import pandas as pd
    import numpy as np

    kind = cfg.get('kind')
    if kind is None:
        if isinstance(expected, pd.DataFrame):
            kind = 'frame'
        elif isinstance(expected, pd.Series):
            kind = 'series'
        elif isinstance(expected, np.ndarray):
            kind = 'array'
        elif isinstance(expected, float):
            kind = 'float'
        elif isinstance(expected, (list, tuple)):
            kind = 'seq'
        else:
            kind = 'value'

    try:
        if kind == 'frame':
            if not isinstance(got, pd.DataFrame):
                return False, 'expected a DataFrame, got ' + type(got).__name__
            e, g = expected, got
            if cfg.get('ignoreIndex', True):
                e = e.reset_index(drop=True)
                g = g.reset_index(drop=True)
            pd.testing.assert_frame_equal(
                g, e,
                check_dtype=cfg.get('checkDtype', True),
                check_like=cfg.get('checkLike', True),
            )
            return True, 'ok'

        if kind == 'series':
            if not isinstance(got, pd.Series):
                return False, 'expected a Series, got ' + type(got).__name__
            e, g = expected, got
            if cfg.get('ignoreIndex', True):
                e = e.reset_index(drop=True)
                g = g.reset_index(drop=True)
            pd.testing.assert_series_equal(
                g, e,
                check_dtype=cfg.get('checkDtype', True),
                check_names=cfg.get('checkNames', False),
            )
            return True, 'ok'

        if kind == 'array':
            ge = np.asarray(expected)
            gg = np.asarray(got)
            if gg.shape != ge.shape:
                return False, 'array shape differs: ' + str(gg.shape) + ' vs ' + str(ge.shape)
            if cfg.get('float', True):
                np.testing.assert_allclose(gg, ge, rtol=cfg.get('rtol', 1e-7), atol=cfg.get('atol', 0.0))
            else:
                if not np.array_equal(gg, ge):
                    return False, 'arrays differ'
            return True, 'ok'

        if kind == 'float':
            if not math.isclose(float(got), float(expected), rel_tol=cfg.get('rtol', 1e-9), abs_tol=cfg.get('atol', 0.0)):
                return False, 'floats differ: ' + repr(got) + ' vs ' + repr(expected)
            return True, 'ok'

        if kind == 'seq':
            le, lg = list(expected), list(got)
            if cfg.get('unordered', False):
                try:
                    le, lg = sorted(le), sorted(lg)
                except TypeError:
                    pass
            if le != lg:
                return False, 'sequences differ'
            return True, 'ok'

        # 'value' — set / dict / scalar / anything with ==
        if expected != got:
            return False, 'values differ: ' + repr(got)[:120] + ' vs ' + repr(expected)[:120]
        return True, 'ok'

    except AssertionError as exc:
        first = str(exc).strip().split('\n')[0]
        return False, first[:200]
    except Exception as exc:  # noqa: BLE001
        return False, type(exc).__name__ + ': ' + str(exc)[:160]
