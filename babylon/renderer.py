"""RetroRevive: The Living Empire -- pygame-ce living-world renderer.

Renders a SceneState (from babylon.world_state) as a layered, animated
isometric kingdom: sky/day-night gradient, distant ziggurat, palace, city
walls, fields with growth stages, river with flowing animation, and
walking agents whose counts come ONLY from real game state.

Integration contract (no existing file is modified):
    import babylon.renderer
    overlay = babylon.renderer.LivingWorld()
    overlay.set_scene(scene)          # call each year / on state change
    overlay.update(dt_seconds)        # call every frame
    overlay.draw(surface, rect)       # call after your scene render
    overlay.play("opening_flight")    # engine cinematic (justified ones only)

Quality settings: low / medium / high (agent caps, water shimmer, stars).
"""
from __future__ import annotations

import math
import random

import pygame

from babylon.cinematics import REGISTRY, justifies
from babylon.world_state import SceneState

# --- Palette (deep navy / royal gold / bronze / sandstone) -------------------

SKY_NIGHT = (12, 16, 38)
SKY_DAWN = (168, 96, 60)
SKY_DAY = (198, 168, 118)
SKY_DUSK = (150, 70, 50)
SAND = (206, 178, 128)
SAND_DARK = (168, 140, 96)
STONE = (188, 168, 140)
GOLD = (212, 175, 86)
BRONZE = (146, 102, 54)
NAVY = (24, 34, 66)
RIVER = (52, 110, 148)
CROP_YOUNG = (110, 138, 62)
CROP_RIPE = (196, 158, 60)
CROP_BARE = (150, 122, 78)
HUMAN_DARK = (70, 50, 38)
HUMAN_ROBE = (178, 148, 108)
GUARD_BRONZE = (150, 106, 52)


def _lerp(a, b, t):
    return a + (b - a) * t


def _mix(c1, c2, t):
    return tuple(int(_lerp(c1[i], c2[i], t)) for i in range(3))


class Agent:
    """A walking citizen sprite with a procedural walk cycle."""

    def __init__(self, x: float, y: float, speed: float, kind: str, seed: int):
        self.x, self.y = x, y
        self.base_y = y
        self.speed = speed
        self.kind = kind                # farmer|soldier|citizen|merchant|guard|worker
        self.phase = random.Random(seed).random() * math.tau
        self.bob = random.Random(seed + 1).random() * math.tau

    def update(self, dt: float, width: int):
        self.x += self.speed * dt
        if self.x > width + 20:
            self.x = -20
        elif self.x < -20:
            self.x = width + 20

    def draw(self, surface: int, t: float):
        swing = math.sin(self.phase + t * 6.0)
        body_y = self.base_y + math.sin(self.bob + t * 5.0) * 1.2
        colour = {
            "farmer": HUMAN_ROBE,
            "citizen": (168, 158, 132),
            "merchant": (122, 96, 62),
            "worker": (150, 130, 100),
            "soldier": GUARD_BRONZE,
            "guard": GUARD_BRONZE,
        }.get(self.kind, HUMAN_ROBE)
        # legs
        pygame.draw.line(surface, HUMAN_DARK, (self.x, body_y + 4),
                         (self.x + swing * 3, body_y + 9), 2)
        pygame.draw.line(surface, HUMAN_DARK, (self.x, body_y + 4),
                         (self.x - swing * 3, body_y + 9), 2)
        # robe / body
        pygame.draw.rect(surface, colour, (self.x - 3, body_y - 4, 6, 9))
        # head
        pygame.draw.circle(surface, HUMAN_DARK, (int(self.x), int(body_y - 7)), 3)
        if self.kind in ("soldier", "guard"):
            pygame.draw.line(surface, BRONZE, (self.x + 2, body_y - 14),
                             (self.x + 2, body_y + 2), 2)     # spear


