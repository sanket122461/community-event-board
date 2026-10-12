import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Sparkles, Ticket } from "lucide-react";
import SiteHeader from "@/components/SiteHeader";
import EventCard from "@/components/EventCard";
import CardDesigner from "@/components/CardDesigner";
import { readStore } from "@/lib/store";
import { formatPrice, friendlyDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const store = await readStore();
  const event = store.events.find((item) => item.id === id && item.active && Date.parse(item.date) >= Date.now());
  if (!event) notFound();
  return (
    <>
      <SiteHeader />
      <main className="event-detail-page">
        <Link href="/" className="back-link event-back"><ArrowLeft size={16} /> All events</Link>
        <div className="detail-hero">
          <div className="detail-image"><Image src={event.imageUrl} alt={event.title} fill priority sizes="(max-width: 800px) 100vw, 58vw" unoptimized /></div>
          <div className="detail-info"><span className="category-pill detail-category">{event.category}</span><span className="eyebrow detail-date"><Sparkles size={13} /> {friendlyDate(event.date)}</span><h1>{event.title}</h1><p className="detail-description">{event.description}</p><div className="detail-facts"><span><MapPin size={17} /> {event.city}</span><span><Ticket size={17} /> {formatPrice(event.price)} <small>{event.price === 0 ? "entry" : "per person"}</small></span></div><div className="detail-note"><span>✳</span><p>Local moments, made memorable. Come as you are — you’re already among friends.</p></div><EventCard event={event} /></div>
        </div>
        <CardDesigner event={event} />
      </main>
    </>
  );
}
