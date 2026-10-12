"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Bell, MapPin } from "lucide-react";
import { useState } from "react";
import type { EventRecord } from "@/lib/types";
import { formatPrice, friendlyDate } from "@/lib/format";

export default function EventCard({ event, initialReminded = false }: { event: EventRecord; initialReminded?: boolean }) {
  const [reminded, setReminded] = useState(initialReminded);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function toggleReminder() {
    if (busy) return;
    setMessage("");
    setReminded((current) => !current);
    setBusy(true);
    try {
      const response = await fetch("/api/reminders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventId: event.id }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Couldn't save your reminder.");
      setReminded(data.saved);
    } catch (error) {
      setReminded((current) => !current);
      setMessage(error instanceof Error ? error.message : "Couldn't save your reminder.");
      window.setTimeout(() => setMessage(""), 3500);
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="event-card">
      <Link className="event-image-link" href={`/events/${event.id}`} aria-label={`View ${event.title}`}>
        <div className="event-image-wrap">
          <Image src={event.imageUrl} alt="" fill sizes="(max-width: 700px) 90vw, (max-width: 1100px) 45vw, 30vw" className="event-image" unoptimized />
          <span className="category-pill">{event.category}</span>
          <span className="image-arrow"><ArrowUpRight size={18} /></span>
        </div>
      </Link>
      <div className="event-card-body">
        <div className="event-meta"><span>{friendlyDate(event.date)}</span><span className="meta-dot" /><span>{formatPrice(event.price)}</span></div>
        <Link href={`/events/${event.id}`} className="event-title-link"><h3>{event.title}</h3></Link>
        <div className="event-location"><MapPin size={15} /> {event.city}</div>
        <div className="event-card-bottom">
          <Link href={`/events/${event.id}`} className="text-link">Event details <span>→</span></Link>
          <button className={`reminder-button ${reminded ? "is-reminded" : ""}`} onClick={toggleReminder} disabled={busy} aria-label={reminded ? "Remove reminder" : "Remind me"}>
            <Bell size={16} fill={reminded ? "currentColor" : "none"} /> {reminded ? "Reminded" : "Remind me"}
          </button>
        </div>
        {message && <div role="status" className="inline-message">{message}</div>}
      </div>
    </article>
  );
}
