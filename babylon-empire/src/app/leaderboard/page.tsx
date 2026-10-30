"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Entry { name: string; game: string; score: number; date: string }

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => {
    try { setEntries(JSON.parse(localStorage.getItem("rr-leaderboard") ?? "[]")); } catch { /* ignore */ }
  }, []);

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl text-[#d4a017] mb-2">Leaderboard</h1>
      <div className="panel border-amber-500/40 p-4 mb-8 text-sm text-[#b8a888]">
        <b className="text-[#d4a017]">Local leaderboard.</b> Scores are stored in this browser only.
        An online leaderboard requires a hosted database backend, which this offline-first build does
        not include — nothing fake is shown here.
      </div>
      {entries.length === 0 ? (
        <p className="text-[#8a7a5a]">
          No local scores recorded yet. Play a game to appear here.{" "}
          <Link href="/games" className="text-[#d4a017] underline">Browse games →</Link>
        </p>
      ) : (
        <table className="w-full text-sm panel">
          <thead className="text-[#d4a017] text-left border-b border-[#5a4526]">
            <tr><th className="p-3">Player</th><th className="p-3">Game</th><th className="p-3">Score</th><th className="p-3">Date</th></tr>
          </thead>
          <tbody>
            {entries.sort((a, b) => b.score - a.score).map((e, i) => (
              <tr key={i} className="border-b border-[#241c10]">
                <td className="p-3">{e.name}</td>
                <td className="p-3 text-[#b8a888]">{e.game}</td>
                <td className="p-3 text-[#d4a017]">{e.score}</td>
                <td className="p-3 text-[#8a7a5a]">{e.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}