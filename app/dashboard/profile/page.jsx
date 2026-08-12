"use client";

import { CalendarDays, Camera, Check, Eye, EyeOff, Heart, KeyRound, ShoppingBag, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import * as api from "@/lib/api";
import { useAuthStore } from "@/store/auth-store";
import { AdminStatCard } from "@/components/admin-stat-card";
import { Button, Card, Input, Label } from "@/components/ui";
import { DashboardPageHeader } from "@/components/dashboard-page-header";
import { ProfileSkeleton } from "@/components/skeletons";
import { cn } from "@/lib/utils";

export default function ProfilePage() {
  const token = useAuthStore((state) => state.token);
  const user = useAuthStore((state) => state.user);
  const setUser = useAuthStore((state) => state.setUser);
  const [ordersCount, setOrdersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    if (!token) return;
    Promise.all([
      api.getProfile(token),
      api.getOrders(token).catch(() => ({ orders: [] })),
    ])
      .then(([profileRes, ordersRes]) => {
        if (!active) return;
        setUser(profileRes.user);
        setOrdersCount(ordersRes.orders.length);
        setLoading(false);
      })
      .catch(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [token, setUser]);

  if (loading) return <ProfileSkeleton />;

  const profileUser = user || { name: "", email: "", phone: "" };

  return (
    <div>
      <DashboardPageHeader
        title="My Profile"
        description="Manage your personal details, password, and saved preferences."
      />
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <AdminStatCard label="Member Since" value="ZoeLit member" icon={CalendarDays} helper="Registered account" tone="blue" />
        <AdminStatCard label="Total Orders" value={ordersCount} icon={ShoppingBag} helper="Lifetime purchases" tone="green" />
        <AdminStatCard label="Wishlist Items" value="8" icon={Heart} helper="Saved for later" tone="pink" />
      </div>
      <div className="mt-6 grid items-stretch gap-6 xl:grid-cols-[320px_1fr]">
        <CustomerIdentityCard user={profileUser} />
        <div className="space-y-6">
          <CustomerPersonalInfoCard user={profileUser} />
          <CustomerSecurityCard />
        </div>
      </div>
    </div>
  );
}

function CustomerIdentityCard({ user }) {
  return (
    <Card className="h-full transition duration-150 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70 dark:hover:shadow-black/20">
      <AvatarEditor initials={getInitials(user.name)} label="Edit profile photo" />
      <h2 className="mt-5 font-heading text-h2 font-semibold">{user.name}</h2>
      <p className="mt-1 text-body font-regular text-slate-500 dark:text-slate-400">{user.email}</p>
      <div className="mt-6 rounded-md bg-gradient-to-br from-blue-50 to-slate-50 p-4 ring-1 ring-blue-100/70 dark:from-blue-500/10 dark:to-slate-950 dark:ring-blue-500/20">
        <p className="text-meta font-semibold uppercase tracking-[0.14em] text-blue-600 dark:text-blue-300">Account status</p>
        <p className="mt-2 text-body font-semibold text-slate-950 dark:text-white">Active customer</p>
        <p className="mt-1 text-meta font-regular leading-5 text-slate-500 dark:text-slate-400">Signed in with your ZoeLit account.</p>
      </div>
    </Card>
  );
}

function CustomerPersonalInfoCard({ user }) {
  const token = useAuthStore((state) => state.token);
  const setUser = useAuthStore((state) => state.setUser);
  const [saved, setSaved] = useState(false);
  const form = useForm({ defaultValues: { name: user.name, email: user.email, phone: user.phone } });

  useEffect(() => {
    form.reset({ name: user.name, email: user.email, phone: user.phone });
  }, [user.name, user.email, user.phone, form]);

  async function onSubmit(values) {
    try {
      const res = await api.updateProfile(values, token);
      setUser(res.user);
      setSaved(true);
      toast.success("Profile changes saved");
      form.reset(values);
      window.setTimeout(() => setSaved(false), 1800);
    } catch (error) {
      toast.error(error.message || "Could not save profile");
    }
  }

  return (
    <Card className="transition duration-150 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70 dark:hover:shadow-black/20">
      <div className="flex items-center gap-3"><UserRound className="size-5 text-blue-600" /><h2 className="font-heading text-h2 font-semibold">Personal info</h2></div>
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
  const token = useAuthStore((state) => state.token);
  const [saved, setSaved] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const form = useForm({ defaultValues: { currentPassword: "", newPassword: "" } });
  const newPassword = useWatch({ control: form.control, name: "newPassword" });

  async function onSubmit() {
    try {
      await api.updatePassword({ currentPassword: form.getValues("currentPassword"), newPassword: form.getValues("newPassword") }, token);
      setSaved(true);
      toast.success("Password updated");
      form.reset({ currentPassword: "", newPassword: "" });
      window.setTimeout(() => setSaved(false), 1800);
    } catch (error) {
      toast.error(error.message || "Could not update password");
    }
  }

  return (
    <Card className="transition duration-150 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70 dark:hover:shadow-black/20">
      <div className="flex items-center gap-3"><KeyRound className="size-5 text-blue-600" /><h2 className="font-heading text-h2 font-semibold">Security</h2></div>
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
    <button type="button" aria-label={label} className="group relative grid size-24 place-items-center overflow-hidden rounded-full bg-blue-100 text-h2 font-semibold text-blue-700 ring-1 ring-blue-200 transition hover:scale-[1.03] focus-visible:ring-4 focus-visible:ring-blue-500/20 dark:bg-blue-500/15 dark:text-blue-300 dark:ring-blue-500/20">
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
          <span key={bar} className={cn("h-1.5 flex-1 rounded-full bg-slate-200 transition dark:bg-slate-800", bar <= activeBars && strength === "weak" && "bg-rose-500", bar <= activeBars && strength === "medium" && "bg-amber-500", bar <= activeBars && strength === "strong" && "bg-emerald-500")} />
        ))}
      </div>
      <p className="mt-1.5 text-meta font-semibold capitalize text-slate-500 dark:text-slate-400">Strength: {label}</p>
    </div>
  );
}

function SavedState({ show, label }) {
  if (!show) return null;
  return <span className="inline-flex items-center gap-1.5 text-body font-semibold text-emerald-600 dark:text-emerald-300"><Check className="size-4" />{label}</span>;
}

function getInitials(name = "ZoeLit Customer") {
  return name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}
