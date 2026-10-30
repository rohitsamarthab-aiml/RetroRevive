"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Profile {
  name: string;
  avatar: string;
  joined: string;
  gamesPlayed: number;
  achievements: string[];
}

const AVATARS = ["𒀭", "𒈗", "𒂍", "🦁", "🏛️", "👑"];

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [saves, setSaves] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("rr-profile");
      if (raw) setProfile(JSON.parse(raw));
      else
        setProfile({
          name: "Wanderer of Babylon",
          avatar: "𒀭",
          joined: new Date().toISOString().slice(0, 10),
          gamesPlayed: 0,
          achievements: [],
        });
      const s = localStorage.getItem("babylon-empire-save-v1");
      setSaves(s ? ["Babylonian Empire — autosave slot"] : []);
    } catch { /* ignore */ }
  }, []);

  if (!profile) return null;

  function update(p: Partial<Profile>) {
    const next = { ...profile!, ...p };
    setProfile(next);
    localStorage.setItem("rr-profile", JSON.stringify(next));
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-3xl text-[#d4a017] mb-8">Player Profile</h1>
      <div className="panel p-6 flex gap-6 items-center mb-8">
        <button
          className="w-20 h-20 text-4xl panel flex items-center justify-center hover:border-[#d4a017]"
          title="Click to change avatar"
          onClick={() => update({ avatar: AVATARS[(AVATARS.indexOf(profile.avatar) + 1) % AVATARS.length] })}
        >
          {profile.avatar}
        </button>
        <div className="flex-1">
          <input
            className="bg-transparent text-xl text-[#e8dcc3] border-b border-[#5a4526] focus:border-[#d4a017] outline-none w-full"
            value={profile.name}
            onChange={(e) => update({ name: e.target.value })}
          />
          <p className="text-xs text-[#8a7a5a] mt-1">Member since {profile.joined} · click avatar to change</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <div className="panel p-6">
          <h2 className="text-[#d4a017] mb-3">Saved Games</h2>
          {saves.length ? (
            <ul className="text-sm text-[#b8a888] space-y-2">
              {saves.map((s) => <li key={s}>💾 {s}</li>)}
            </ul>
          ) : (
            <p className="text-sm text-[#8a7a5a]">No saves yet. <Link href="/play/hammurabi" className="text-[#d4a017] underline">Play the Babylonian Empire</Link> and press Save.</p>
          )}
        </div>
        <div className="panel p-6">
          <h2 className="text-[#d4a017] mb-3">Achievements</h2>
          <p className="text-sm text-[#8a7a5a]">Achievements unlock from real gameplay events and appear here as you earn them.</p>
        </div>
      </div>

      <div className="panel p-6 text-sm text-[#b8a888]">
        <b className="text-[#d4a017]">Privacy note:</b> your profile and saves live in this browser's
        local storage. Registering an account enables server-side cloud saves instead.
      </div>
    </main>
  );
}