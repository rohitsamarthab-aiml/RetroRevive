# Python 3.14 + pygame-ce Migration Notes

**Date:** 2026-10-31
**Branch:** `feature/babylon-empire`

## 1. Why this migration exists

RetroRevive's graphical desktop frontend depends on pygame. The legacy
`pygame` package on PyPI (latest release 2.6.1, September 2024) publishes
binary wheels only up to **CPython 3.13**. On **Python 3.14**, `pip install
pygame` finds no matching wheel and falls back to compiling C sources against
SDL, which fails on a normal machine without a compiler toolchain and SDL
development headers.

The project target is Python 3.14 (user's installed version), so the
dependency must move to a fork that supports it.

## 2. The chosen replacement: pygame-ce

**pygame-ce** (Community Edition) is the actively maintained pygame fork
developed by former pygame core developers:

| Package | Latest release | Uploaded | Wheels through |
|---|---|---|---|
| `pygame` | 2.6.1 | 2024-09-29 | CPython 3.13 |
| `pygame-ce` | 2.5.8+ | 2026 | CPython 3.15 |

Key facts:

- pygame-ce 2.5.6 was the **first release to support Python 3.14 at launch**;
  all later releases (including the pinned minimum `>=2.5.8` in
  `requirements-ui.txt`) ship 3.14 wheels.
- pygame-ce bundles a newer SDL (2.32.x vs 2.28.4) under the hood.
- **pygame-ce still imports as `import pygame`.** Every existing module
  (`ui_pygame.py`, `ui_theme.py`, `ui_world.py`, `ui_characters.py`,
  `ui_districts.py`, `ui_cinematics.py`, `ui_auth.py`, `retrorevive.py`,
  `games/23_matches/app.py`, and the test suite) works unchanged.
- Zero application source files were modified for this migration.

## 3. Critical installation warning

`pygame` and `pygame-ce` install into the **same** `pygame/` site-packages
directory. pip does not report a conflict, and whichever is installed *last*
silently overwrites the other. Uninstalling one afterwards can leave a hollow
module behind (the classic `AttributeError: module 'pygame' has no attribute
'init'`).

Rules:

1. **Never install both in the same environment.**
2. If pygame was previously installed, run `pip uninstall pygame` **before**
   installing pygame-ce, or simply use a fresh virtual environment.
3. If a broken mixed install exists, repair with:
   `pip install --force-reinstall pygame-ce`.

## 4. Verify the install

```powershell
python -c "import pygame; print(pygame.version.ver, getattr(pygame, 'IS_CE', 0))"
# Expected output example:  2.5.8 1
```

If the output shows `IS_CE = 1`, the Community Edition fork is active.
If `IS_CE` raises `AttributeError`, the unmaintained legacy package is
installed instead.

## 5. What changed in the repository

| File | Change |
|---|---|
| `requirements-ui.txt` | `pygame==2.6.1` → `pygame-ce>=2.5.8`, with rationale comments and the co-install warning |
| `README.md` | Install section updated: fresh-venv instructions, pygame-ce rationale, verification one-liner; licensing note updated to pygame-ce |
| `docs/python314-migration.md` | This document |

Nothing else changed. All game engines (`game_logic.py`,
`modern_game_logic.py`, `games/23_matches/engine.py`) are pure standard
library and require no modification for Python 3.14.

## 6. Verification checklist (local)

```powershell
python -m venv .venv
.venv\Scripts\Activate.ps1
pip uninstall pygame            # only if pygame was installed before
pip install -r requirements-ui.txt
python -c "import pygame; print(pygame.version.ver, getattr(pygame, 'IS_CE', 0))"
python -m unittest discover -v  # expect the full 92-test suite green
.venv\Scripts\python.exe verify_ui.py
.venv\Scripts\python.exe main.py
```

**Honest status:** the unit suite (92 tests) and visual verification were
NOT re-executed as part of this dependency change — they must be run locally
per the checklist above. The engine code is untouched, so the suite is
expected to pass unchanged, but this is an expectation, not a verified result.

## 7. Known limitations

- pygame-ce 3.0 (SDL3) is planned upstream and may introduce minor breaking
  changes in the future; the pinned floor `>=2.5.8` currently resolves to the
  stable 2.5.x line. If a future upgrade breaks something, pin an exact
  working version (e.g. `pygame-ce==2.5.8`).
- Python 3.14 removed several legacy `unittest` aliases and long-deprecated
  stdlib APIs; the current test suite uses only modern APIs, but this should
  be re-confirmed by actually running the suite on 3.14.
