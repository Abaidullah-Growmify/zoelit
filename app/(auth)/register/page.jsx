"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAuthStore } from "@/store/auth-store";
import { Button, ErrorText, Input, Label } from "@/components/ui";

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
  const router = useRouter();
  const registerUser = useAuthStore((state) => state.register);
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", password: "", confirmPassword: "", terms: false } });
  async function onSubmit(values) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    registerUser(values.name, values.email);
    toast.success("Account created successfully");
    router.push("/dashboard");
  }
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-white p-4 dark:bg-slate-950">
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(to_right,rgba(37,99,235,.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(37,99,235,.12)_1px,transparent_1px)] [background-size:34px_34px] dark:opacity-20" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(37,99,235,.16),transparent_34%),radial-gradient(circle_at_20%_80%,rgba(14,165,233,.12),transparent_28%)]" />
      <section className="relative z-10 w-full max-w-md rounded-xl border border-slate-200/70 bg-white/85 p-6 shadow-2xl shadow-slate-900/10 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/80">
        <div className="flex flex-col items-center pb-2 text-center">
          <Link href="/" className="mb-3 flex size-14 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600 shadow-lg shadow-blue-600/10 dark:bg-blue-500/10 dark:text-blue-300">
            <UserPlus className="size-7" />
          </Link>
          <h1 className="text-2xl font-black tracking-tight text-blue-700 dark:text-blue-300">Create ZoeLit Account</h1>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Set up your shopping account.</p>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
          <Field label="Full name" name="name" form={form} autoComplete="name" placeholder="Avery Stone" />
          <Field label="Email" name="email" type="email" form={form} autoComplete="email" placeholder="you@example.com" />
          <PasswordField label="Password" name="password" form={form} autoComplete="new-password" placeholder="Create password" show={showPassword} onToggle={() => setShowPassword((value) => !value)} />
          <PasswordField label="Confirm password" name="confirmPassword" form={form} autoComplete="new-password" placeholder="Confirm password" show={showConfirmPassword} onToggle={() => setShowConfirmPassword((value) => !value)} />
          <div>
            <label className="flex items-start gap-2 text-[13px] font-medium leading-5 text-slate-600 dark:text-slate-300">
              <input type="checkbox" className="mt-0.5 size-4 rounded border-slate-300" {...form.register("terms")} />
              <span>I agree to the Terms & Conditions and Privacy Policy.</span>
            </label>
            <ErrorText>{form.formState.errors.terms?.message}</ErrorText>
          </div>
          <Button className="h-10 w-full rounded-lg bg-blue-700 text-white shadow-sm transition active:scale-[0.98] dark:bg-blue-600" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <><Loader2 className="size-4 animate-spin" />Creating account...</> : "Create account"}
          </Button>
        </form>
        <p className="mt-6 text-center text-[13px] text-slate-500 dark:text-slate-400">Already registered? <Link href="/login" className="font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400">Sign in</Link></p>
      </section>
    </div>
  );
}

function Field({ label, name, type = "text", form, autoComplete, placeholder }) {
  return <div className="space-y-2"><Label>{label}</Label><Input type={type} autoComplete={autoComplete} placeholder={placeholder} className="h-10 rounded-lg bg-white text-[13px] shadow-sm dark:bg-slate-950" {...form.register(name)} /><ErrorText>{form.formState.errors[name]?.message}</ErrorText></div>;
}

function PasswordField({ label, name, form, autoComplete, placeholder, show, onToggle }) {
  return <div className="space-y-2"><Label>{label}</Label><div className="relative"><Input type={show ? "text" : "password"} autoComplete={autoComplete} placeholder={placeholder} className="h-10 rounded-lg bg-white pr-10 text-[13px] shadow-sm dark:bg-slate-950" {...form.register(name)} /><button type="button" tabIndex={-1} onClick={onToggle} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200" aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div><ErrorText>{form.formState.errors[name]?.message}</ErrorText></div>;
}
