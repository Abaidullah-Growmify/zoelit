"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { useRouter } from "nextjs-toploader/app";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAuthStore } from "@/store/auth-store";
import { ErrorText, Input, Label } from "@/components/ui";
import { RateLimitAlert, RateLimitButton } from "@/components/rate-limit-alert";
import { parseRetryAfter } from "@/lib/rate-limit-helper";

const schema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters").regex(/[A-Z]/, "Add one uppercase letter").regex(/[0-9]/, "Add one number"),
  confirmPassword: z.string(),
  terms: z.literal(true, { error: "Accept the terms to continue" }),
}).refine((data) => data.password === data.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rateLimitRemaining, setRateLimitRemaining] = useState(null);
  const router = useRouter();
  const registerUser = useAuthStore((state) => state.register);
  const user = useAuthStore((state) => state.user);
  const ready = useAuthStore((state) => state.hasHydrated);
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", password: "", confirmPassword: "", terms: false } });
  useEffect(() => {
    if (ready && user) router.replace("/dashboard");
  }, [ready, user, router]);

  useEffect(() => {
    if (!rateLimitRemaining || rateLimitRemaining <= 0) return;
    const timer = setTimeout(() => setRateLimitRemaining(null), rateLimitRemaining * 1000);
    return () => clearTimeout(timer);
  }, [rateLimitRemaining]);

  async function onSubmit(values) {
    try {
      await registerUser({ name: values.name, email: values.email, password: values.password, confirmPassword: values.confirmPassword, terms: values.terms });
      toast.success("Account created. Check your email to activate it.");
      setRateLimitRemaining(null);
      router.push("/login");
    } catch (error) {
      if (error.status === 429) {
        const retryAfter = parseRetryAfter(error);
        setRateLimitRemaining(retryAfter);
        // No toast — show message below the button instead
      } else {
        toast.error(error.message || "Registration failed");
      }
    }
  }
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgb(0_63_177_/_0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgb(0_63_177_/_0.12)_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(0_63_177_/_0.16),transparent_34%),radial-gradient(circle_at_20%_80%,rgb(26_86_219_/_0.12),transparent_28%)]" />
      <section className="relative z-10 w-full max-w-md rounded-2xl border border-outline-variant bg-surface/90 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col items-center pb-2 text-center">
          <Link href="/" aria-label="Back to ZoeLit homepage" className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UserPlus className="size-6" />
          </Link>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-on-surface">Create account</h1>
          <p className="mt-2 text-sm text-on-surface-variant">Set up your shopping account.</p>
        </div>
        {rateLimitRemaining && (
          <RateLimitAlert
            retryAfter={rateLimitRemaining}
            message="Too many attempts"
            className="mt-4 mb-2"
          />
        )}
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
           <Field label="Full name" name="name" id="register-name" form={form} autoComplete="name" placeholder="Avery Stone" />
           <Field label="Email" name="email" id="register-email" type="email" form={form} autoComplete="email" placeholder="you@example.com" />
           <PasswordField label="Password" name="password" id="register-password" form={form} autoComplete="new-password" placeholder="Create password" show={showPassword} onToggle={() => setShowPassword((value) => !value)} />
           <PasswordField label="Confirm password" name="confirmPassword" id="register-confirm-password" form={form} autoComplete="new-password" placeholder="Confirm password" show={showConfirmPassword} onToggle={() => setShowConfirmPassword((value) => !value)} />
           <div>
              <label htmlFor="register-terms" className="flex items-start gap-2 text-sm font-normal leading-5 text-on-surface-variant">
               <input id="register-terms" type="checkbox" className="mt-0.5 size-4 rounded border-outline-variant" {...form.register("terms")} aria-invalid={form.formState.errors.terms ? "true" : "false"} aria-describedby={form.formState.errors.terms ? "register-terms-error" : undefined} />
               <span>I agree to the Terms & Conditions and Privacy Policy.</span>
             </label>
             <ErrorText id="register-terms-error">{form.formState.errors.terms?.message}</ErrorText>
          </div>
          <RateLimitButton
            type="submit"
            retryAfter={rateLimitRemaining}
            className="w-full"
          >
            {form.formState.isSubmitting ? <><Loader2 className="size-4 animate-spin" />Creating account...</> : "Create account"}
          </RateLimitButton>
        </form>
         <p className="mt-6 text-center text-sm text-on-surface-variant">Already registered? <Link href="/login" className="font-semibold text-primary hover:text-primary-container">Sign in</Link></p>
      </section>
    </div>
  );
}

function Field({ label, name, id, type = "text", form, autoComplete, placeholder }) {
  const errorId = `${id}-error`;
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><Input id={id} type={type} autoComplete={autoComplete} placeholder={placeholder} {...form.register(name)} aria-invalid={form.formState.errors[name] ? "true" : "false"} aria-describedby={form.formState.errors[name] ? errorId : undefined} /><ErrorText id={errorId}>{form.formState.errors[name]?.message}</ErrorText></div>;
}

function PasswordField({ label, name, id, form, autoComplete, placeholder, show, onToggle }) {
  const errorId = `${id}-error`;
  return <div className="space-y-2"><Label htmlFor={id}>{label}</Label><div className="relative"><Input id={id} type={show ? "text" : "password"} autoComplete={autoComplete} placeholder={placeholder} className="pr-10" {...form.register(name)} aria-invalid={form.formState.errors[name] ? "true" : "false"} aria-describedby={form.formState.errors[name] ? errorId : undefined} /><button type="button" tabIndex={-1} onClick={onToggle} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200" aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div><ErrorText id={errorId}>{form.formState.errors[name]?.message}</ErrorText></div>;
}
