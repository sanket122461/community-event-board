import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { authenticate, jsonError } from "@/lib/http";
import { isCategory, readStore, updateStore } from "@/lib/store";
import type { EventRecord } from "@/lib/types";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!authenticate(request, "admin")) return jsonError("Admin access is required.", 401);
  try {
    return NextResponse.json({ events: (await readStore()).events.sort((a, b) => Date.parse(a.date) - Date.parse(b.date)) });
  } catch (error) {
    console.error("Unable to load admin events", error);
    return jsonError("Events are temporarily unavailable.", 500);
  }
}

function validateEvent(data: Partial<EventRecord>) {
  if (typeof data.title !== "string" || !data.title.trim() || data.title.trim().length > 100) return "Add an event title (up to 100 characters).";
  if (!data.category || !isCategory(data.category)) return "Choose a valid event category.";
  if (typeof data.city !== "string" || !data.city.trim() || data.city.trim().length > 80) return "Add a city (up to 80 characters).";
  if (!data.date || Number.isNaN(Date.parse(data.date))) return "Add a valid event date and time.";
  if (typeof data.price !== "number" || !Number.isFinite(data.price) || data.price < 0) return "Enter a valid non-negative price.";
  if (typeof data.description !== "string" || !data.description.trim() || data.description.trim().length > 2000) return "Add a description (up to 2,000 characters).";
  if (typeof data.imageUrl !== "string" || !data.imageUrl.trim() || !/^https?:\/\/.+/i.test(data.imageUrl)) return "Add a valid image URL.";
  if (data.active !== undefined && typeof data.active !== "boolean") return "Choose whether the event should be active.";
  return null;
}

export async function POST(request: NextRequest) {
  if (!authenticate(request, "admin")) return jsonError("Admin access is required.", 401);
  let data: Partial<EventRecord>;
  try { data = await request.json(); } catch { return jsonError("Please submit valid event details."); }
  const invalid = validateEvent(data);
  if (invalid) return jsonError(invalid);
  try {
    const event: EventRecord = {
      id: randomUUID(),
      title: data.title!.trim(),
      category: data.category!,
      city: data.city!.trim(),
      date: new Date(data.date!).toISOString(),
      price: data.price!,
      description: data.description!.trim(),
      imageUrl: data.imageUrl!.trim(),
      active: data.active ?? true
    };
    await updateStore((store) => { store.events.push(event); });
    return NextResponse.json({ event }, { status: 201 });
  } catch (error) {
    console.error("Unable to create event", error);
    return jsonError("The event couldn't be saved.", 500);
  }
}