class LivingWorld:
    """Embeddable animated kingdom overlay. Zero changes to game logic."""

    QUALITY = {"low": {"agents": 40, "shimmer": False, "stars": 0},
               "medium": {"agents": 90, "shimmer": True, "stars": 60},
               "high": {"agents": 160, "shimmer": True, "stars": 140}}

    def __init__(self, width: int = 1280, height: int = 720,
                 quality: str = "medium"):
        self.width, self.height = width, height
        self.quality = quality
        self.scene = SceneState()
        self.time = 0.0
        self.agents: list[Agent] = []
        self._agent_seed = 0
        self._cine_id: str | None = None
        self._cine_t = 0.0
        self._rng = random.Random(1758)          # Hammurabi's coronation year
        self._stars = [(self._rng.random(), self._rng.random() * 0.4,
                        self._rng.random()) for _ in range(200)]

    # -- public API ----------------------------------------------------------

    def set_scene(self, scene: SceneState) -> None:
        self.scene = scene
        self._sync_agents()

    def set_quality(self, quality: str) -> None:
        if quality in self.QUALITY:
            self.quality = quality
            self._sync_agents()

    def play(self, cinematic_id: str, snapshot: dict | None = None) -> bool:
        """Start an engine cinematic. State-driven ones need justification."""
        cine = REGISTRY.get(cinematic_id)
        if cine is None:
            return False
        if cine.state_driven and not justifies(cine, snapshot or {}):
            return False
        self._cine_id, self._cine_t = cinematic_id, 0.0
        return True

    @property
    def cinematic_active(self) -> bool:
        return self._cine_id is not None

    def update(self, dt: float) -> None:
        self.time += dt
        for agent in self.agents:
            agent.update(dt, self.width)
        if self._cine_id is not None:
            cine = REGISTRY[self._cine_id]
            self._cine_t += dt / max(0.001, cine.duration_seconds)
            if self._cine_t >= 1.0:
                self._cine_id = None

    def draw(self, surface: pygame.Surface, rect: pygame.Rect | None = None) -> None:
        rect = rect or surface.get_rect()
        self._draw_sky(surface, rect)
        self._draw_ziggurat(surface, rect)
        self._draw_walls_and_towers(surface, rect)
        self._draw_palace(surface, rect)
        self._draw_city(surface, rect)
        self._draw_fields(surface, rect)
        self._draw_river(surface, rect)
        for agent in self.agents:
            agent.draw(surface, self.time)
        if self.scene.celebration:
            self._draw_banners(surface, rect)
        if self._cine_id is not None:
            self._draw_letterbox(surface, rect)

    # -- layers ---------------------------------------------------------------

    def _day_tint(self) -> tuple:
        phase = self.scene.day_phase
        if phase < 0.2 or phase > 0.8:
            return SKY_NIGHT
        if phase < 0.3:
            return _mix(SKY_NIGHT, SKY_DAWN, (phase - 0.2) / 0.1)
        if phase < 0.7:
            return _mix(SKY_DAWN, SKY_DAY, (phase - 0.3) / 0.4)
        return _mix(SKY_DAY, SKY_DUSK, (phase - 0.7) / 0.1)

    def _draw_sky(self, surface, rect):
        sky = self._day_tint()
        horizon = int(rect.height * 0.42)
        steps = 8
        for i in range(steps):
            t = i / (steps - 1)
            colour = _mix(_mix(sky, (240, 214, 170), 0.25 * (1 - t) if self.scene.day_phase > 0.2 else 0), sky, 0)
            pygame.draw.rect(surface, colour,
                             (rect.x, rect.y + int(horizon * t / steps * 2),
                              rect.width, int(horizon / steps) + 1))
        pygame.draw.rect(surface, _mix(SAND, sky, 0.25),
                         (rect.x, rect.y + horizon, rect.width,
                          rect.height - horizon))
        if self.quality != "low" and self.scene.day_phase < 0.25:
            dim = 1.0 - min(1.0, self.scene.day_phase / 0.25)
            for sx, sy, tw in self._stars[: self.QUALITY[self.quality]["stars"]]:
                c = int(180 * dim * (0.5 + 0.5 * math.sin(self.time * 2 + tw * 9)))
                surface.set_at((rect.x + int(sx * rect.width),
                                rect.y + int(sy * horizon)), (c, c, min(255, c + 20)))

    def _draw_ziggurat(self, surface, rect):
        horizon = int(rect.height * 0.42)
        cx = rect.x + int(rect.width * 0.72)
        base_w, tier_h = int(rect.width * 0.16), int(rect.height * 0.05)
        for tier in range(4):
            w = base_w * (4 - tier) // 4
            top = horizon - (tier + 1) * tier_h - int(rect.height * 0.02)
            pygame.draw.polygon(surface, STONE if tier % 2 == 0 else _mix(STONE, SAND_DARK, 0.4),
                                [(cx - w // 2, horizon - tier * tier_h - int(rect.height * 0.02)),
                                 (cx + w // 2, horizon - tier * tier_h - int(rect.height * 0.02)),
                                 (cx + int(w * 0.32), top),
                                 (cx - int(w * 0.32), top)])
        glow = 90 + int(40 * math.sin(self.time * 1.5))
        pygame.draw.circle(surface, (glow, int(glow * 0.7), 30),
                           (cx, horizon - 5 * tier_h - int(rect.height * 0.03)), 4)

    def _draw_walls_and_towers(self, surface, rect):
        horizon = int(rect.height * 0.42)
        wall_y = horizon + int(rect.height * 0.03)
        pygame.draw.rect(surface, SAND_DARK,
                         (rect.x, wall_y, rect.width, int(rect.height * 0.035)))
        for tx in range(int(rect.width * 0.05), rect.width, int(rect.width * 0.13)):
            pygame.draw.rect(surface, SAND_DARK, (rect.x + tx, wall_y - int(rect.height * 0.05),
                                                  int(rect.width * 0.018), int(rect.height * 0.05)))
            pygame.draw.rect(surface, NAVY, (rect.x + tx + 3, wall_y - int(rect.height * 0.038),
                                             4, 4))

    def _draw_palace(self, surface, rect):
        horizon = int(rect.height * 0.42)
        px, pw = rect.x + int(rect.width * 0.1), int(rect.width * 0.2)
        ph = int(rect.height * 0.14)
        pygame.draw.rect(surface, SAND, (px, horizon - ph, pw, ph))
        pygame.draw.rect(surface, BRONZE, (px, horizon - ph, pw, 4))
        for i in range(5):
            gx = px + int(pw * (0.12 + 0.19 * i))
            pygame.draw.rect(surface, NAVY, (gx, horizon - int(ph * 0.7),
                                             int(pw * 0.06), int(ph * 0.7)))
        pygame.draw.polygon(surface, _mix(GOLD, BRONZE, 0.3),
                            [(px - 6, horizon - ph), (px + pw + 6, horizon - ph),
                             (px + pw // 2, horizon - ph - int(rect.height * 0.05))])

    def _draw_city(self, surface, rect):
        horizon = int(rect.height * 0.42)
        base_y = horizon + int(rect.height * 0.06)
        rng = random.Random(7)
        for i in range(14):
            bx = rect.x + int(rect.width * (0.08 + 0.062 * i))
            bh = int(rect.height * (0.04 + rng.random() * 0.05))
            bw = int(rect.width * 0.032)
            pygame.draw.rect(surface, _mix(SAND, SAND_DARK, rng.random() * 0.6),
                             (bx, base_y - bh, bw, bh))
            pygame.draw.rect(surface, STONE, (bx, base_y - bh, bw, 2))
            if self.scene.market_activity > 0.3 and rng.random() < self.scene.market_activity:
                pygame.draw.rect(surface, (230, 170, 60),
                                 (bx + 4, base_y - bh + 5, 4, 5))

    def _draw_fields(self, surface, rect):
        fy = int(rect.height * 0.72)
        growth = self.scene.field_growth
        base = CROP_BARE if growth <= 0.05 else (
            CROP_RIPE if growth > 0.85 else _mix(CROP_YOUNG, CROP_RIPE, growth))
        rows = 4 if self.quality == "low" else 6
        for r in range(rows):
            y = fy + r * int((rect.height * 0.22) / rows)
            step = 26 if self.quality == "low" else 16
            for x in range(rect.x + 8, rect.x + rect.width - 8, step):
                sway = math.sin(self.time * 2 + x * 0.08) * (2 if growth > 0.4 else 0)
                pygame.draw.line(surface, base, (x, y + 8), (x + sway, y), 2)
        if self.scene.harvest_activity > 0.9:
            pass  # reaper agents already in field band via _sync_agents

    def _draw_river(self, surface, rect):
        ry = int(rect.height * 0.66)
        pygame.draw.rect(surface, RIVER, (rect.x, ry, rect.width,
                                          int(rect.height * 0.045)))
        if self.QUALITY[self.quality]["shimmer"]:
            for x in range(rect.x, rect.x + rect.width, 24):
                off = int(math.sin(self.time * 2.2 + x * 0.05) * 3)
                pygame.draw.line(surface, _mix(RIVER, (220, 236, 244), 0.4),
                                 (x, ry + 6 + off), (x + 10, ry + 6 + off), 1)

    def _draw_banners(self, surface, rect):
        for i in range(8):
            bx = rect.x + int(rect.width * (0.1 + 0.11 * i))
            wave = math.sin(self.time * 3 + i) * 3
            pygame.draw.line(surface, BRONZE, (bx, int(rect.height * 0.2)),
                             (bx, int(rect.height * 0.3)))
            pygame.draw.polygon(surface, GOLD, [(bx, int(rect.height * 0.2)),
                                                (bx + 14 + wave, int(rect.height * 0.225)),
                                                (bx, int(rect.height * 0.25))])

    def _draw_letterbox(self, surface, rect):
        bar = int(rect.height * 0.09)
        pygame.draw.rect(surface, (0, 0, 0), (rect.x, rect.y, rect.width, bar))
        pygame.draw.rect(surface, (0, 0, 0),
                         (rect.x, rect.y + rect.height - bar, rect.width, bar))

    # -- agent management ------------------------------------------------------

    def _sync_agents(self) -> None:
        """(Re)spawn agents strictly according to SceneState counts."""
        cap = self.QUALITY[self.quality]["agents"]
        wanted = [
            ("farmer", self.scene.farmers),
            ("soldier", self.scene.soldiers),
            ("citizen", self.scene.citizens // 3),     # visible fraction for perf
            ("merchant", self.scene.merchants),
            ("guard", self.scene.guards),
            ("worker", self.scene.construction_workers),
        ]
        total = min(cap, sum(n for _, n in wanted))
        lanes = {"farmer": 0.78, "citizen": 0.55, "merchant": 0.52,
                 "worker": 0.62, "soldier": 0.47, "guard": 0.46}
        self.agents = []
        self._agent_seed = 0
        allocated = 0
        for kind, count in wanted:
            if count <= 0 or allocated >= total:
                break
            take = min(count, total - allocated)
            lane_y = self.height * lanes[kind]
            for i in range(take):
                self._agent_seed += 1
                speed = (6 + self._rng.random() * 10) * (1 if i % 2 else -1)
                self.agents.append(Agent(
                    x=self._rng.random() * self.width,
                    y=lane_y + self._rng.random() * 8,
                    speed=speed, kind=kind, seed=self._agent_seed))
                allocated += 1


def demo_main() -> None:
    """Standalone demo: launch the living world with a sample state.

    Run:  .venv\\Scripts\\python.exe -m babylon.renderer
    """
    pygame.init()
    screen = pygame.display.set_mode((1280, 720))
    pygame.display.set_caption("RetroRevive: The Living Empire (preview)")
    clock = pygame.time.Clock()
    world = LivingWorld(1280, 720, quality="high")

    # Sample state -- replace with modern_game_logic snapshot in production.
    scene = world_state.build_scene({
        "population": 240, "acres": 900, "planted_acres": 500,
        "bushels": 12000, "harvested": True, "soldiers": 30,
        "construction_projects": 2,
    }, day_phase=0.35)
    world.set_scene(scene)
    world.play("opening_flight")

    running = True
    while running:
        dt = clock.tick(60) / 1000.0
        for event in pygame.event.get():
            if event.type == pygame.QUIT or (
                event.type == pygame.KEYDOWN and event.key == pygame.K_ESCAPE):
                running = False
            elif event.type == pygame.KEYDOWN and event.key == pygame.K_d:
                world.play("drought", {"events": ["drought"]})
            elif event.type == pygame.KEYDOWN and event.key == pygame.K_c:
                world.play("celebration", {"population": 240, "bushels": 12000,
                                           "harvested": True})
        world.update(dt)
        world.draw(screen)
        pygame.display.flip()
    pygame.quit()


if __name__ == "__main__":
    demo_main()