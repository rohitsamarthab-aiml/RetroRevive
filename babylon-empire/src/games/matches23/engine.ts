// 23 Matches — faithful TypeScript port of the Python engine (games/23_matches/engine.py).
// Misère Nim: take 1-3 matches; taking the LAST match LOSES.
// Two AI modes mirror the registry: "classic" (Albrecht-style heuristics)
// and "master" (optimal modular play: leave a multiple of 4; else take to reach one).

export type Mode = "classic" | "master";

export interface MatchState {
  remaining: number;
  mode: Mode;
  playerTook: number | null;
  aiTook: number | null;
  winner: "player" | "ai" | null;
  gameOver: boolean;
  history: Array<{ player: number | null; ai: number | null; remaining: number }>;
}

export function newMatch(mode: Mode): MatchState {
  return {
    remaining: 23,
    mode,
    playerTook: null,
    aiTook: null,
    winner: null,
    gameOver: false,
    history: [],
  };
}

// AI move: master = optimal modular strategy; classic = heuristic mimicry.
export function aiMove(state: MatchState): number {
  const r = state.remaining;
  if (r <= 1) return 1;
  if (state.mode === "master") {
    // Losing positions for the mover: 1 mod 4. Force opponent into them.
    const target = (r - 1) % 4;
    if (target >= 1 && target <= 3) return target;
    return 1 + ((r - 1) % 4 === 0 ? 2 : 0); // fallback when already in bad spot
  }
  // classic: Albrecht-like — try to leave multiple of 4, else semi-random small take
  const mod = r % 4;
  if (mod === 0) return 3;
  if (mod === 2) return 1;
  if (mod === 3) return 2;
  return 1; // mod === 1: bad spot, take 1 and hope
}

export function playerTake(state: MatchState, n: number): MatchState {
  const s: MatchState = JSON.parse(JSON.stringify(state));
  if (s.gameOver) return s;
  const take = Math.max(1, Math.min(3, n, s.remaining));
  s.remaining -= take;
  s.playerTook = take;
  if (s.remaining === 0) {
    s.gameOver = true;
    s.winner = "ai"; // player took the last match — player LOSES
    s.history.push({ player: take, ai: null, remaining: 0 });
    return s;
  }
  s.history.push({ player: take, ai: null, remaining: s.remaining });
  // AI turn
  const aiTake = Math.max(1, Math.min(3, aiMove(s), s.remaining));
  s.remaining -= aiTake;
  s.aiTook = aiTake;
  if (s.remaining === 0) {
    s.gameOver = true;
    s.winner = "player"; // AI took the last match — AI LOSES
  }
  s.history.push({ player: null, ai: aiTake, remaining: s.remaining });
  return s;
}