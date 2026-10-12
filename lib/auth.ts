import { createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { cookies } from "next/headers";
import { NextRequest } from "next/server";

const scrypt = promisify(scryptCallback);
export const SESSION_COOKIE = "community_session";
const tokenLifetime = 60 * 60 * 24 * 14;

type TokenPayload = { sub: string; role: "user" | "admin"; email: string; exp: number };

function secret() {
  const configured = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === "production" && !configured) throw new Error("JWT_SECRET must be configured in production.");
  return configured || "local-development-secret-change-me";
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString("hex")}`;
}

export async function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const expected = Buffer.from(hash, "hex");
  const actual = (await scrypt(password, salt, expected.length)) as Buffer;
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function createToken(payload: Omit<TokenPayload, "exp">) {
  const header = Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString("base64url");
  const body = Buffer.from(JSON.stringify({ ...payload, exp: Math.floor(Date.now() / 1000) + tokenLifetime })).toString("base64url");
  const unsigned = `${header}.${body}`;
  const signature = createHmac("sha256", secret()).update(unsigned).digest("base64url");
  return `${unsigned}.${signature}`;
}

export function verifyToken(token: string): TokenPayload | null {
  try {
    const [header, body, signature] = token.split(".");
    if (!header || !body || !signature) return null;
    const unsigned = `${header}.${body}`;
    const expected = createHmac("sha256", secret()).update(unsigned).digest();
    const actual = Buffer.from(signature, "base64url");
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) return null;
    const payload = JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as TokenPayload;
    if (!payload.sub || !payload.email || payload.exp <= Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function requestToken(request: NextRequest) {
  const authorization = request.headers.get("authorization");
  if (authorization?.startsWith("Bearer ")) return authorization.slice(7);
  return request.cookies.get(SESSION_COOKIE)?.value;
}

export async function currentPageUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  return token ? verifyToken(token) : null;
}
