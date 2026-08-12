"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Button, ErrorText, Input, Label } from "@/components/ui";
import { useAdminAuthStore } from "@/store/admin-auth-store";

const schema = z.object({
  email: z.string().email("Enter a valid admin email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  remember: z.boolean().optional(),
});

export default function AdminLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const admin = useAdminAuthStore((state) => state.admin);
  const ready = useAdminAuthStore((state) => state.hasHydrated);
  const login = useAdminAuthStore((state) => state.login);
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { email: "admin@zoelit.com", password: "admin123", remember: true } });

  useEffect(() => {
    if (ready && admin) router.replace("/admin");
  }, [ready, admin, router]);

  async function onSubmit(values) {
    try {
      await login(values.email, values.password, values.remember);
      toast.success("Admin access granted");
      router.push("/admin");
    } catch (error) {
      toast.error(error.message || "Admin sign in failed");
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white p-4 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(37,99,235,.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,.12)_1px,transparent_1px)] [background-size:34px_34px] dark:opacity-20" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,.16),transparent_34%),radial-gradient(circle_at_20%_80%,rgba(14,165,233,.12),transparent_28%)]" />
      <section className="relative z-10 w-full max-w-md rounded-lg border border-slate-200/70 bg-white/85 p-6 soft-shadow backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80">
        <div className="flex flex-col items-center pb-2 text-center">
          <Link href="/" className="mb-3 flex size-14 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 shadow-lg shadow-blue-600/10 dark:bg-blue-500/10 dark:text-blue-300">
            <ShieldCheck className="size-7" />
          </Link>
          <h1 className="font-heading text-h1 font-extrabold tracking-[-0.02em] text-slate-950 dark:text-white">ZoeLit Admin Login</h1>
          <p className="mt-2 text-body text-slate-500 dark:text-slate-400">Sign in to manage products, orders, customers, and store settings.</p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <div className="space-y-2">
            <Label>Admin Email</Label>
            <Input type="email" autoComplete="email" placeholder="admin@zoelit.com" {...form.register("email")} />
            <ErrorText>{form.formState.errors.email?.message}</ErrorText>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-4">
              <Label>Password</Label>
              <Link href="#" className="text-body font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400">Forgot password?</Link>
            </div>
            <div className="relative">
              <Input type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter admin password" className="pr-10" {...form.register("password")} />
              <button type="button" tabIndex={-1} onClick={() => setShowPassword((value) => !value)} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200" aria-label={showPassword ? "Hide password" : "Show password"}>
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            <ErrorText>{form.formState.errors.password?.message}</ErrorText>
          </div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-600 dark:text-slate-300">
            <input type="checkbox" className="size-4 rounded border-slate-300" {...form.register("remember")} /> Keep admin session active
          </label>
          <Button className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <><Loader2 className="size-4 animate-spin" />Signing in...</> : "Sign in to admin"}
          </Button>
        </form>
      </section>
    </div>
  );
}
