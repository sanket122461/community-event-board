import { NextRequest, NextResponse } from "next/server";
import { authenticate, jsonError } from "@/lib/http";
import { isCategory, readStore, updateStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = authenticate(request, "user");
  if (!session) return jsonError("Sign in to view your favourite categories.", 401);
  const user = (await readStore()).users.find((item) => item.id === session.sub) ?? null;
  if (!user) return jsonError("Your account could not be found.", 404);
  return NextResponse.json({ favorites: user.favorites });
}

export async function PUT(request: NextRequest) {
  const session = authenticate(request, "user");
  if (!session) return jsonError("Sign in to save favourite categories.", 401);
  let data: { favorites?: unknown };
  try { data = await request.json(); } catch { return jsonError("Please send a valid category list."); }
  if (!Array.isArray(data.favorites) || data.favorites.some((item) => typeof item !== "string" || !isCategory(item))) {
    return jsonError("Choose valid favourite categories.");
  }
  try {
    const favorites = [...new Set(data.favorites)];
    const user = await updateStore((store) => {
      const found = store.users.find((item) => item.id === session.sub);
      if (!found) return null;
      found.favorites = favorites;
      return found;
    });
    if (!user) return jsonError("Your account could not be found.", 404);
    return NextResponse.json({ favorites: user.favorites });
  } catch (error) {
    console.error("Unable to save favourite categories", error);
    return jsonError("Your preferences couldn't be saved.", 500);
  }
}
