import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { createToken, hashPassword, SESSION_COOKIE } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { updateStore } from "@/lib/store";
import type { UserRecord } from "@/lib/types";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let data: { email?: string; password?: string };
  try { data = await request.json(); } catch { return jsonError("Please submit valid signup details."); }
  const email = data.email?.trim().toLowerCase();
  const password = data.password;
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonError("Enter a valid email address.");
  if (!password || password.length < 8) return jsonError("Password must be at least 8 characters.");
  try {
    const passwordHash = await hashPassword(password);
    const user = await updateStore((store) => {
      if (store.users.some((item) => item.email === email)) return null;
      const created: UserRecord = { id: randomUUID(), email, passwordHash, favorites: [], reminders: [], designs: {} };
      store.users.push(created);
      return created;
    });
    if (!user) return jsonError("An account with this email already exists.", 409);
    const token = createToken({ sub: user.id, role: "user", email: user.email });
    const response = NextResponse.json({ token, user: { id: user.id, email: user.email } }, { status: 201 });
    response.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 14 });
    return response;
  } catch (error) {
    console.error("Unable to create account", error);
    return jsonError("We couldn't create your account. Please try again.", 500);
  }
}
