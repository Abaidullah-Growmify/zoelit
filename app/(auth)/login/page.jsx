"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, UserRound } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAuthStore } from "@/store/auth-store";
import { Button, ErrorText, Input, Label } from "@/components/ui";

const schema = z.object({ email: z.string().email("Enter a valid email address"), password: z.string().min(6, "Password must be at least 6 characters"), remember: z.boolean().optional() });

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const login = useAuthStore((state) => state.login);
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: "avery@example.com", password: "password123", remember: true } });
  async function onSubmit(values) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    login(values.email);
    toast.success("Welcome back");
    router.push(params.get("next") || "/dashboard");
  }
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white p-4 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(37,99,235,.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,.12)_1px,transparent_1px)] [background-size:34px_34px] dark:opacity-20" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,.16),transparent_34%),radial-gradient(circle_at_20%_80%,rgba(14,165,233,.12),transparent_28%)]" />
      <section className="relative z-10 w-full max-w-md rounded-lg border border-slate-200/70 bg-white/85 p-6 soft-shadow backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80">
        <div className="flex flex-col items-center pb-2 text-center">
          <Link href="/" className="mb-3 flex size-14 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 shadow-lg shadow-blue-600/10 dark:bg-blue-500/10 dark:text-blue-300">
            <UserRound className="size-7" />
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">ZoeLit Login</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Sign in to your shopping account.</p>
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
              <Link href="#" className="text-sm font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400">Forgot password?</Link>
            </div>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter password" className="pr-10" {...form.register("password")} />
              <button type="button" tabIndex={-1} onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200" aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <ErrorText>{form.formState.errors.password?.message}</ErrorText>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            <input type="checkbox" className="size-4 rounded border-slate-300" {...form.register("remember")} /> Keep me signed in
          </label>
          <Button className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <><Loader2 className="size-4 animate-spin" />Signing in...</> : "Sign in"}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">Need a ZoeLit account? <Link href="/register" className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400">Create account</Link></p>
      </section>
    </div>
  );
}
