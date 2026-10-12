import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { requestToken, verifyToken } from "./auth";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function authenticate(request: NextRequest, role?: "user" | "admin") {
  const token = requestToken(request);
  const session = token ? verifyToken(token) : null;
  if (!session || (role && session.role !== role)) return null;
  return session;
}
