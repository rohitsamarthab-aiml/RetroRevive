# Babylonian Kingdom 3D Transformation — Engineering Plan

**Date:** 2026-10-31
**Branch:** `feature/babylon-empire`
**Status:** Phase 0 (decision + launch infrastructure) — committed

## 1. Verified starting state (audited before any work)

| Item | Status |
|---|---|
| pygame-ce migration in `requirements-ui.txt` | ✅ Already committed (`7037efab`) — `pygame-ce>=2.5.8` |
| README install/verification docs | ✅ Already updated (`47331eb1`) |
| `docs/python314-migration.md` | ✅ Already present (`f445f113`) |
| Python application code | ✅ Untouched — engines are stdlib-only |
| Existing tests | 92 (26+7+27+16+16); count to be re-verified by actual run, not assumed |
| Unpushed local changes | Not detectable from GitHub side — developer must run `git status` locally before pulling |

## 2. Technology decision (evidence-based, Python 3.14)

**Evaluated 2026-10-31:**

- **pygame-ce 2.5.8** — wheels confirmed for CPython 3.10–3.15. **Verified safe.** Already the project dependency. Imports as `import pygame`.
- **Ursina 8.x** — wraps Panda3D; `requires_python >= 3.12`; depends on `panda3d>=1.10.15`. Ursina itself is plausibly installable on 3.14, but the **underlying Panda3D cp314 Windows wheels could not be confirmed** from the PyPI index (listing too large to verify definitively this session).
- **Panda3D directly** — same cp314 wheel uncertainty; last SDK release 1.10.16 predates Python 3.14.

**Decision:**

1. **Primary path (committed):** Premium 2.5D/isometric presentation on the verified pygame-ce stack, extending the existing `ui_world.py` / `ui_characters.py` / `ui_districts.py` / `ui_cinematics.py` architecture, driven by the untouched Hammurabi engine. This is genuinely achievable, matches the existing code design, and preserves all gameplay.
2. **Optional 3D probe (Phase R, only after local verification):** one disposable venv attempt of `pip install panda3d` on Python 3.14. If cp314 Windows wheels install and import cleanly, a Panda3D 3D renderer becomes a Phase-2 workstream. If pip tries to compile from source, the probe fails fast and 2.5D remains the plan. **No 3D claims will be made unless it actually runs.**

## 3. Phase plan

| Phase | Deliverable | Depends on |
|---|---|---|
| 0 | Decision doc, `setup.bat`, `RUN_RETROREVIVE.bat` | — (committed now) |
| 1 | Local verification: setup.bat run, 92-test suite, `verify_ui.py`, screenshots | Developer runs on laptop; fixes loop with me |
| 2 | World presentation upgrade: layered isometric kingdom scene (palace, city, farms, river, walls) with parallax depth, dynamic sky/day-night tinting, weather overlays | Phase 1 green |
| 3 | Character animation system: sprite-sheet-driven king, soldiers, farmers, citizens, advisors with walk/work/idle cycles; population-proportional agent counts | Phase 2 |
| 4 | Gameplay↔world coupling: decree actions visibly change field activity, construction progress renders, disasters alter scene state; all driven by real engine state | Phase 3 |
| 5 | Cinematics: opening camera flight, area transitions, event sequences (drought/famine/prosperity/celebration) using the existing cinematics module | Phase 4 |
| 6 | UI premium pass: navy/gold/bronze theme, dashboards, missions, achievements, settings with Low/Med/High quality | Phase 4 |
| 7 | Audio: ambient loops, event sounds, volume controls (existing `ui_theme.py` audio base) | Any |
| 8 | QA + packaging: full test run, `RetroRevive_Final.zip` build script, optional PyInstaller exe (only if it works cleanly) | Phases 1–7 |
| R | Panda3D 3D probe (optional, separate venv, no impact on main venv) | Phase 1 |

## 4. Hard constraints (from project rules)

- Original Hammurabi rules are the source of truth; no rule changes without documented, independently computed justification.
- No fake buttons, mockups-as-gameplay, or fabricated test results.
- Never install `pygame` and `pygame-ce` in the same venv.
- No commits to `main` without authorization; no force-push.
- Visuals must reflect real game state — no cosmetic-only animations that lie about state.

## 5. Immediate next actions

1. **Developer (laptop):** double-click `setup.bat`, then `RUN_RETROREVIVE.bat`; run the test suite; report output.
2. **Ashna (next session):** begin Phase 2 implementation on the confirmed-green base.
