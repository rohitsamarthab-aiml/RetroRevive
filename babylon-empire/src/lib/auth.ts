import { SignJWT, jwtVerify } from "jose";
import { readJson, writeJson } from "./db";
import bcrypt from "bcryptjs";

export interface UserRecord {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: string;
}

const SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET ?? "dev-only-insecure-secret-change-me",
);
const USERS_FILE = "users";
const SESSION_COOKIE = "babylon_session";
const SESSION_DAYS = 7;

export async function registerUser(email: string, password: string): Promise<UserRecord | null> {
  const users = readJson<UserRecord[]>(USERS_FILE, []);
  if (users.some((u) => u.email === email)) return null;
  const passwordHash = await bcrypt.hash(password, 10);
  const rec: UserRecord = {
    id: crypto.randomUUID(),
    email,
    passwordHash,
    createdAt: new Date().toISOString(),
  };
  users.push(rec);
  writeJson(USERS_FILE, users);
  return rec;
}

export async function verifyUser(email: string, password: string): Promise<UserRecord | null> {
  const users = readJson<UserRecord[]>(USERS_FILE, []);
  const u = users.find((x) => x.email === email);
  if (!u) return null;
  const ok = await bcrypt.compare(password, u.passwordHash);
  return ok ? u : null;
}

export async function createSessionToken(userId: string): Promise<string> {
  return new SignJWT({ sub: userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DAYS}d`)
    .sign(SECRET);
}

export async function verifySessionToken(token: string): Promise<string | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return (payload.sub as string) ?? null;
  } catch {
    return null;
  }
}

export { SESSION_COOKIE };
