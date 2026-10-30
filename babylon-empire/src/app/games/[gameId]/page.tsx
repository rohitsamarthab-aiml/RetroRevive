import Link from "next/link";
import { notFound } from "next/navigation";
import { GAMES, getGame } from "@/data/games";

export function generateStaticParams() {
  return GAMES.map((g) => ({ gameId: g.id }));
}

export default async function GameDetailPage({ params }: { params: Promise<{ gameId: string }> }) {
  const { gameId } = await params;
  const g = getGame(gameId);
  if (!g) notFound();

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/games" className="text-sm text-[#8a7a5a] hover:text-[#d4a017]">← Back to Games</Link>
      <div
        className="panel mt-4 p-8 relative overflow-hidden"
        style={{ background: `linear-gradient(160deg, ${g.accent}22, #1a150e 60%)` }}
      >
        <div className="flex items-center gap-2 text-xs text-[#8a7a5a] mb-2">
          <span>{g.categoryDisplay}</span> · <span>{g.year}</span> · <span>{g.difficulty}</span>
          {g.status === "coming-soon" && <span className="text-[#b8a888] border border-[#5a4526] rounded px-2">Coming Soon</span>}
        </div>
        <h1 className="text-3xl text-[#d4a017]">{g.title}</h1>
        <p className="text-[#b8a888] mt-1">{g.subtitle}</p>

        <div className="grid md:grid-cols-2 gap-8 mt-8 text-sm">
          <div className="space-y-4">
            <section>
              <h2 className="text-[#d4a017] mb-1">Story & Objective</h2>
              <p className="text-[#b8a888]">{g.description}</p>
            </section>
            <section>
              <h2 className="text-[#d4a017] mb-1">How to Play</h2>
              <p className="text-[#b8a888]">{g.rulesSummary}</p>
            </section>
            <section>
              <h2 className="text-[#d4a017] mb-1">Controls</h2>
              <p className="text-[#b8a888]">
                {g.id === "hammurabi"
                  ? "Mouse drag rotates the camera; scroll zooms; right-drag pans. Use the bottom panel tabs (Decree / Build / Advisor / Chronicle) with clear labeled number fields and buttons."
                  : "Use the on-screen buttons and keyboard shortcuts listed inside the game."}
              </p>
            </section>
          </div>
          <div className="space-y-4">
            <section>
              <h2 className="text-[#d4a017] mb-1">Available Modes</h2>
              <ul className="text-[#b8a888] space-y-1">
                {g.modes.length ? g.modes.map((m) => <li key={m}>• {m}</li>) : <li>—</li>}
              </ul>
            </section>
            <section>
              <h2 className="text-[#d4a017] mb-1">Historical Provenance</h2>
              <p className="text-[#8a7a5a]">{g.historicalProvenance}</p>
              <p className="text-xs text-[#6a5a3a] mt-1">Source: {g.bookSource}</p>
            </section>
          </div>
        </div>

        <div className="mt-10">
          {g.route ? (
            <Link href={g.route} className="btn-royal inline-block px-10 py-3 text-lg">▶ Play Now</Link>
          ) : (
            <div className="text-sm text-[#8a7a5a]">
              This game is registered in the catalog but not yet implemented. Follow the repository
              for updates — we will never ship a placeholder Play button.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}