import { NextRequest, NextResponse } from "next/server";
import { createToken, SESSION_COOKIE, verifyPassword } from "@/lib/auth";
import { jsonError } from "@/lib/http";
import { readStore } from "@/lib/store";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  let data: { email?: string; password?: string };
  try { data = await request.json(); } catch { return jsonError("Please submit valid login details."); }
  const email = data.email?.trim().toLowerCase();
  if (!email || !data.password) return jsonError("Enter your email and password.");
  try {
    const user = (await readStore()).users.find((item) => item.email === email);
    if (!user || !(await verifyPassword(data.password, user.passwordHash))) return jsonError("Email or password doesn't match.", 401);
    const token = createToken({ sub: user.id, role: "user", email: user.email });
    const response = NextResponse.json({ token, user: { id: user.id, email: user.email } });
    response.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 14 });
    return response;
  } catch (error) {
    console.error("Unable to log in", error);
    return jsonError("Login is temporarily unavailable.", 500);
  }
}
