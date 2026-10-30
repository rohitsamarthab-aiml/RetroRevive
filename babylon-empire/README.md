# RetroRevive: Rise of the Babylonian Empire

A browser-based 3D Babylonian kingdom-building strategy game with an integrated
gaming website. Built with **Next.js 15 + React 19 + React Three Fiber + TypeScript**.

> ⚠️ **Status: work in progress on this feature branch.** The simulation layer and
> project scaffold are complete and unit-tested. The 3D world, website pages, and
> auth are being added in subsequent commits on this branch.

## Tech Stack

| Layer | Technology |
|---|---|
| 3D rendering | Three.js via React Three Fiber + drei |
| Game simulation | Pure TypeScript (deterministic seeded RNG, zero render deps) |
| State | Zustand |
| Website | Next.js 15 App Router, React 19, Tailwind CSS 4 |
| Backend | Next.js API routes (auth, saves) — bcryptjs password hashing, JWT (jose) |
| Tests | Vitest (simulation), Playwright planned for frontend E2E |

## Quick Start (Windows 11 / PowerShell)

```powershell
git clone https://github.com/rohitsamarthab-aiml/RetroRevive.git
cd RetroRevive
git checkout feature/babylon-empire
cd babylon-empire

npm install
npm run dev
# Open http://localhost:3000
```

## Run Tests

```powershell
npm test        # simulation unit tests (Vitest)
```

## Project Structure

```
babylon-empire/
├── src/
│   ├── sim/          # Deterministic game simulation (types, rng, buildings,
│   │                 #   events, engine, advisor) — no rendering deps
│   ├── app/          # Next.js pages & API routes
│   ├── components/   # React components (3D world, UI panels)
│   └── lib/          # Auth, db helpers
├── tests/            # Vitest tests
├── public/           # Static assets
└── package.json
```

## Design Notes

- The simulation layer is fully deterministic (seeded RNG): the same seed and the
  same sequence of decrees always produce the same outcome — this makes testing
  and cloud save reconciliation reliable.
- The AI Royal Advisor is **read-only**: it analyzes the game state and returns
  recommendations; it never mutates game state.
- Original RetroRevive (Python/Pygame) code on `main` / other branches is
  untouched; this is a separate new game in the `babylon-empire/` directory.

## License

MIT (game code). Classic Hammurabi rules derive from public 1978 educational
computer literature; this implementation is an original redesign.
