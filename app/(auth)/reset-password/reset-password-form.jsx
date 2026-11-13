"use client";

import Link from "next/link";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { Button, Card, Input, Label } from "@/components/ui";
import { RateLimitAlert } from "@/components/rate-limit-alert";
import { formatRemainingTime, getRateLimitMessage, parseRetryAfter } from "@/lib/rate-limit-helper";
import { resetAdminPassword, resetPassword } from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { useAdminAuthStore } from "@/store/admin-auth-store";

export default function ResetPasswordForm({ isAdmin: forcedAdmin = false } = {}) {
  const params = useSearchParams();
  const router = useRouter();
  const clearSession = useAuthStore((state) => state.clearSession);
  const forceAdminLogout = useAdminAuthStore((state) => state.forceLogout);
  const isAdmin = forcedAdmin || params.get("scope") === "admin";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
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
    if (!params.get("token")) return setError("This reset link is invalid or expired.");
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) return setError("Use a password with 8 characters, one uppercase letter, and one number");
    if (password !== confirm) return setError("Passwords do not match.");
    setLoading(true);
    try {
      await (isAdmin ? resetAdminPassword({ token: params.get("token"), password }) : resetPassword({ token: params.get("token"), password }));
      clearSession();
      forceAdminLogout();
      router.replace(isAdmin ? "/admin/login?reset=success" : "/login?reset=success");
    } catch (resetError) {
      if (resetError.status === 429) {
        const retryAfter = parseRetryAfter(resetError);
        setRateLimitRemaining(retryAfter);
        setError("You made too many requests, so your access was temporarily limited. Please wait before trying again.");
      } else {
        setError(resetError.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-background px-4 py-8 text-on-surface sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-outline-variant bg-surface shadow-xl">
        <header className="flex items-center justify-between border-b border-outline-variant px-6 py-5 sm:px-10">
          <Link href="/"><BrandLogo variant="light" className="w-36" priority /></Link>
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">Account security</span>
        </header>
        <div className="grid flex-1 lg:grid-cols-[0.9fr_1.1fr]">
          <aside className="hidden bg-primary p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <ShieldCheck className="size-10" />
              <h1 className="mt-8 font-heading text-4xl font-semibold leading-tight">Choose a stronger password.</h1>
              <p className="mt-5 max-w-sm text-sm leading-7 text-white/75">Use a password you have not used elsewhere to keep your ZoeLit account protected.</p>
            </div>
            <p className="text-xs text-white/60">Your reset link is valid for 15 minutes.</p>
          </aside>
          <section className="flex items-center p-6 sm:p-12">
            <Card className="w-full border-0 p-0 shadow-none">
              <div className="mb-8 grid size-12 place-items-center bg-primary/10 text-primary"><LockKeyhole className="size-5" /></div>
               <h2 className="font-heading text-3xl font-semibold tracking-tight">{isAdmin ? "Create a new admin password" : "Create a new password"}</h2>
              <p className="mt-3 text-sm leading-6 text-on-surface-variant">Enter and confirm your new password below. Your previous password will stop working immediately.</p>
              <form onSubmit={submit} className="mt-8 space-y-5">
                <div>
                   <Label htmlFor="reset-password">New password</Label>
                  <div className="relative mt-2">
                     <Input id="reset-password" name="password" className="pr-11" type={showPassword ? "text" : "password"} autoComplete="new-password" required minLength={8} value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={error ? "true" : "false"} aria-describedby={error ? "reset-password-error" : undefined} />
                    <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-on-surface-variant">At least 8 characters, including one uppercase letter and one number.</p>
                </div>
                <div>
                   <Label htmlFor="reset-confirm-password">Confirm password</Label>
                  <div className="relative mt-2">
                     <Input id="reset-confirm-password" name="confirmPassword" className="pr-11" type={showConfirm ? "text" : "password"} autoComplete="new-password" required minLength={8} value={confirm} onChange={(event) => setConfirm(event.target.value)} aria-invalid={error ? "true" : "false"} aria-describedby={error ? "reset-password-error" : undefined} />
                    <button type="button" onClick={() => setShowConfirm((value) => !value)} className="absolute right-3 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-label={showConfirm ? "Hide confirmation password" : "Show confirmation password"}>{showConfirm ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button>
                  </div>
                </div>
                 {error ? <p id="reset-password-error" role="alert" className="text-sm font-medium text-error">{error}</p> : null}
                {rateLimitRemaining && rateLimitRemaining > 0 && (
                  <RateLimitAlert
                    retryAfter={rateLimitRemaining}
                    message="Too many attempts"
                    className="mt-4 mb-2"
                  />
                )}
                <Button type="submit" disabled={loading || (rateLimitRemaining && rateLimitRemaining > 0)} className="w-full">{loading ? "Updating password..." : rateLimitRemaining && rateLimitRemaining > 0 ? `Update password (${formatRemainingTime(rateLimitRemaining)})` : "Update password"}</Button>
              </form>
               <Link href={isAdmin ? "/admin/login" : "/login"} className="mt-6 inline-block text-sm font-semibold text-primary hover:underline">Back to sign in</Link>
            </Card>
          </section>
        </div>
      </div>
    </main>
  );
}
