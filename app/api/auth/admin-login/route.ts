import { NextRequest, NextResponse } from "next/server";
import { createToken, SESSION_COOKIE } from "@/lib/auth";
import { jsonError } from "@/lib/http";

export async function POST(request: NextRequest) {
  let data: { email?: string; password?: string };
  try { data = await request.json(); } catch { return jsonError("Please submit valid login details."); }
  if (process.env.NODE_ENV === "production" && (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD)) {
    return jsonError("Admin credentials must be configured before production sign-in.", 500);
  }
  const email = process.env.ADMIN_EMAIL || "admin@communityboard.in";
  const password = process.env.ADMIN_PASSWORD || "community123";
  if (data.email?.trim().toLowerCase() !== email.toLowerCase() || data.password !== password) {
    return jsonError("That admin email and password don't match.", 401);
  }
  const token = createToken({ sub: "admin", role: "admin", email });
  const response = NextResponse.json({ token, user: { id: "admin", email } });
  response.cookies.set(SESSION_COOKIE, token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 14 });
  return response;
}
