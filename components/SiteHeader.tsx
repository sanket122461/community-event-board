"use client";

import Link from "next/link";
import { CalendarDays, LogOut, Menu, Sparkles, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";

type Account = { id: string; email: string; role: "user" | "admin" } | null;

export default function SiteHeader() {
  const [account, setAccount] = useState<Account>(null);
  const [ready, setReady] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then((response) => response.json()).then((data) => setAccount(data.user)).catch(() => setAccount(null)).finally(() => setReady(true));
  }, []);

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    setAccount(null);
    window.location.href = "/";
  }

  return (
    <header className="site-header">
      <div className="nav-shell">
        <Link href="/" className="brand" aria-label="Neighbourhood home">
          <span className="brand-mark"><Sparkles size={19} strokeWidth={2.2} /></span>
          <span>neighbourhood<span className="brand-period">.</span></span>
        </Link>
        <button className="mobile-menu-button" onClick={() => setOpen(!open)} aria-label={open ? "Close menu" : "Open menu"}>
          {open ? <X size={21} /> : <Menu size={21} />}
        </button>
        <nav className={`nav-links ${open ? "nav-open" : ""}`}>
          <Link href="/" onClick={() => setOpen(false)}><CalendarDays size={16} /> Explore events</Link>
          {account?.role === "user" && <Link href="/feed" onClick={() => setOpen(false)}>My feed</Link>}
          {account?.role === "admin" && <Link href="/admin" onClick={() => setOpen(false)}>Manage events</Link>}
          {!ready ? <span className="nav-skeleton" /> : account ? (
            <div className="account-nav">
              <span className="avatar"><UserRound size={15} /></span>
              <span className="account-email">{account.email}</span>
              <button className="icon-button" aria-label="Sign out" onClick={logout}><LogOut size={17} /></button>
            </div>
          ) : (
            <div className="nav-actions">
              <Link href="/login" className="nav-login" onClick={() => setOpen(false)}>Log in</Link>
              <Link href="/signup" className="button button-small" onClick={() => setOpen(false)}>Join the community <span>↗</span></Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
