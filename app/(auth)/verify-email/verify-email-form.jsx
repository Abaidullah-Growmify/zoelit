"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { AlertTriangle, Loader2, Mail, MailCheck, RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button, Input, Label } from "@/components/ui";
import { RateLimitAlert } from "@/components/rate-limit-alert";
import { verifyEmail, resendVerificationEmail } from "@/lib/api";
import { formatRemainingTime, getRateLimitMessage, parseRetryAfter } from "@/lib/rate-limit-helper";

export function VerifyEmailForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") || "";
  const initialEmail = params.get("email") || "";

  const [phase, setPhase] = useState(token ? "verifying" : "check");
  const [email, setEmail] = useState(initialEmail);
  const [errorMessage, setErrorMessage] = useState("");
  const [emailError, setEmailError] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [rateLimitRemaining, setRateLimitRemaining] = useState(null);

  useEffect(() => {
    if (!rateLimitRemaining || rateLimitRemaining <= 0) return;
    const timer = setTimeout(() => setRateLimitRemaining(null), rateLimitRemaining * 1000);
    return () => clearTimeout(timer);
  }, [rateLimitRemaining]);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    verifyEmail(token, initialEmail)
      .then((data) => {
        if (cancelled) return;
        setPhase(data?.code === "ALREADY_VERIFIED" ? "already" : "success");
      })
      .catch((error) => {
        if (cancelled) return;
        setErrorMessage(error.message || "This activation link is invalid or expired.");
        setPhase("error");
      });
    return () => {
      cancelled = true;
    };
  }, [token, initialEmail]);

  async function resend(event) {
    event?.preventDefault();
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setEmailError("Enter a valid email address");
      toast.error("Enter a valid email address");
      return;
    }
    setEmailError("");
    setResending(true);
    setErrorMessage("");
    try {
      await resendVerificationEmail(email);
      setResent(true);
      setRateLimitRemaining(null);
      toast.success("Activation link sent. Check your inbox and spam folder.");
    } catch (error) {
      if (error.status === 429) {
        const retryAfter = parseRetryAfter(error);
        setRateLimitRemaining(retryAfter);
        // No toast — show message below the button instead
      } else {
        toast.error(error.message || "Could not resend the activation link");
      }
    } finally {
      setResending(false);
    }
  }

  function goToLogin() {
    router.push("/login?verified=success");
  }

  const shellClassName =
    "relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4";

  return (
    <div className={shellClassName}>
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgb(0_63_177_/_0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgb(0_63_177_/_0.12)_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(0_63_177_/_0.16),transparent_34%),radial-gradient(circle_at_20%_80%,rgb(26_86_219_/_0.12),transparent_28%)]" />
      <section className="relative z-10 w-full max-w-md rounded-2xl border border-outline-variant bg-surface/90 p-6 shadow-xl backdrop-blur-xl">
        {phase === "verifying" ? (
          <div className="flex flex-col items-center py-8 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Loader2 className="size-7 animate-spin" />
            </span>
            <h1 className="mt-6 font-heading text-2xl font-semibold tracking-tight text-on-surface">Verifying your email</h1>
            <p className="mt-2 text-sm text-on-surface-variant">Checking your activation link...</p>
          </div>
        ) : phase === "success" ? (
          <div className="flex flex-col items-center py-6 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
              <MailCheck className="size-7" />
            </span>
            <h1 className="mt-6 font-heading text-2xl font-semibold tracking-tight text-on-surface">Email verified</h1>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">Your account is now active. You can sign in with your email and password.</p>
            <Button onClick={goToLogin} className="mt-6 w-full">
              Go to sign in
            </Button>
          </div>
        ) : phase === "already" ? (
          <div className="flex flex-col items-center py-6 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-700">
              <MailCheck className="size-7" />
            </span>
            <h1 className="mt-6 font-heading text-2xl font-semibold tracking-tight text-on-surface">Email already verified</h1>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">Your account is active. You can sign in with your email and password.</p>
            <Button onClick={goToLogin} className="mt-6 w-full">
              Go to sign in
            </Button>
          </div>
        ) : phase === "error" ? (
          <div className="flex flex-col items-center py-6 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-rose-100 text-rose-700">
              <AlertTriangle className="size-7" />
            </span>
            <h1 className="mt-6 font-heading text-2xl font-semibold tracking-tight text-on-surface">Link invalid or expired</h1>
             <p id="verify-email-link-error" role="alert" className="mt-2 text-sm leading-6 text-on-surface-variant">{errorMessage} You can request a new activation link below.</p>
             <div className="mt-6 w-full space-y-3">
               <div className="space-y-2">
                 <Label htmlFor="verify-email-error-email">Email address</Label>
                 <Input id="verify-email-error-email" name="email" type="email" required value={email} onChange={(event) => { setEmail(event.target.value); setEmailError(""); }} placeholder="you@example.com" autoComplete="email" aria-invalid={emailError ? "true" : "false"} aria-describedby={emailError ? "verify-email-error-email-error" : "verify-email-link-error"} />
                 {emailError ? <p id="verify-email-error-email-error" role="alert" className="text-xs text-error">{emailError}</p> : null}
              </div>
              <Button className="w-full" onClick={resend} disabled={resending || resent || (rateLimitRemaining && rateLimitRemaining > 0)}>
                {resending ? <><Loader2 className="size-4 animate-spin" />Sending...</> : rateLimitRemaining && rateLimitRemaining > 0 ? `Resend activation link (${formatRemainingTime(rateLimitRemaining)})` : resent ? <><RotateCcw className="size-4" />Link sent — check your inbox</> : "Resend activation link"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center py-6 text-center">
            <span className="grid size-14 place-items-center rounded-2xl bg-primary/10 text-primary">
              <Mail className="size-7" />
            </span>
            <h1 className="mt-6 font-heading text-2xl font-semibold tracking-tight text-on-surface">Check your email</h1>
            <p className="mt-2 text-sm leading-6 text-on-surface-variant">
              {email ? <>We sent an activation link to <strong className="text-on-surface">{email}</strong>.</> : <>We sent you an activation link.</>} Open it to activate your account, then sign in.
            </p>
            <form onSubmit={resend} className="mt-6 w-full space-y-3">
              <div className="space-y-2">
                 <Label htmlFor="verify-email-email">Email address</Label>
                 <Input id="verify-email-email" name="email" type="email" required value={email} onChange={(event) => { setEmail(event.target.value); setEmailError(""); }} placeholder="you@example.com" autoComplete="email" aria-invalid={emailError ? "true" : "false"} aria-describedby={emailError ? "verify-email-email-error" : undefined} />
                 {emailError ? <p id="verify-email-email-error" role="alert" className="text-xs text-error">{emailError}</p> : null}
              </div>
              <Button className="w-full" disabled={resending || resent || (rateLimitRemaining && rateLimitRemaining > 0)}>
                {resending ? <><Loader2 className="size-4 animate-spin" />Sending...</> : rateLimitRemaining && rateLimitRemaining > 0 ? `Resend activation link (${formatRemainingTime(rateLimitRemaining)})` : resent ? <><RotateCcw className="size-4" />Link sent — check your inbox</> : "Resend activation link"}
              </Button>
            </form>
            <p className="mt-6 text-center text-body-md text-on-surface-variant">Already activated? <Link href="/login" className="font-semibold text-primary hover:text-primary-container">Sign in</Link></p>
          </div>
        )}
      </section>
    </div>
  );
}
