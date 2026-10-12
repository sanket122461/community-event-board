"use client";

import { ArrowLeft, ArrowRight, Search, SlidersHorizontal, Sparkles } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import EventCard from "./EventCard";
import type { EventRecord } from "@/lib/types";

const categories = ["All", "Music", "Workshop", "Food", "Sports", "Kids"];
export default function EventsBrowser() {
  const [category, setCategory] = useState("All");
  const [city, setCity] = useState("All");
  const [query, setQuery] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [events, setEvents] = useState<EventRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [cities, setCities] = useState<string[]>([]);
  const [reminders, setReminders] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadEvents = useCallback(async () => {
    setLoading(true);
    setError("");
    const params = new URLSearchParams({ page: String(page), perPage: "6", category, city, q: query });
    try {
      const [response, accountResponse] = await Promise.all([fetch(`/api/events?${params}`), fetch("/api/auth/me")]);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Events couldn't be loaded.");
      setEvents(data.events);
      setTotal(data.pagination.total);
      setTotalPages(data.pagination.totalPages || 1);
      setCities(data.cities ?? []);
      const account = await accountResponse.json();
      if (account.user?.role === "user") {
        const reminderResponse = await fetch("/api/reminders");
        if (reminderResponse.ok) setReminders((await reminderResponse.json()).reminders);
      } else {
        setReminders([]);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Events couldn't be loaded.");
    } finally {
      setLoading(false);
    }
  }, [category, city, page, query]);

  useEffect(() => { void loadEvents(); }, [loadEvents]);

  function changeFilter(setter: (value: string) => void, value: string) {
    setter(value);
    setPage(1);
  }

  function submitSearch(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    changeFilter(setQuery, searchInput.trim());
  }

  return (
    <section className="events-section" id="events">
      <div className="section-heading">
        <div><span className="eyebrow"><Sparkles size={13} /> THE GOOD THINGS, NEAR YOU</span><h2>Make a little room<br className="desktop-break" /> for something lovely.</h2></div>
        <p>From live music to little makers’ markets,<br className="desktop-break" /> there’s always something around the corner.</p>
      </div>
      <div className="filter-panel">
        <div className="filter-title"><SlidersHorizontal size={17} /><span>Find your kind of day</span></div>
        <div className="filter-controls">
          <div className="category-filter" role="group" aria-label="Filter by category">
            {categories.map((item) => <button key={item} className={`filter-chip ${category === item ? "selected" : ""}`} onClick={() => changeFilter(setCategory, item)}>{item}</button>)}
          </div>
          <form className="search-form" onSubmit={submitSearch}>
            <label className="select-wrap"><span className="visually-hidden">Filter by city</span><select aria-label="Filter by city" value={city} onChange={(event) => changeFilter(setCity, event.target.value)}><option value="All">Everywhere</option>{cities.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label className="search-field"><Search size={17} /><span className="visually-hidden">Search events</span><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Try “night”, “food”..." /><button type="submit" aria-label="Search"><ArrowRight size={17} /></button></label>
          </form>
        </div>
      </div>

      <div className="results-heading"><p>{loading ? "Finding your next good thing…" : <><strong>{total}</strong> upcoming {total === 1 ? "gathering" : "gatherings"} to explore</>}</p><span>Sorted by soonest</span></div>
      {error ? <div className="state-card error-state"><span className="state-icon">!</span><h3>We hit a little bump.</h3><p>{error}</p><button className="button button-outline" onClick={() => void loadEvents()}>Try again</button></div> :
        loading ? <div className="event-grid">{[1, 2, 3, 4, 5, 6].map((item) => <div className="event-skeleton" key={item}><div /><span /><b /><i /></div>)}</div> :
          events.length ? <div className="event-grid">{events.map((event) => <EventCard key={event.id} event={event} initialReminded={reminders.includes(event.id)} />)}</div> :
            <div className="state-card"><span className="state-icon">✳</span><h3>Nothing on the calendar just yet.</h3><p>Try another category or city. Your next little adventure is out there.</p><button className="button button-outline" onClick={() => { setCategory("All"); setCity("All"); setQuery(""); setSearchInput(""); setPage(1); }}>Clear filters</button></div>}
      {!loading && !error && totalPages > 1 && <div className="pagination"><span>Page {page} of {totalPages}</span><div><button disabled={page <= 1} onClick={() => setPage(page - 1)} aria-label="Previous page"><ArrowLeft size={17} /></button><button disabled={page >= totalPages} onClick={() => setPage(page + 1)} aria-label="Next page"><ArrowRight size={17} /></button></div></div>}
    </section>
  );
}
