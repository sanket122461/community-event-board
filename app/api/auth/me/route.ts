import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "@/lib/http";

export async function GET(request: NextRequest) {
  const session = authenticate(request);
  if (!session) return NextResponse.json({ user: null });
  return NextResponse.json({ user: { id: session.sub, email: session.email, role: session.role } });
}
