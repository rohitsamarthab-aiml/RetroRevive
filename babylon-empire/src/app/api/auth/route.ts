import { NextResponse } from "next/server";
import { registerUser, verifyUser, createSessionToken, SESSION_COOKIE } from "@/lib/auth";

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body || typeof body.email !== "string" || typeof body.password !== "string") {
    return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  }
  const { email, password, mode } = body as { email: string; password: string; mode?: string };
  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
  }

  if (mode === "register") {
    const user = await registerUser(email, password);
    if (!user) return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    const token = await createSessionToken(user.id);
    const res = NextResponse.json({ ok: true, email: user.email });
    setCookie(res, token);
    return res;
  }

  const user = await verifyUser(email, password);
  if (!user) return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  const token = await createSessionToken(user.id);
  const res = NextResponse.json({ ok: true, email: user.email });
  setCookie(res, token);
  return res;
}

function setCookie(res: NextResponse, token: string) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}