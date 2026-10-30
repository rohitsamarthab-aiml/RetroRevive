"use client";

import { useState } from "react";
import Link from "next/link";
import { newMatch, playerTake, type MatchState, type Mode } from "@/games/matches23/engine";

export default function Matches23Page() {
  const [state, setState] = useState<MatchState>(() => newMatch("classic"));
  const [mode, setMode] = useState<Mode>("classic");

  function restart(m: Mode = mode) {
    setMode(m);
    setState(newMatch(m));
  }

  const take = (n: number) => setState((s) => playerTake(s, n));

  return (
    <main className="max-w-2xl mx-auto px-6 py-12">
      <Link href="/games/23_matches" className="text-sm text-[#8a7a5a] hover:text-[#d4a017]">← Game Details</Link>
      <h1 className="text-3xl text-[#d4a017] mt-2">23 Matches</h1>
      <p className="text-[#b8a888] mt-2 text-sm">
        Take 1, 2 or 3 matches. Whoever takes the <b>last</b> match <b>loses</b>.
      </p>

      <div className="panel mt-8 p-8 text-center">
        <p className="text-xs text-[#8a7a5a] mb-2">MATCHES REMAINING</p>
        <p className="text-6xl font-bold text-[#d4a017] mb-6">{state.remaining}</p>
        <div className="flex justify-center gap-1 flex-wrap min-h-[60px] mb-6">
          {Array.from({ length: state.remaining }).map((_, i) => (
            <span key={i} className="text-3xl">🔥</span>
          ))}
        </div>

        {state.gameOver ? (
          <div>
            <p className={`text-2xl mb-4 ${state.winner === "player" ? "text-emerald-400" : "text-red-400"}`}>
              {state.winner === "player" ? "You win! The computer took the last match." : "You took the last match — you lose."}
            </p>
            <button className="btn-royal" onClick={() => restart()}>Play Again</button>
          </div>
        ) : (
          <div className="flex gap-3 justify-center">
            {[1, 2, 3].map((n) => (
              <button key={n} className="btn-royal px-6" disabled={state.remaining < n} onClick={() => take(n)}>
                Take {n}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="panel mt-6 p-4 text-sm">
        <div className="flex items-center justify-between mb-2">
          <b>AI Mode</b>
          <select className="btn-stone text-xs" value={mode} onChange={(e) => restart(e.target.value as Mode)}>
            <option value="classic">Classic 1978 (Albrecht AI)</option>
            <option value="master">Master (Optimal AI)</option>
          </select>
        </div>
        <p className="text-[#8a7a5a]">
          {state.history.length > 0
            ? state.history.slice(-6).map((h, i) => (
                <span key={i}>
                  {h.player !== null && <>You took {h.player}. </>}
                  {h.ai !== null && <>AI took {h.ai}. </>}
                  ({h.remaining} left){" "}
                </span>
              ))
            : "New game. Your move."}
        </p>
      </div>
    </main>
  );
}