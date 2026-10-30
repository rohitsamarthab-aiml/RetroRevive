import { GAMES } from "@/data/games";
import Link from "next/link";

export default function GamesLibraryPage() {
  const categories = ["All", ...new Set(GAMES.map((g) => g.categoryDisplay))];
  return (
    <main className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl text-[#d4a017] mb-2">Game Library</h1>
      <p className="text-[#b8a888] mb-10 max-w-2xl">
        Every game in the RetroRevive catalog. Titles marked <b>Coming Soon</b> are registered
        in the platform but not yet implemented — we never show fake play buttons.
      </p>
      <div className="grid md:grid-cols-2 gap-6">
        {GAMES.map((g) => (
          <Link
            key={g.id}
            href={g.route ? `/games/${g.id}` : "/games"}
            className="panel p-5 flex gap-4 hover:border-[#d4a017] transition-colors"
          >
            <div
              className="w-20 h-20 shrink-0 rounded-lg flex items-center justify-center text-3xl"
              style={{ background: `linear-gradient(135deg, ${g.accent}55, #241c10)` }}
            >
              {g.category === "strategy" ? "🏛️" : g.category === "puzzle" ? "🔥" : "🚀"}
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg text-[#d4a017]">{g.title}</h3>
                {g.status === "coming-soon" && (
                  <span className="text-[10px] bg-black/50 border border-[#5a4526] px-2 py-0.5 rounded text-[#b8a888]">Coming Soon</span>
                )}
              </div>
              <p className="text-xs text-[#8a7a5a]">{g.subtitle} · {g.year} · {g.difficulty}</p>
              <p className="text-sm text-[#b8a888] mt-2">{g.description}</p>
              <div className="flex flex-wrap gap-1 mt-3">
                {g.tags.slice(0, 4).map((t) => (
                  <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-[#241c10] border border-[#5a4526] text-[#b8a888]">{t}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
      <div className="mt-10 text-sm text-[#8a7a5a]">
        Categories: {categories.join(" · ")}
      </div>
    </main>
  );
}