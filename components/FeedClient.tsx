"use client";

import Link from "next/link";
import { ArrowRight, Check, Heart, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import EventCard from "./EventCard";
import type { Category, EventRecord } from "@/lib/types";

const categories: Category[] = ["Music", "Workshop", "Food", "Sports", "Kids"];
const categoryEmojis: Record<Category, string> = { Music: "♫", Workshop: "✳", Food: "♡", Sports: "↗", Kids: "☼" };

export default function FeedClient() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [favorites, setFavorites] = useState<Category[]>([]);
  const [selected, setSelected] = useState<Category[]>([]);
  const [reminders, setReminders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [feedResponse, reminderResponse] = await Promise.all([fetch("/api/feed"), fetch("/api/reminders")]);
      const data = await feedResponse.json();
      if (!feedResponse.ok) throw new Error(data.error || "Your feed couldn't be loaded.");
      setEvents(data.events);
      setFavorites(data.favorites);
      setSelected(data.favorites);
      if (reminderResponse.ok) setReminders((await reminderResponse.json()).reminders);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Your feed couldn't be loaded.");
    } finally { setLoading(false); }
  }
  useEffect(() => { void load(); }, []);

  function toggle(category: Category) {
    setSelected((current) => current.includes(category) ? current.filter((item) => item !== category) : [...current, category]);
  }
  async function save() {
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/favorites", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ favorites: selected }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Your preferences couldn't be saved.");
      setFavorites(data.favorites);
      await load();
      setNotice("Your feed is all yours now.");
      window.setTimeout(() => setNotice(""), 3500);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Your preferences couldn't be saved.");
    } finally { setSaving(false); }
  }

  return (
    <main className="inner-page">
      <div className="feed-hero"><div className="eyebrow"><Sparkles size={14} /> YOUR OWN LITTLE CORNER</div><h1>A feed that feels<br /><em>like you.</em></h1><p>Pick the things you love. We’ll bring the good stuff to you.</p></div>
      {error && <div role="alert" className="form-error feed-error">{error} <button onClick={() => void load()}>Try again</button></div>}
      <section className="preferences-panel">
        <div className="preferences-heading"><div><span className="eyebrow">YOUR FAVOURITE THINGS</span><h2>What are you into?</h2></div><span className="preferences-heart"><Heart size={18} /></span></div>
        <p>Choose a few and we’ll find the gatherings you’ll love.</p>
        <div className="preference-options">{categories.map((category) => <button key={category} onClick={() => toggle(category)} className={`preference-option ${selected.includes(category) ? "selected" : ""}`} aria-pressed={selected.includes(category)}><span className="preference-emoji">{categoryEmojis[category]}</span>{category}{selected.includes(category) && <Check size={16} />}</button>)}</div>
        <div className="preferences-bottom"><span>{selected.length ? `${selected.length} ${selected.length === 1 ? "interest" : "interests"} selected` : "Pick at least one to get started"}</span><button className="button" onClick={save} disabled={saving || !selected.length}>{saving ? "Saving…" : "Update my feed"} <ArrowRight size={16} /></button></div>
      </section>
      {notice && <div className="success-note"><Check size={16} /> {notice}</div>}
      <section className="feed-events"><div className="feed-events-heading"><div><span className="eyebrow">HAND-PICKED FOR YOU</span><h2>Your upcoming plans</h2></div>{favorites.length > 0 && <Link href="/" className="text-link">Explore everything <span>→</span></Link>}</div>
        {loading ? <div className="event-grid">{[1, 2, 3].map((item) => <div className="event-skeleton" key={item}><div /><span /><b /><i /></div>)}</div> :
          !favorites.length ? <div className="state-card feed-empty"><span className="state-icon">♡</span><h3>Your feed starts with what you love.</h3><p>Choose your favourite categories above, and we’ll find the good things happening nearby.</p><Link href="/" className="button button-outline">Explore all events <ArrowRight size={16} /></Link></div> :
            !events.length ? <div className="state-card feed-empty"><span className="state-icon">✳</span><h3>Nothing just yet — but we’re keeping an eye out.</h3><p>There aren’t any upcoming events in your chosen categories at the moment. Check back soon.</p><Link href="/" className="button button-outline">Browse all events <ArrowRight size={16} /></Link></div> :
              <div className="event-grid">{events.map((event) => <EventCard key={event.id} event={event} initialReminded={reminders.includes(event.id)} />)}</div>}
      </section>
    </main>
  );
}
