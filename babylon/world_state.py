"""RetroRevive: The Living Empire -- world-state bridge.

Translates a real Hammurabi game-state snapshot into deterministic visual
scene descriptors for the living Babylonian kingdom.

Design rules (hard constraints):
- READ-ONLY: this module never mutates game state; it is a view layer.
- Deterministic: the same snapshot always produces the same scene.
- Rendering-agnostic: pure standard library, so the pygame-ce presentation
  layer, headless tests, and future renderers all consume the same output.
- Honest: the scene reflects ACTUAL game state only. No decorative
  animations that contradict the simulation.
"""
from __future__ import annotations

from dataclasses import dataclass

# ---------------------------------------------------------------------------
# Scene descriptor
# ---------------------------------------------------------------------------

@dataclass
class SceneState:
    """A complete, renderable description of the kingdom at one moment."""

    # Core economy (mirrors real game state)
    population: int = 0
    acres: int = 0
    bushels: int = 0
    planted_acres: int = 0

    # Living agents (counts derived from real state, never invented)
    farmers: int = 0
    soldiers: int = 0
    citizens: int = 0
    merchants: int = 0
    guards: int = 0
    construction_workers: int = 0
    oxen: int = 0

    # Field / economy visuals
    field_growth: float = 0.0        # 0.0 bare .. 1.0 ready to harvest
    planted_fraction: float = 0.0    # fraction of arable land in use
    harvest_activity: float = 0.0    # 0..1 (1 = harvest in progress)
    market_activity: float = 0.0     # 0..1 prosperity-driven bustle
    construction_sites: int = 0

    # Environment
    day_phase: float = 0.5           # 0=midnight, 0.5=noon, 1=next midnight
    weather: str = "clear"           # clear | hot | rain | storm | dust

    # Event reactions (True only when the engine reported the event)
    famine: bool = False
    drought: bool = False
    flood: bool = False
    plague: bool = False
    rats: bool = False
    invasion: bool = False
    celebration: bool = False
    starved_last_year: int = 0


_EVENT_FLAGS = {
    "drought": "drought",
    "flood": "flood",
    "plague": "plague",
    "rats": "rats",
    "invasion": "invasion",
    "barbarian": "invasion",
}


def _flag_events(snapshot: dict) -> dict:
    flags = {}
    events = snapshot.get("events") or snapshot.get("chronicle") or []
    for event in events:
        text = str(event).lower()
        for needle, flag in _EVENT_FLAGS.items():
            if needle in text:
                flags[flag] = True
    return flags


def build_scene(snapshot: dict, day_phase: float = 0.5) -> SceneState:
    """Map a Hammurabi game-state snapshot to a SceneState.

    ``snapshot`` keys (all optional; missing keys simply yield a quieter
    scene, never fabricated activity):
      population, acres, bushels, planted_acres (or acres_planted),
      harvested (bool), starving (int), soldiers (or military),
      construction_projects (int or list), events (list of str)
    """
    population = max(0, int(snapshot.get("population", 0) or 0))
    acres = max(0, int(snapshot.get("acres", 0) or 0))
    bushels = max(0, int(snapshot.get("bushels", 0) or 0))
    planted = max(0, int(
        snapshot.get("planted_acres", snapshot.get("acres_planted", 0)) or 0
    ))
    harvested = bool(snapshot.get("harvested", False))
    starved = max(0, int(snapshot.get("starving", snapshot.get("starved", 0)) or 0))

    scene = SceneState(
        population=population, acres=acres, bushels=bushels,
        planted_acres=planted, day_phase=max(0.0, min(1.0, day_phase)),
        starved_last_year=starved,
    )

    # --- agents -----------------------------------------------------------
    # 1 farmer tends 10 acres (Hammurabi rule); never exceed half the people.
    scene.farmers = min(population // 2, (planted + 9) // 10) if planted else 0
    # Soldiers are only shown if the enhanced mode tracks them; otherwise the
    # city watch is a small fixed fraction of the population.
    scene.soldiers = max(0, int(
        snapshot.get("soldiers", snapshot.get("military", 0)) or 0
    ))
    scene.guards = max(4, population // 50) if population else 0
    scene.citizens = max(0, population - scene.farmers - scene.soldiers)
    # Markets bustle with prosperity; starvation empties them.
    scene.merchants = 0 if starved else max(0, population // 30)
    scene.oxen = max(0, planted // 40)

    # --- fields ------------------------------------------------------------
    scene.planted_fraction = (
        min(1.0, planted / acres) if acres > 0 else 0.0
    )
    if harvested:
        scene.field_growth = 1.0
        scene.harvest_activity = 1.0 if planted > 0 else 0.0
    elif planted > 0:
        scene.field_growth = min(0.9, 0.2 + scene.planted_fraction * 0.7)
    # Construction: workers appear only for real projects.
    projects = snapshot.get("construction_projects", 0)
    if isinstance(projects, (list, tuple)):
        scene.construction_sites = len(projects)
    else:
        scene.construction_sites = max(0, int(projects or 0))
    scene.construction_workers = 3 * scene.construction_sites

    # --- economy / market --------------------------------------------------
    food_ratio = (
        bushels / (population * 20.0) if population > 0 and bushels else 0.0
    )
    scene.market_activity = 0.0 if starved else min(1.0, food_ratio * 0.6)

    # --- events & weather --------------------------------------------------
    flags = _flag_events(snapshot)
    scene.famine = starved > 0
    scene.drought = flags.get("drought", False)
    scene.flood = flags.get("flood", False)
    scene.plague = flags.get("plague", False)
    scene.rats = flags.get("rats", False)
    scene.invasion = flags.get("invasion", False)
    scene.celebration = (
        not scene.famine and food_ratio >= 1.5 and harvested
    )
    if scene.drought:
        scene.weather = "dust"
    elif scene.flood or "storm" in str(snapshot.get("weather", "")).lower():
        scene.weather = "storm" if scene.flood and day_phase < 0.3 else "rain" if scene.flood else scene.weather
    return scene