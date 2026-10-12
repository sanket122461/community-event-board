import { NextRequest, NextResponse } from "next/server";
import { authenticate, jsonError } from "@/lib/http";
import { readStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = authenticate(request, "user");
  if (!session) return jsonError("Sign in to see your personal feed.", 401);
  try {
    const store = await readStore();
    const user = store.users.find((item) => item.id === session.sub);
    if (!user) return jsonError("Your account could not be found.", 404);
    const now = Date.now();
    const events = store.events.filter((event) => event.active && Date.parse(event.date) >= now && user.favorites.includes(event.category))
      .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    return NextResponse.json({ events, favorites: user.favorites });
  } catch (error) {
    console.error("Unable to load feed", error);
    return NextResponse.json({ error: "Your feed is temporarily unavailable." }, { status: 500 });
  }
}
