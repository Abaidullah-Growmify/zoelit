"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAuthStore } from "@/store/auth-store";
import { Button, Card, ErrorText, Input, Label } from "@/components/ui";

const schema = z.object({ email: z.string().email("Enter a valid email address"), password: z.string().min(6, "Password must be at least 6 characters"), remember: z.boolean().optional() });

export default function LoginPage() {
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
  return <Card className="w-full max-w-md"><Link href="/" className="text-2xl font-black"><span className="text-blue-600">Zoe</span>Lit</Link><h1 className="mt-8 text-3xl font-black">Sign in</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Access orders, addresses, wishlist, and checkout faster.</p><div className="mt-6 grid gap-3 sm:grid-cols-2"><Button variant="outline"><span className="font-black">G</span> Google</Button><Button variant="outline"><span className="font-black">GH</span> GitHub</Button></div><form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-5"><div><Label>Email</Label><Input type="email" autoComplete="email" {...form.register("email")} /><ErrorText>{form.formState.errors.email?.message}</ErrorText></div><div><div className="flex justify-between"><Label>Password</Label><Link href="#" className="text-sm font-bold text-blue-600">Forgot password?</Link></div><Input type="password" autoComplete="current-password" {...form.register("password")} /><ErrorText>{form.formState.errors.password?.message}</ErrorText></div><label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><input type="checkbox" className="size-4 rounded border-slate-300" {...form.register("remember")} /> Remember me</label><Button className="w-full" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <><Loader2 className="size-4 animate-spin" />Signing in...</> : "Sign in"}</Button></form><p className="mt-6 text-center text-sm text-slate-500">Don&apos;t have an account? <Link href="/register" className="font-bold text-blue-600">Register</Link></p></Card>;
}
