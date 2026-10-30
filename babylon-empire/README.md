# RetroRevive — Rise of the Babylonian Empire (`babylon-empire/`)

A browser-based 3D Babylonian kingdom-building strategy game with an integrated
gaming website. **This directory is a self-contained Next.js project** living on
the `feature/babylon-empire` branch of this repository. The original Python game
at the repository root is untouched.

**Honest status:** the simulation engine, 3D world, HUD, website pages, auth and
saves below are real implementations, written to run. They have **not** been
executed in an automated test environment yet — run `npm install && npm test`
and `npm run dev` on your machine and report any errors; fixes will follow.

## Tech Stack

| Layer | Technology |
|---|---|
| 3D rendering | Three.js via React Three Fiber + drei |
| Game simulation | Pure TypeScript, deterministic seeded RNG (mulberry32), zero render deps |
| State | Zustand |
| Website | Next.js 15 App Router, React 19, Tailwind CSS 4 |
| Backend | Next.js API routes; bcryptjs password hashing; JWT sessions (jose) |
| Storage | JSON file store in `.data/` (zero-config; swap for Prisma/SQLite later) |
| Tests | Vitest (simulation) |

## Quick Start (Windows 11, PowerShell)

```powershell
git clone https://github.com/rohitsamarthab-aiml/RetroRevive.git
cd RetroRevive
git checkout feature/babylon-empire
cd babylon-empire

npm install
npm run dev
```

Open **http://localhost:3000** — the landing page plays the cinematic; click
**Play Now** to enter the 3D world.

## Run Tests

```powershell
npm test
```

Runs the deterministic-simulation suite (11 tests): reproducibility, seasons,
starvation deposition, decree validation, save/load roundtrip, construction
timers, advisor read-only guarantee, upgrades, weather influence, RNG stability.

## Controls

| Input | Action |
|---|---|
| Mouse drag | Rotate camera |
| Scroll wheel | Zoom |
| Right-drag | Pan |
| Build tab → pick building → click ground | Place building (queued into the decree) |
| Decree tab → set values → Enact Decree | Advance one season |
| Building click | Select; Upgrade button appears in Build tab |
| HUD tabs | Decree / Build / Advisor / Chronicle |
| Save / Load buttons | Local browser save (cloud saves via login) |

## Gameplay

- Each turn = one **season**; four seasons per year.
- Feed your people (5 grain per citizen per season) or face starvation —
  lose more than 45% of the population in one season and you are deposed.
- Plant plots (1 grain seed per plot; harvest scales with farms, farmers and weather).
- Rain boosts harvests (+25%); drought cuts them by half or worse; floods damage farms.
- Build: farms, houses (housing → immigration), granaries, markets (gold),
  wells (health), barracks/watchtowers/walls (defense), the ziggurat (happiness).
- Recruit soldiers (2 gold upkeep each per season).
- The **Royal Advisor** tab gives read-only strategic counsel based on real state.

## Project Structure

```
babylon-empire/
├── src/
│   ├── sim/            # Deterministic simulation (rng, types, buildings,
│   │                   #   events, engine, advisor) — no rendering deps
│   ├── state/          # Zustand store bridging sim ↔ UI ↔ 3D
│   ├── components/
│   │   ├── three/      # R3F scene: terrain, river, sky, particles,
│   │   │               #   ziggurat, palace, buildings, villagers
│   │   └── ui/         # HUD panels
│   ├── app/            # Next.js pages (landing, play, login, membership)
│   │   └── api/        # auth + saves routes
│   └── lib/            # auth (bcrypt/JWT), JSON file db
├── tests/sim.test.ts
└── package.json
```

## Known Limitations (honest list)

- 3D buildings/characters are stylized procedural primitives — a Blender GLB
  pipeline for rigged characters is the next art milestone.
- Cloud saves use a JSON file store — fine for local play; use Postgres for prod.
- Payment tiers are display-only; no provider is connected (nothing charges you).
- The advisor is a rule-based system (no external AI API is wired; the advisor
  interface is ready for a provider later).
- Playwright E2E coverage is planned; simulation logic is covered by Vitest.

## License

MIT for this code. Classic Hammurabi rules derive from public 1978 educational
computer literature; this implementation is an original redesign with original
assets.
