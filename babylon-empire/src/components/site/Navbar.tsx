"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/games", label: "Games" },
  { href: "/about", label: "About" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/profile", label: "Profile" },
];

export function Navbar() {
  const pathname = usePathname();
  return (
    <nav className="sticky top-0 z-50 bg-[#0d0b08]/90 backdrop-blur border-b border-[#d4a017]/25">
      <div className="max-w-6xl mx-auto flex items-center gap-1 px-4 h-16">
        <Link href="/" className="flex items-center gap-2 mr-6">
          <span className="text-2xl">𒀭</span>
          <span className="font-bold text-lg tracking-wide text-[#d4a017]">RetroRevive</span>
        </Link>
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`px-3 py-2 rounded text-sm transition-colors hover:text-[#d4a017] ${
              pathname === l.href ? "text-[#d4a017] bg-[#d4a017]/10" : "text-[#b8a888]"
            }`}
          >
            {l.label}
          </Link>
        ))}
        <Link href="/login" className="btn-royal ml-auto text-sm">Login</Link>
      </div>
    </nav>
  );
}