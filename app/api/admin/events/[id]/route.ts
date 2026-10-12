import { NextRequest, NextResponse } from "next/server";
import { authenticate, jsonError } from "@/lib/http";
import { updateStore } from "@/lib/store";

export const runtime = "nodejs";

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!authenticate(request, "admin")) return jsonError("Admin access is required.", 401);
  const { id } = await context.params;
  let data: { active?: unknown };
  try { data = await request.json(); } catch { return jsonError("Please submit a valid event update."); }
  if (typeof data.active !== "boolean") return jsonError("Choose whether the event should be active.");
  try {
    const event = await updateStore((store) => {
      const found = store.events.find((item) => item.id === id);
      if (found) found.active = data.active as boolean;
      return found ?? null;
    });
    if (!event) return jsonError("That event couldn't be found.", 404);
    return NextResponse.json({ event });
  } catch (error) {
    console.error("Unable to update event status", error);
    return jsonError("The event status couldn't be saved.", 500);
  }
}
