import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#d4a017]/25 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10 grid md:grid-cols-3 gap-8 text-sm">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">𒀭</span>
            <span className="font-bold text-[#d4a017]">RetroRevive</span>
          </div>
          <p className="text-[#8a7a5a]">
            Reviving the classic computer games of 1978 with modern 3D craftsmanship.
            Original code, original assets — honoring public-domain educational computing history.
          </p>
        </div>
        <div>
          <h4 className="text-[#d4a017] mb-3 font-semibold">Platform</h4>
          <ul className="space-y-2 text-[#b8a888]">
            <li><Link href="/games" className="hover:text-[#d4a017]">Game Library</Link></li>
            <li><Link href="/leaderboard" className="hover:text-[#d4a017]">Leaderboard</Link></li>
            <li><Link href="/membership" className="hover:text-[#d4a017]">Membership</Link></li>
            <li><Link href="/about" className="hover:text-[#d4a017]">About</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-[#d4a017] mb-3 font-semibold">Credits</h4>
          <p className="text-[#8a7a5a]">
            Original games: Doug Dyment, David H. Ahl, Bob Albrecht, Jim Storer,
            Mike Mayfield, Don Rawitsch and the People's Computer Company.
            Built with Next.js, React Three Fiber, and TypeScript.
          </p>
        </div>
      </div>
      <div className="text-center text-xs text-[#6a5a3a] pb-6">
        © 2026 RetroRevive. MIT-licensed original code.
      </div>
    </footer>
  );
}