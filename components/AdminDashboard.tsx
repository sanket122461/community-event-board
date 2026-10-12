"use client";

import Image from "next/image";
import { Check, CirclePlus, ImagePlus, LoaderCircle, MapPin, Plus, ToggleLeft, ToggleRight } from "lucide-react";
import { useEffect, useState } from "react";
import { CATEGORIES, type EventRecord } from "@/lib/types";
import { friendlyDate, formatPrice } from "@/lib/format";

const emptyForm = { title: "", category: "Music", city: "", date: "", price: "0", description: "", imageUrl: "", active: true };

export default function AdminDashboard() {
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function loadEvents() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/admin/events");
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Events couldn't be loaded.");
      setEvents(data.events);
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Events couldn't be loaded."); }
    finally { setLoading(false); }
  }
  useEffect(() => { void loadEvents(); }, []);

  function update<K extends keyof typeof emptyForm>(key: K, value: (typeof emptyForm)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }
  async function createEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setNotice("");
    try {
      const response = await fetch("/api/admin/events", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, date: new Date(form.date).toISOString(), price: Number(form.price) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The event couldn't be saved.");
      setEvents((current) => [...current, data.event].sort((a, b) => Date.parse(a.date) - Date.parse(b.date)));
      setForm(emptyForm);
      setNotice("Your new event is on the calendar.");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "The event couldn't be saved."); }
    finally { setSaving(false); }
  }
  async function toggleActive(item: EventRecord) {
    setError("");
    setEvents((current) => current.map((event) => event.id === item.id ? { ...event, active: !event.active } : event));
    try {
      const response = await fetch(`/api/admin/events/${item.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ active: !item.active }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "The event status couldn't be saved.");
      setEvents((current) => current.map((event) => event.id === item.id ? data.event : event));
    } catch (reason) {
      setEvents((current) => current.map((event) => event.id === item.id ? item : event));
      setError(reason instanceof Error ? reason.message : "The event status couldn't be saved.");
    }
  }

  const activeCount = events.filter((event) => event.active).length;

  return (
    <main className="admin-page">
      <div className="admin-welcome"><div><span className="eyebrow">YOUR COMMUNITY, ON THE CALENDAR</span><h1>Make good things<br /><em>happen.</em></h1><p>Every little gathering starts with someone bringing people together.</p></div><div className="admin-stats"><span className="admin-stat-icon"><CirclePlus size={21} /></span><strong>{events.length}</strong><span>events <i>·</i> {activeCount} active</span></div></div>
      {error && <div role="alert" className="form-error admin-error">{error}<button onClick={() => void loadEvents()}>Reload</button></div>}
      {notice && <div className="success-note"><Check size={16} /> {notice}</div>}
      <div className="admin-layout">
        <section className="admin-form-panel"><div className="admin-panel-heading"><div><span className="eyebrow">A NEW LITTLE GATHERING</span><h2>Add an event</h2></div><span className="form-heading-icon"><Plus size={20} /></span></div>
          <form className="admin-form" onSubmit={createEvent}>
            <label className="form-full">Event name<input maxLength={100} value={form.title} onChange={(event) => update("title", event.target.value)} placeholder="e.g. Moonlight indie sessions" required /></label>
            <div className="form-row"><label>Category<select value={form.category} onChange={(event) => update("category", event.target.value)}>{CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label><label>City<input maxLength={80} value={form.city} onChange={(event) => update("city", event.target.value)} placeholder="e.g. Coimbatore" required /></label></div>
            <div className="form-row"><label>Date &amp; time<input type="datetime-local" value={form.date} onChange={(event) => update("date", event.target.value)} required /></label><label>Price (₹)<input type="number" min="0" step="1" value={form.price} onChange={(event) => update("price", event.target.value)} required /></label></div>
            <label className="form-full">A little about it<textarea maxLength={2000} rows={4} value={form.description} onChange={(event) => update("description", event.target.value)} placeholder="What makes this gathering special?" required /></label>
            <label className="form-full">Image URL<input type="url" value={form.imageUrl} onChange={(event) => update("imageUrl", event.target.value)} placeholder="https://…" required /></label>
            <label className="active-checkbox"><input type="checkbox" checked={form.active} onChange={(event) => update("active", event.target.checked)} /><span>Make this event active</span></label>
            <button className="button admin-submit" disabled={saving}>{saving ? <><LoaderCircle className="spin" size={17} /> Adding event…</> : <>Add to the calendar <Plus size={17} /></>}</button>
          </form>
        </section>
        <section className="admin-events-panel"><div className="admin-panel-heading"><div><span className="eyebrow">YOUR COMMUNITY LINE-UP</span><h2>All events <span className="count-badge">{events.length}</span></h2></div></div>
          {loading ? <div className="admin-loading"><LoaderCircle className="spin" size={23} /> Loading your calendar…</div> :
            events.length === 0 ? <div className="admin-empty"><ImagePlus size={24} /><h3>A lovely blank canvas.</h3><p>Your first event is just one form away.</p></div> :
              <div className="admin-event-list">{events.map((item) => <article className="admin-event-row" key={item.id}>
                <div className="admin-thumb">{item.imageUrl && <Image src={item.imageUrl} alt="" fill sizes="72px" unoptimized />}</div>
                <div className="admin-event-info"><span className="admin-row-meta">{item.category} <i>·</i> {friendlyDate(item.date)}</span><h3>{item.title}</h3><span className="admin-row-place"><MapPin size={12} /> {item.city} <i>·</i> {formatPrice(item.price)}</span></div>
                <button onClick={() => void toggleActive(item)} className={`status-toggle ${item.active ? "status-on" : ""}`} aria-label={`Mark ${item.title} ${item.active ? "inactive" : "active"}`} title={item.active ? "Active — click to deactivate" : "Inactive — click to activate"}>{item.active ? <ToggleRight size={25} /> : <ToggleLeft size={25} />}<span>{item.active ? "Active" : "Inactive"}</span></button>
              </article>)}</div>}
        </section>
      </div>
    </main>
  );
}
