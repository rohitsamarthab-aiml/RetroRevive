"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.currentTarget);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ mode, email: fd.get("email"), password: fd.get("password") }),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) router.push("/play");
    else setError(data.error ?? "Something went wrong");
  }

  return (
    <main className="flex items-center justify-center min-h-screen px-4">
      <form onSubmit={onSubmit} className="panel p-8 w-full max-w-sm">
        <h1 className="text-2xl text-center text-[#d4a017] mb-6">
          {mode === "login" ? "Enter Babylon" : "Found your Dynasty"}
        </h1>
        <label className="block mb-4">
          <span className="text-xs text-[#b8a888]">Email</span>
          <input name="email" type="email" required className="w-full mt-1 bg-[#241c10] border border-[#5a4526] rounded px-3 py-2" />
        </label>
        <label className="block mb-6">
          <span className="text-xs text-[#b8a888]">Password (min 6 chars)</span>
          <input name="password" type="password" required minLength={6} className="w-full mt-1 bg-[#241c10] border border-[#5a4526] rounded px-3 py-2" />
        </label>
        {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
        <button className="btn-royal w-full">{mode === "login" ? "Sign In" : "Create Account"}</button>
        <button
          type="button"
          className="btn-stone w-full mt-3"
          onClick={() => setMode(mode === "login" ? "register" : "login")}
        >
          {mode === "login" ? "No account? Register" : "Have an account? Sign in"}
        </button>
      </form>
    </main>
  );
}