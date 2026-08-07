"use client";

import { CalendarDays, Camera, Check, Eye, EyeOff, Heart, KeyRound, ShoppingBag, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { AdminStatCard } from "@/components/admin-stat-card";
import { Button, Card, Input, Label } from "@/components/ui";
import { customer, orders } from "@/lib/data";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  return (
    <div>
      <div className="grid gap-4 md:grid-cols-3">
        <AdminStatCard label="Member Since" value="Jan 2026" icon={CalendarDays} helper="ZoeLit account" tone="blue" />
        <AdminStatCard label="Total Orders" value={orders.length} icon={ShoppingBag} helper="Lifetime purchases" tone="green" />
        <AdminStatCard label="Wishlist Items" value="8" icon={Heart} helper="Saved for later" tone="pink" />
      </div>
      <div className="mt-6 grid items-stretch gap-6 xl:grid-cols-[320px_1fr]">
        <CustomerIdentityCard />
        <div className="space-y-6">
          <CustomerPersonalInfoCard />
          <CustomerSecurityCard />
        </div>
      </div>
    </div>
  );
}

function CustomerIdentityCard() {
  return (
    <Card className="h-full transition duration-150 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70 dark:hover:shadow-black/20">
      <AvatarEditor initials="AS" label="Edit profile photo" />
      <h2 className="mt-5 text-2xl font-bold">{customer.name}</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{customer.email}</p>
      <div className="mt-6 rounded-lg bg-gradient-to-br from-blue-50 to-slate-50 p-4 ring-1 ring-blue-100/70 dark:from-blue-500/10 dark:to-slate-950 dark:ring-blue-500/20">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-300">Account status</p>
        <p className="mt-2 text-sm font-bold text-slate-950 dark:text-white">Active customer</p>
        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">Mock account details stay local until real authentication is connected.</p>
      </div>
    </Card>
  );
}

function CustomerPersonalInfoCard() {
  const [saved, setSaved] = useState(false);
  const form = useForm({ defaultValues: { name: customer.name, email: customer.email, phone: customer.phone } });

  function onSubmit(values) {
    setSaved(true);
    toast.success("Profile changes saved");
    form.reset(values);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <Card className="transition duration-150 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70 dark:hover:shadow-black/20">
      <div className="flex items-center gap-3"><UserRound className="size-5 text-blue-600" /><h2 className="text-xl font-bold">Personal info</h2></div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label="Full Name" name="name" form={form} autoComplete="name" />
        <Field label="Email" name="email" type="email" form={form} autoComplete="email" />
        <Field label="Phone" name="phone" form={form} autoComplete="tel" />
        <div className="flex items-center gap-3 border-t border-slate-100 pt-5 md:col-span-2 dark:border-slate-800">
          <Button disabled={!form.formState.isDirty}>Save</Button>
          <SavedState show={saved} label="Saved" />
        </div>
      </form>
    </Card>
  );
}

function CustomerSecurityCard() {
  const [saved, setSaved] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const form = useForm({ defaultValues: { currentPassword: "", newPassword: "" } });
  const newPassword = useWatch({ control: form.control, name: "newPassword" });

  function onSubmit() {
    setSaved(true);
    toast.success("Password updated");
    form.reset({ currentPassword: "", newPassword: "" });
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <Card className="transition duration-150 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70 dark:hover:shadow-black/20">
      <div className="flex items-center gap-3"><KeyRound className="size-5 text-blue-600" /><h2 className="text-xl font-bold">Security</h2></div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 grid gap-4 md:grid-cols-2">
        <PasswordField label="Current Password" name="currentPassword" form={form} autoComplete="current-password" show={showCurrentPassword} onToggle={() => setShowCurrentPassword((value) => !value)} />
        <div>
          <PasswordField label="New Password" name="newPassword" form={form} autoComplete="new-password" show={showNewPassword} onToggle={() => setShowNewPassword((value) => !value)} />
          <PasswordStrength password={newPassword} />
        </div>
        <div className="flex items-center gap-3 border-t border-slate-100 pt-5 md:col-span-2 dark:border-slate-800">
          <Button variant="outline" disabled={!form.formState.isDirty}>Update</Button>
          <SavedState show={saved} label="Saved" />
        </div>
      </form>
    </Card>
  );
}

function AvatarEditor({ initials, label }) {
  return (
    <button type="button" aria-label={label} className="group relative grid size-24 place-items-center overflow-hidden rounded-lg bg-blue-100 text-2xl font-extrabold text-blue-700 ring-1 ring-blue-200 transition hover:scale-[1.03] focus-visible:ring-4 focus-visible:ring-blue-500/20 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/20">
      <span>{initials}</span>
      <span className="absolute inset-0 grid place-items-center bg-slate-950/65 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100"><Camera className="size-5" /></span>
    </button>
  );
}

function Field({ label, name, type = "text", form, autoComplete }) {
  return <div className="space-y-2"><Label>{label}</Label><Input type={type} autoComplete={autoComplete} {...form.register(name)} /></div>;
}

function PasswordField({ label, name, form, autoComplete, show, onToggle }) {
  return <div className="space-y-2"><Label>{label}</Label><div className="relative"><Input type={show ? "text" : "password"} autoComplete={autoComplete} className="pr-10" {...form.register(name)} /><button type="button" tabIndex={-1} onClick={onToggle} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200" aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></div>;
}

function PasswordStrength({ password = "" }) {
  const score = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  const strength = score >= 3 ? "strong" : score >= 2 ? "medium" : "weak";
  const label = password ? strength : "weak";
  const activeBars = password ? (strength === "strong" ? 3 : strength === "medium" ? 2 : 1) : 0;

  return (
    <div className="mt-3">
      <div className="flex gap-1.5" aria-hidden="true">
        {[1, 2, 3].map((bar) => (
          <span key={bar} className={cn("h-1.5 flex-1 rounded-lg bg-slate-200 transition dark:bg-slate-800", bar <= activeBars && strength === "weak" && "bg-rose-500", bar <= activeBars && strength === "medium" && "bg-amber-500", bar <= activeBars && strength === "strong" && "bg-emerald-500")} />
        ))}
      </div>
      <p className="mt-1.5 text-xs font-bold capitalize text-slate-500 dark:text-slate-400">Strength: {label}</p>
    </div>
  );
}

function SavedState({ show, label }) {
  if (!show) return null;
  return <span className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-600 dark:text-emerald-300"><Check className="size-4" />{label}</span>;
}
