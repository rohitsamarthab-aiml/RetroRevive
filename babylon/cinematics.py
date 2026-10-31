"""RetroRevive: The Living Empire -- cinematic director.

Real-time, engine-rendered cinematic sequences (NOT pre-rendered video and
NOT AI-generated video). Every sequence is a deterministic keyframe timeline
that a renderer (pygame-ce today) plays back smoothly with interpolated
camera positions, and every sequence can be *justified by real game state*.

These are honest cinematics: they are labelled as engine animations, they
never pretend to be generated video, and the state-driven ones refuse to
play when the game state does not justify them.
"""
from __future__ import annotations

from dataclasses import dataclass, field

# Camera keyframe: (t, x, y, z, look_x, look_y, look_z)
# Coordinate convention: x = east, y = up, z = north. Units are metres.

@dataclass
class CameraKey:
    t: float          # 0..1 normalised sequence time
    pos: tuple        # (x, y, z)
    look: tuple       # (x, y, z)

    def at(self, t: float) -> tuple:
        """Smooth-interpolated camera transform at normalised time t."""
        t = max(0.0, min(1.0, t))
        keys = self._sorted_keys()
        if t <= keys[0].t:
            return keys[0].pos, keys[0].look
        if t >= keys[-1].t:
            return keys[-1].pos, keys[-1].look
        for a, b in zip(keys, keys[1:]):
            if a.t <= t <= b.t:
                u = (t - a.t) / (b.t - a.t) if b.t > a.t else 0.0
                u = u * u * (3 - 2 * u)  # smoothstep easing
                pos = tuple(a.pos[i] + (b.pos[i] - a.pos[i]) * u for i in range(3))
                look = tuple(a.look[i] + (b.look[i] - a.look[i]) * u for i in range(3))
                return pos, look
        return keys[-1].pos, keys[-1].look

    def _sorted_keys(self) -> list:
        return sorted(self._keys, key=lambda k: k.t)

    _keys: list = field(default_factory=list, repr=False)


def _camera(*keys) -> CameraKey:
    cam = CameraKey(t=0, pos=(0, 0, 0), look=(0, 0, 0))
    cam._keys = [CameraKey(t=k[0], pos=k[1:4], look=k[4:7]) for k in keys]
    return cam


@dataclass
class Cinematic:
    id: str
    title: str
    duration_seconds: float
    camera: CameraKey
    state_driven: bool            # True = requires justification from game state
    justification: str = ""       # which state facts must be true to play
    letterbox: bool = True


# --- Fixed (always-available) cinematics ------------------------------------

OPENING_FLIGHT = Cinematic(
    id="opening_flight",
    title="Dawn Over Babylon",
    duration_seconds=14.0,
    state_driven=False,
    camera=_camera(
        (0.00, 40, 220, -320, 0, 60, 0),      # far approach over the desert
        (0.35, 80, 140, -140, 0, 70, 40),     # sweep past the river bend
        (0.70, 40, 110, 60, 0, 80, 80),       # rise along the processional way
        (1.00, 0, 70, 140, 0, 90, 220),       # settle facing the ziggurat
    ),
)

PALACE_INTRO = Cinematic(
    id="palace_intro",
    title="The Audience of Hammurabi",
    duration_seconds=10.0,
    state_driven=False,
    camera=_camera(
        (0.00, 0, 12, -60, 0, 14, 0),         # push through the gate colonnade
        (0.45, 0, 10, -18, 0, 12, 10),        # approach the throne dais
        (1.00, 6, 8, 4, 0, 10, 14),           # arc onto the king and advisors
    ),
)

# --- State-driven cinematics (played only when justified) --------------------

HARVEST = Cinematic(
    id="harvest",
    title="The Golden Harvest",
    duration_seconds=8.0,
    state_driven=True,
    justification="planted_acres > 0 and harvested == True",
    camera=_camera(
        (0.00, -90, 18, -120, 0, 4, -40),     # low over the barley rows
        (0.50, 0, 22, -90, 20, 5, -20),       # pan across reapers and ox-carts
        (1.00, 60, 26, -60, 0, 6, -120),      # pull back over laden granaries
    ),
)

DROUGHT = Cinematic(
    id="drought",
    title="The River Fails",
    duration_seconds=9.0,
    state_driven=True,
    justification="drought event present in chronicle",
    camera=_camera(
        (0.00, 120, 30, -160, 0, 2, 0),       # heat-hazed approach to the channel
        (0.55, 40, 10, -70, -10, 2, 20),      # skim cracked irrigation beds
        (1.00, 0, 16, 0, 0, 10, -80),         # turn toward the silent fields
    ),
)

CELEBRATION = Cinematic(
    id="celebration",
    title="Babylon Rejoices",
    duration_seconds=8.0,
    state_driven=True,
    justification="surplus >= 1.5x need and harvest succeeded, no famine",
    camera=_camera(
        (0.00, 0, 14, 40, 0, 6, 0),           # descend into the processional way
        (0.50, -30, 10, 10, 20, 5, -10),      # sweep through the festival crowd
        (1.00, 0, 40, -60, 0, 40, 60),        # rise over banners and lamplight
    ),
)

REGISTRY = {c.id: c for c in
            (OPENING_FLIGHT, PALACE_INTRO, HARVEST, DROUGHT, CELEBRATION)}


def justifies(cinematic: Cinematic, snapshot: dict) -> bool:
    """Return True only if real game state justifies a state-driven cinematic."""
    if not cinematic.state_driven:
        return True
    harvested = bool(snapshot.get("harvested", False))
    planted = int(snapshot.get("planted_acres", snapshot.get("acres_planted", 0)) or 0)
    population = int(snapshot.get("population", 0) or 0)
    bushels = int(snapshot.get("bushels", 0) or 0)
    chronicle = " ".join(str(e) for e in (snapshot.get("events") or [])).lower()
    starved = int(snapshot.get("starving", snapshot.get("starved", 0)) or 0)
    if cinematic.id == "harvest":
        return harvested and planted > 0
    if cinematic.id == "drought":
        return "drought" in chronicle
    if cinematic.id == "celebration":
        need = population * 20
        return (harvested and not starved
                and need > 0 and bushels >= 1.5 * need)
    return False