import Link from "next/link";
import { ArrowDown, ArrowUpRight, MapPin, Sparkles } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import EventsBrowser from "@/components/EventsBrowser";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="hero-kicker"><span className="kicker-dot" /> YOUR NEIGHBOURHOOD, A LITTLE CLOSER</div>
            <h1>Good things<br />happen <span>around</span><br /><span className="headline-indent">the corner.</span></h1>
            <p className="hero-description">Small gatherings. New faces. That lovely feeling of being right where you belong.</p>
            <div className="hero-actions"><a className="button" href="#events">Find your next thing <ArrowUpRight size={17} /></a><span className="hero-location"><MapPin size={15} /> Made for your community</span></div>
            <a href="#events" className="scroll-note"><ArrowDown size={14} /> A little further down</a>
          </div>
          <div className="hero-art">
            <div className="hero-photo hero-photo-main"><div className="photo-overlay" /><div className="photo-caption"><span>GOOD COMPANY</span><span>GOOD DAYS ↗</span></div></div>
            <div className="photo-sticker sticker-smile">☺</div>
            <div className="photo-sticker sticker-flower">✳</div>
            <div className="floating-note"><span className="note-icon"><Sparkles size={17} /></span><div><strong>Little plans,<br />lovely memories.</strong><small>Happening near you</small></div></div>
            <div className="hero-stamp"><span>GATHER</span><b>✳</b><span>TOGETHER</span></div>
          </div>
          <div className="hero-bottom"><span>CURATED WITH CARE, SHARED WITH EVERYONE</span><span className="hero-bottom-line" /><span>01 — 03</span></div>
        </section>
        <EventsBrowser />
        <footer className="site-footer"><Link href="/" className="brand"><span className="brand-mark"><Sparkles size={17} /></span><span>neighbourhood<span className="brand-period">.</span></span></Link><span>Better together, right around the corner.</span><Link href="/admin/login" className="footer-admin">Event organiser? <span>Admin sign in ↗</span></Link></footer>
      </main>
    </>
  );
}
