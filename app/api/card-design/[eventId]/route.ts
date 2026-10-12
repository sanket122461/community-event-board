import { NextRequest, NextResponse } from "next/server";
import { authenticate, jsonError } from "@/lib/http";
import { readStore, updateStore } from "@/lib/store";

export const runtime = "nodejs";
const themes = ["sunshine", "berry", "ocean"];
const stickers = ["✨", "🎈", "🌼", "🎵", "💛"];

export async function GET(request: NextRequest, context: { params: Promise<{ eventId: string }> }) {
  const session = authenticate(request, "user");
  if (!session) return jsonError("Sign in to save your card design.", 401);
  const { eventId } = await context.params;
  const store = await readStore();
  const user = store.users.find((item) => item.id === session.sub);
  if (!user) return jsonError("Your account could not be found.", 404);
  return NextResponse.json({ design: user.designs[eventId] ?? { theme: "sunshine", stickers: [] } });
}

export async function PUT(request: NextRequest, context: { params: Promise<{ eventId: string }> }) {
  const session = authenticate(request, "user");
  if (!session) return jsonError("Sign in to save your card design.", 401);
  const { eventId } = await context.params;
  let data: { theme?: unknown; stickers?: unknown };
  try { data = await request.json(); } catch { return jsonError("Please submit a valid card design."); }
  if (typeof data.theme !== "string" || !themes.includes(data.theme) || !Array.isArray(data.stickers) ||
      data.stickers.length > 3 || data.stickers.some((item) => typeof item !== "string" || !stickers.includes(item))) {
    return jsonError("That card design isn't valid.");
  }
  try {
    const design = { theme: data.theme, stickers: [...new Set(data.stickers as string[])] };
    const result = await updateStore((store) => {
      const user = store.users.find((item) => item.id === session.sub);
      if (!user) return null;
      if (!store.events.some((item) => item.id === eventId)) return undefined;
      user.designs[eventId] = design;
      return design;
    });
    if (result === null) return jsonError("Your account could not be found.", 404);
    if (!result) return jsonError("That event couldn't be found.", 404);
    return NextResponse.json({ design: result });
  } catch (error) {
    console.error("Unable to save event card design", error);
    return jsonError("Your card design couldn't be saved.", 500);
  }
}
