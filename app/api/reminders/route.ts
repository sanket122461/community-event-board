import { NextRequest, NextResponse } from "next/server";
import { authenticate, jsonError } from "@/lib/http";
import { readStore, updateStore } from "@/lib/store";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const session = authenticate(request, "user");
  if (!session) return jsonError("Sign in to view your reminders.", 401);
  const user = (await readStore()).users.find((item) => item.id === session.sub) ?? null;
  if (!user) return jsonError("Your account could not be found.", 404);
  return NextResponse.json({ reminders: user.reminders });
}

export async function POST(request: NextRequest) {
  const session = authenticate(request, "user");
  if (!session) return jsonError("Sign in to set a reminder.", 401);
  let data: { eventId?: string };
  try { data = await request.json(); } catch { return jsonError("Please select a valid event."); }
  if (!data.eventId) return jsonError("Please select a valid event.");
  try {
    const result = await updateStore((store) => {
      const event = store.events.find((item) => item.id === data.eventId && item.active && Date.parse(item.date) >= Date.now());
      const user = store.users.find((item) => item.id === session.sub);
      if (!event || !user) return null;
      const index = user.reminders.indexOf(event.id);
      const saved = index < 0;
      if (saved) user.reminders.push(event.id);
      else user.reminders.splice(index, 1);
      return { saved, reminders: user.reminders };
    });
    if (!result) return jsonError("That upcoming event couldn't be found.", 404);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Unable to save event reminder", error);
    return jsonError("Your reminder couldn't be saved. Please try again.", 500);
  }
}
