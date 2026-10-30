import { GAMES } from "@/data/games";

export default function AboutPage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl text-[#d4a017] mb-4">About RetroRevive</h1>
      <p className="text-[#b8a888] mb-6">
        RetroRevive revives the landmark computer games of the early computing era
        (1968–1978) as modern, playable web experiences — starting with a full 3D
        reimagining of the 1978 kingdom simulation that launched the strategy genre.
      </p>
      <div className="panel p-6 mb-8 text-sm text-[#b8a888] space-y-3">
        <p><b className="text-[#d4a017]">Our approach:</b> original code, original assets, faithful rules.
        We honor the public-domain educational computing heritage of BASIC Computer Games (1978)
        without copying proprietary assets, sounds, or branding.</p>
        <p><b className="text-[#d4a017]">The platform:</b> {GAMES.length} games registered —
        {" "}{GAMES.filter((g) => g.status === "playable").length} fully playable today, the rest
        honestly marked Coming Soon. Every playable game uses real implementations, never mockups.</p>
        <p><b className="text-[#d4a017]">Engineering:</b> Next.js 15 + React 19, React Three Fiber 9,
        a deterministic TypeScript simulation core, Vitest unit tests, and JWT-based accounts.</p>
      </div>
      <h2 className="text-xl text-[#d4a017] mb-3">The Original Masters</h2>
      <ul className="text-sm text-[#b8a888] space-y-2 list-disc pl-5">
        <li><b>Doug Dyment</b> — The Sumer Game (1968), the ancestor of all kingdom simulations.</li>
        <li><b>David H. Ahl</b> — editor of 101 BASIC Computer Games (1973) and BASIC Computer Games (1978).</li>
        <li><b>Bob Albrecht</b> — People's Computer Company, 23 Matches.</li>
        <li><b>Jim Storer</b> — Lunar Lander (1969), written as a high-school student.</li>
        <li><b>Mike Mayfield</b> — Star Trek (1971).</li>
        <li><b>Rawitsch, Heinemann & Dillenberger</b> — The Oregon Trail (1971).</li>
      </ul>
    </main>
  );
}