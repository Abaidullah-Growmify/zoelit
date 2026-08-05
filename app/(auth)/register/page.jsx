"use client";

import Link from "next/link";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { useAuthStore } from "@/store/auth-store";
import { Button, Card, ErrorText, Input, Label } from "@/components/ui";

const schema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("Enter a valid email address"),
  password: z.string().min(8, "Use at least 8 characters").regex(/[A-Z]/, "Add one uppercase letter").regex(/[0-9]/, "Add one number"),
  confirmPassword: z.string(),
  terms: z.literal(true, { error: "Accept the terms to continue" }),
}).refine((data) => data.password === data.confirmPassword, { path: ["confirmPassword"], message: "Passwords do not match" });

export default function RegisterPage() {
  const router = useRouter();
  const registerUser = useAuthStore((state) => state.register);
  const form = useForm({ resolver: zodResolver(schema), defaultValues: { name: "", email: "", password: "", confirmPassword: "", terms: false } });
  async function onSubmit(values) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    registerUser(values.name, values.email);
    toast.success("Account created successfully");
    router.push("/dashboard");
  }
  return <Card className="w-full max-w-lg"><Link href="/" className="text-2xl font-black"><span className="text-blue-600">Zoe</span>Lit</Link><h1 className="mt-8 text-3xl font-black">Create your account</h1><p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Join a secure shopping experience with order tracking and saved addresses.</p><form onSubmit={form.handleSubmit(onSubmit)} className="mt-7 grid gap-5 md:grid-cols-2"><Field label="Full name" name="name" form={form} className="md:col-span-2" /><Field label="Email" name="email" type="email" form={form} className="md:col-span-2" /><Field label="Password" name="password" type="password" form={form} /><Field label="Confirm password" name="confirmPassword" type="password" form={form} /><label className="md:col-span-2 flex items-start gap-2 text-sm text-slate-600 dark:text-slate-300"><input type="checkbox" className="mt-1 size-4" {...form.register("terms")} /> I agree to the Terms & Conditions and Privacy Policy.</label><ErrorText>{form.formState.errors.terms?.message}</ErrorText><Button className="md:col-span-2" disabled={form.formState.isSubmitting}>{form.formState.isSubmitting ? <><Loader2 className="size-4 animate-spin" />Creating account...</> : "Create Account"}</Button></form><p className="mt-6 text-center text-sm text-slate-500">Already have an account? <Link href="/login" className="font-bold text-blue-600">Login</Link></p></Card>;
}

function Field({ label, name, type = "text", form, className }) {
  return <div className={className}><Label>{label}</Label><Input type={type} {...form.register(name)} /><ErrorText>{form.formState.errors[name]?.message}</ErrorText></div>;
}
