"use client";

import Link from "next/link";
import { Mail, ShieldCheck } from "lucide-react";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BrandLogo } from "@/components/brand-logo";
import { Button, Card, Input, Label } from "@/components/ui";
import { RateLimitAlert } from "@/components/rate-limit-alert";
import { requestAdminPasswordReset, requestPasswordReset } from "@/lib/api";
import { formatRemainingTime, getRateLimitMessage, parseRetryAfter } from "@/lib/rate-limit-helper";

export function ForgotPasswordContent({ isAdmin: forcedAdmin = null } = {}) {
  const params = useSearchParams();
  const isAdmin = forcedAdmin === null ? params.get("scope") === "admin" : forcedAdmin;
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [rateLimitRemaining, setRateLimitRemaining] = useState(null);

  useEffect(() => {
    if (!rateLimitRemaining || rateLimitRemaining <= 0) return;
    const timer = setTimeout(() => setRateLimitRemaining(null), rateLimitRemaining * 1000);
    return () => clearTimeout(timer);
  }, [rateLimitRemaining]);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      await (isAdmin ? requestAdminPasswordReset(email) : requestPasswordReset(email));
      setSent(true);
    } catch (requestError) {
      if (requestError.status === 429) {
        const retryAfter = parseRetryAfter(requestError);
        setRateLimitRemaining(retryAfter);
        setError("You made too many requests, so your access was temporarily limited. Please wait before trying again.");
      } else {
        setError(requestError.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-on-surface sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-xl">
        <header className="flex items-center justify-between border-b border-outline-variant px-6 py-5 sm:px-10">
          <Link href="/" aria-label="Back to ZoeLit homepage"><BrandLogo variant="light" className="w-36" priority /></Link>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Account security</span>
        </header>
        <div className="grid flex-1 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="hidden bg-primary p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div><ShieldCheck className="size-10" /><h1 className="mt-8 font-heading text-4xl font-semibold leading-tight">Secure access to your account.</h1><p className="mt-5 max-w-sm text-sm leading-7 text-white/75">We will send a private password reset link to the {isAdmin ? "admin account" : "account"} registered with ZoeLit.</p></div>
            <p className="text-xs text-white/60">The reset link expires after 15 minutes.</p>
          </aside>
          <section className="flex items-center p-6 sm:p-12">
            <Card className="w-full border-0 p-0 shadow-none">
              <div className="mb-8 grid size-12 place-items-center bg-primary/10 text-primary"><Mail className="size-5" /></div>
              <h2 className="font-heading text-3xl font-semibold tracking-tight">{isAdmin ? "Reset admin password" : "Reset your password"}</h2>
              <p className="mt-3 max-w-md text-sm leading-6 text-on-surface-variant">Enter your account email and we will send you a secure link to create a new password.</p>
               {sent ? <div className="mt-8 border-l-4 border-primary bg-primary/5 p-5 text-sm leading-6">If an account exists for <strong>{email}</strong>, a reset link has been sent. The link expires in 15 minutes.</div> : <form onSubmit={submit} className="mt-8 space-y-5"><div><Label htmlFor="forgot-password-email">Email address</Label><Input id="forgot-password-email" name="email" className="mt-2" type="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" aria-invalid={error ? "true" : "false"} aria-describedby={error ? "forgot-password-error" : undefined} /></div>{error ? <p id="forgot-password-error" role="alert" className="text-sm text-error">{error}</p> : null}
{rateLimitRemaining && rateLimitRemaining > 0 && (
  <RateLimitAlert
    retryAfter={rateLimitRemaining}
    message="Too many attempts"
    className="mt-4 mb-2"
  />
)}
<Button className="w-full" disabled={loading || (rateLimitRemaining && rateLimitRemaining > 0)}>{loading ? "Sending secure link..." : rateLimitRemaining && rateLimitRemaining > 0 ? `Send reset link (${formatRemainingTime(rateLimitRemaining)})` : "Send reset link"}</Button></form>}
              <Link className="mt-8 inline-block text-sm font-semibold text-primary" href={isAdmin ? "/admin/login" : "/login"}>Back to sign in</Link>
            </Card>
          </section>
        </div>
        <footer className="border-t border-outline-variant px-6 py-4 text-center text-xs text-on-surface-variant sm:px-10">Zoel IT Commerce <span className="mx-2">|</span> Secure account recovery</footer>
      </div>
    </main>
  );
}

export default function ForgotPasswordPage() {
  return <Suspense fallback={null}><ForgotPasswordContent /></Suspense>;
}
