"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, UserRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAuthStore } from "@/store/auth-store";
import { Button, ErrorText, Input, Label } from "@/components/ui";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

export function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const user = useAuthStore((state) => state.user);
  const ready = useAuthStore((state) => state.hasHydrated);
  const login = useAuthStore((state) => state.login);
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: { email: "avery@example.com", password: "password123", remember: true },
  });

  useEffect(() => {
    if (ready && user) router.replace(params.get("next") || "/dashboard");
  }, [ready, user, router, params]);

  async function onSubmit(values) {
    try {
      await login(values.email, values.password, values.remember);
      toast.success("Welcome back");
      router.push(params.get("next") || "/dashboard");
    } catch (error) {
      toast.error(error.message || "Sign in failed");
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgb(0_63_177_/_0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgb(0_63_177_/_0.12)_1px,transparent_1px)] [background-size:34px_34px]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgb(0_63_177_/_0.16),transparent_34%),radial-gradient(circle_at_20%_80%,rgb(26_86_219_/_0.12),transparent_28%)]" />
      <section className="relative z-10 w-full max-w-md rounded-2xl border border-outline-variant bg-surface/90 p-6 shadow-xl backdrop-blur-xl">
        <div className="flex flex-col items-center pb-2 text-center">
          <Link href="/" className="mb-3 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <UserRound className="size-6" />
          </Link>
          <h1 className="font-heading text-2xl font-semibold tracking-tight text-on-surface">Welcome back</h1>
          <p className="mt-2 text-sm text-on-surface-variant">Sign in to your shopping account.</p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <div className="space-y-2">
            <Label>Email</Label>
            <Input type="email" autoComplete="email" placeholder="you@example.com" {...form.register("email")} />
            <ErrorText>{form.formState.errors.email?.message}</ErrorText>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <Label>Password</Label>
               <Link href="/forgot-password" className="text-body-md font-semibold text-primary hover:text-primary-container">Forgot password?</Link>
            </div>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter password" className="pr-10" {...form.register("password")} />
              <button type="button" tabIndex={-1} onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-on-surface-variant transition hover:text-on-surface" aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <ErrorText>{form.formState.errors.password?.message}</ErrorText>
          </div>
          <label className="flex items-center gap-2 text-body-md text-on-surface-variant">
            <input type="checkbox" className="size-4 rounded border-outline-variant" {...form.register("remember")} /> Keep me signed in
          </label>
          <Button className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <><Loader2 className="size-4 animate-spin" />Signing in...</> : "Sign in"}
          </Button>
        </form>
        <p className="mt-6 text-center text-body-md text-on-surface-variant">Need a ZoeLit account? <Link href="/register" className="font-semibold text-primary hover:text-primary-container">Create account</Link></p>
      </section>
    </div>
  );
}
