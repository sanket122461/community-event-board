"use client";

import { Check, LockKeyhole, Sparkles, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { EventRecord } from "@/lib/types";
import { friendlyDate } from "@/lib/format";

const themes = [
  { id: "sunshine", label: "Sunday sunshine", background: "linear-gradient(135deg,#f6d76b,#f4a66a)" },
  { id: "berry", label: "Berry picnic", background: "linear-gradient(135deg,#d79aad,#ae7195)" },
  { id: "ocean", label: "Blue hour", background: "linear-gradient(135deg,#9ecac7,#6799aa)" }
];
const stickerOptions = ["✨", "🎈", "🌼", "🎵", "💛"];

export default function CardDesigner({ event }: { event: EventRecord }) {
  const [theme, setTheme] = useState("sunshine");
  const [stickers, setStickers] = useState<string[]>([]);
  const [signedIn, setSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    (async () => {
      const authResponse = await fetch("/api/auth/me");
      if (!authResponse.ok) throw new Error("Your sign-in status couldn’t be checked.");
      const account = await authResponse.json();
      if (!active) return;
      const isSignedIn = account.user?.role === "user";
      setSignedIn(isSignedIn);
      if (isSignedIn) {
        const designResponse = await fetch(`/api/card-design/${event.id}`);
        const data = await designResponse.json();
        if (!designResponse.ok) throw new Error(data.error || "Your card design couldn’t be loaded.");
        if (active) {
          setTheme(data.design.theme);
          setStickers(data.design.stickers);
        }
      }
    })().catch((reason: unknown) => {
      if (active) setError(reason instanceof Error ? reason.message : "Your card design couldn’t be loaded.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [event.id]);

  async function save(nextTheme: string, nextStickers: string[]) {
    setError("");
    if (!signedIn) {
      setNotice("Sign in to save your design for next time.");
      window.setTimeout(() => setNotice(""), 3500);
      return;
    }
    try {
      const response = await fetch(`/api/card-design/${event.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ theme: nextTheme, stickers: nextStickers }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Your card couldn't be saved.");
      setNotice("Your card design is saved.");
      window.setTimeout(() => setNotice(""), 2500);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Your card couldn't be saved.");
    }
  }

  function chooseTheme(value: string) {
    setTheme(value);
    void save(value, stickers);
  }

  function toggleSticker(sticker: string) {
    const next = stickers.includes(sticker) ? stickers.filter((item) => item !== sticker) : stickers.length < 3 ? [...stickers, sticker] : stickers;
    if (next === stickers) return;
    setStickers(next);
    void save(theme, next);
  }

  const selectedTheme = themes.find((item) => item.id === theme) ?? themes[0];

  return (
    <section className="designer-section">
      <div className="designer-intro"><span className="eyebrow"><Sparkles size={14} /> A LITTLE SOMETHING TO KEEP</span><h2>Design your<br /><em>event card.</em></h2><p>Give this gathering its own little look. It’s your memory to make.</p></div>
      <div className="designer-workspace">
        <div className="designer-preview">
          <span className="preview-label">YOUR CARD, YOUR WAY</span>
          {loading ? <div className="card-skeleton" /> :
            <div key={`${event.id}-${theme}`} className={`designed-card theme-${theme}`} style={{ background: selectedTheme.background }}>
              <span className="card-topline">A LITTLE NEIGHBOURHOOD MOMENT</span>
              <div className="card-stickers">{stickers.map((sticker, index) => <span key={`${sticker}-${index}`} className={`card-sticker card-sticker-${index}`}>{sticker}</span>)}</div>
              <div className="designed-card-copy"><span>{event.category} <b>·</b> {event.city}</span><h3>{event.title}</h3><p>{friendlyDate(event.date)}</p></div>
              <span className="card-footer-mark">neighbourhood<span>.</span> <b>✳</b></span>
            </div>}
          <div className="preview-caption"><span>Changes saved just for you</span><span className="preview-caption-mark">✳</span></div>
        </div>
        <div className="designer-controls">
          <div className="designer-control-block"><div className="control-title"><span>01</span><div><h3>Choose a mood</h3><p>Pick the colours that feel right.</p></div></div>
            <div className="theme-options">{themes.map((item) => <button key={item.id} className={`theme-option ${theme === item.id ? "theme-selected" : ""}`} onClick={() => chooseTheme(item.id)} aria-label={item.label} aria-pressed={theme === item.id}><span style={{ background: item.background }} />{theme === item.id && <Check size={14} />}</button>)}</div>
          </div>
          <div className="designer-control-block"><div className="control-title"><span>02</span><div><h3>Add a little sparkle</h3><p>Choose up to three. Tap again to remove.</p></div></div>
            <div className="sticker-options">{stickerOptions.map((sticker) => <button key={sticker} className={`sticker-option ${stickers.includes(sticker) ? "sticker-selected" : ""}`} onClick={() => toggleSticker(sticker)} aria-pressed={stickers.includes(sticker)} aria-label={`Add or remove ${sticker}`}>{sticker}{stickers.includes(sticker) && <X size={13} />}</button>)}</div>
            <span className="sticker-count">{stickers.length} of 3 stickers chosen</span>
          </div>
          <div className="designer-save-note"><LockKeyhole size={15} /> {signedIn ? "Your design is saved to this event." : <> <a href="/login">Sign in</a> to keep your design after you leave.</>}</div>
          {notice && <div className="success-note"><Check size={15} />{notice}</div>}
          {error && <div role="alert" className="form-error">{error}</div>}
        </div>
      </div>
    </section>
  );
}
