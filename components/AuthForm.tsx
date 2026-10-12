"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import { useState } from "react";

export default function AuthForm({
  mode,
  showLocalCredentials = false
}: {
  mode: "login" | "signup" | "admin";
  showLocalCredentials?: boolean;
}) {
  const isSignup = mode === "signup";
  const isAdmin = mode === "admin";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`/api/auth/${isAdmin ? "admin-login" : mode}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "We couldn't sign you in.");
      window.location.href = isAdmin ? "/admin" : "/feed";
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "We couldn't sign you in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page">
      <div className="auth-art">
        <Link href="/" className="brand auth-brand"><span className="brand-mark"><Sparkles size={18} /></span><span>neighbourhood<span className="brand-period">.</span></span></Link>
        <div className="auth-art-copy"><span className="eyebrow">A PLACE AT THE TABLE</span><h2>Good things<br />are better<br /><em>together.</em></h2><p>Find your people, your places, your next favourite little moment.</p></div>
        <div className="auth-art-bottom"><span>MADE FOR YOUR NEIGHBOURHOOD</span><span>✳</span></div>
      </div>
      <section className="auth-form-side">
        <Link href="/" className="back-link"><ArrowLeft size={16} /> Back to events</Link>
        <div className="auth-form-wrap">
          <span className="auth-mobile-mark"><Sparkles size={18} /></span>
          <span className="eyebrow">{isAdmin ? "FOR THE COMMUNITY ORGANISERS" : isSignup ? "COME ON IN" : "GOOD TO SEE YOU AGAIN"}</span>
          <h1>{isAdmin ? "Admin sign in" : isSignup ? "Make yourself at home." : "Welcome back."}</h1>
          <p className="auth-subtitle">{isAdmin ? "Sign in to keep your community calendar lovely." : isSignup ? "Join your neighbours and find something wonderful." : "Your next lovely local plan is just around the corner."}</p>
          {isAdmin && showLocalCredentials && (
            <p className="admin-demo-note">
              Local demo login: <strong>admin@communityboard.in</strong> / <strong>community123</strong>.
              Set <code>ADMIN_EMAIL</code> and <code>ADMIN_PASSWORD</code> in <code>.env.local</code> to change it.
            </p>
          )}
          <form onSubmit={submit} className="auth-form">
            <label>Email address<input type="email" autoComplete="email" placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} required /></label>
            <label>Password<input type="password" autoComplete={isSignup ? "new-password" : "current-password"} placeholder={isSignup ? "At least 8 characters" : "Your password"} value={password} onChange={(event) => setPassword(event.target.value)} minLength={isSignup ? 8 : undefined} required /></label>
            {error && <div role="alert" className="form-error">{error}</div>}
            <button className="button auth-submit" disabled={loading}>{loading ? "Just a moment…" : isAdmin ? "Sign in to dashboard" : isSignup ? "Create my account" : "Sign in"} <ArrowRight size={17} /></button>
          </form>
          {isAdmin ? <p className="auth-switch">Visitor? <Link href="/login">Sign in here</Link></p> : <p className="auth-switch">{isSignup ? "Already part of the neighbourhood?" : "New around here?"} <Link href={isSignup ? "/login" : "/signup"}>{isSignup ? "Sign in" : "Create an account"}</Link></p>}
        </div>
        <div className="auth-footer">A little closer, a little more connected. <span>✳</span></div>
      </section>
    </main>
  );
}
