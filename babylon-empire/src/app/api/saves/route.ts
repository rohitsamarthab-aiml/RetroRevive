import { NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/lib/auth";
import { readJson, writeJson } from "@/lib/db";

interface SaveBlob { userId: string; save: string; updatedAt: string }

export async function GET(req: Request) {
  const userId = await sessionUser(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const saves = readJson<SaveBlob[]>("saves", []);
  const mine = saves.filter((s) => s.userId === userId);
  return NextResponse.json({ saves: mine });
}

export async function POST(req: Request) {
  const userId = await sessionUser(req);
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body.save !== "string") {
    return NextResponse.json({ error: "save (serialized GameState) required" }, { status: 400 });
  }
  // Server-side sanity: must parse and contain core fields
  try {
    const parsed = JSON.parse(body.save);
    if (typeof parsed.turn !== "number" || !parsed.resources || !parsed.population) {
      return NextResponse.json({ error: "Malformed save" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Malformed save" }, { status: 400 });
  }
  const saves = readJson<SaveBlob[]>("saves", []).filter((s) => s.userId !== userId);
  saves.push({ userId, save: body.save, updatedAt: new Date().toISOString() });
  writeJson("saves", saves);
  return NextResponse.json({ ok: true });
}

async function sessionUser(req: Request): Promise<string | null> {
  const cookie = req.headers.get("cookie") ?? "";
  const m = cookie.match(new RegExp(`${SESSION_COOKIE}=([^;]+)`));
  if (!m) return null;
  return verifySessionToken(decodeURIComponent(m[1]));
}