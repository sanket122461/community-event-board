import { NextRequest, NextResponse } from "next/server";
import { readStore } from "@/lib/store";
import { jsonError } from "@/lib/http";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const perPage = Math.min(24, Math.max(1, Number(searchParams.get("perPage")) || 6));
  const category = searchParams.get("category")?.trim() ?? "";
  const city = searchParams.get("city")?.trim() ?? "";
  const query = searchParams.get("q")?.trim().toLocaleLowerCase() ?? "";
  if (category && category !== "All" && !["Music", "Workshop", "Food", "Sports", "Kids"].includes(category)) {
    return jsonError("Choose a valid event category.");
  }

  try {
    const store = await readStore();
    const now = Date.now();
    const upcoming = store.events.filter((event) => event.active && new Date(event.date).getTime() >= now);
    const cities = [...new Set(upcoming.map((event) => event.city))].sort((a, b) => a.localeCompare(b));
    const matching = upcoming
      .filter((event) => !category || category === "All" || event.category === category)
      .filter((event) => !city || city === "All" || event.city === city)
      .filter((event) => !query || `${event.title} ${event.description} ${event.city} ${event.category}`.toLocaleLowerCase().includes(query))
      .sort((a, b) => Date.parse(a.date) - Date.parse(b.date));
    const offset = (page - 1) * perPage;
    return NextResponse.json({
      events: matching.slice(offset, offset + perPage),
      cities,
      pagination: { page, perPage, total: matching.length, totalPages: Math.ceil(matching.length / perPage) }
    });
  } catch (error) {
    console.error("Unable to load events", error);
    return jsonError("Events are temporarily unavailable.", 500);
  }
}
