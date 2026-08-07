"use client";

import { Camera, Check, Eye, EyeOff, KeyRound, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { Button, Card, Input, Label } from "@/components/ui";
import { adminUser } from "@/lib/admin-data";

const accountSummary = [
  { label: "Member since", value: "Jan 12, 2026" },
  { label: "Last login", value: "Today, 9:42 AM" },
  { label: "Active sessions", value: "3 devices" },
];

export default function AdminProfilePage() {
  return (
    <div>
      <div className="grid items-stretch gap-6 xl:grid-cols-[360px_1fr]">
        <AdminIdentityCard />
        <div className="space-y-6">
          <AdminPersonalInfoCard />
          <AdminSecurityCard />
        </div>
      </div>
    </div>
  );
}

function AdminIdentityCard() {
  return (
    <Card className="h-full transition duration-150 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70 dark:hover:shadow-black/20">
      <AvatarEditor initials={adminUser.name.slice(0, 1)} label="Edit admin photo" />
      <h2 className="mt-5 text-h2 font-semibold">{adminUser.name}</h2>
      <p className="mt-1 text-body font-regular text-slate-500 dark:text-slate-400">{adminUser.email}</p>
      <div className="mt-4"><AdminStatusBadge>{adminUser.role}</AdminStatusBadge></div>
      <div className="mt-6 rounded-md bg-slate-50 p-4 ring-1 ring-slate-100 transition hover:bg-white dark:bg-slate-950 dark:ring-slate-800 dark:hover:bg-slate-900">
        <ShieldCheck className="size-6 text-blue-600 dark:text-blue-300" />
        <p className="mt-3 text-body font-semibold">Admin permissions</p>
        <p className="mt-1 text-meta font-regular leading-5 text-slate-500 dark:text-slate-400">Full UI access for products, orders, customers, inventory, and settings.</p>
      </div>
      <div className="mt-4 rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950">
        <p className="text-meta font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">Account summary</p>
        <div className="mt-4 space-y-3">
          {accountSummary.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3 text-body font-regular">
              <span className="text-slate-500 dark:text-slate-400">{item.label}</span>
              <strong className="text-right font-semibold text-slate-950 dark:text-white">{item.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function AdminPersonalInfoCard() {
  const [saved, setSaved] = useState(false);
  const form = useForm({ defaultValues: { name: adminUser.name, email: adminUser.email, phone: adminUser.phone } });

  function onSubmit(values) {
    setSaved(true);
    toast.success("Admin profile saved");
    form.reset(values);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <Card className="transition duration-150 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70 dark:hover:shadow-black/20">
      <div className="flex items-center gap-3"><UserRound className="size-5 text-blue-600" /><h2 className="text-h2 font-semibold">Personal info</h2></div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label="Name" name="name" form={form} autoComplete="name" />
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

function AdminSecurityCard() {
  const [saved, setSaved] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const form = useForm({ defaultValues: { currentPassword: "", newPassword: "" } });

  function onSubmit() {
    setSaved(true);
    toast.success("Admin password updated");
    form.reset({ currentPassword: "", newPassword: "" });
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <Card className="transition duration-150 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-slate-200/70 dark:hover:shadow-black/20">
      <div className="flex items-center gap-3"><KeyRound className="size-5 text-blue-600" /><h2 className="text-h2 font-semibold">Security</h2></div>
      <p className="mt-2 text-body font-regular leading-6 text-slate-500 dark:text-slate-400">Update the mock admin password controls. Real authentication can be connected later.</p>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 grid gap-4 md:grid-cols-2">
        <PasswordField label="Current password" name="currentPassword" form={form} autoComplete="current-password" placeholder="Current password" show={showCurrentPassword} onToggle={() => setShowCurrentPassword((value) => !value)} />
        <PasswordField label="New password" name="newPassword" form={form} autoComplete="new-password" placeholder="New password" show={showNewPassword} onToggle={() => setShowNewPassword((value) => !value)} />
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
    <button type="button" aria-label={label} className="group relative grid size-20 place-items-center overflow-hidden rounded-full bg-blue-50 font-heading text-h2 font-semibold text-blue-600 ring-1 ring-blue-100 transition hover:scale-[1.03] focus-visible:ring-4 focus-visible:ring-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300 dark:ring-blue-500/20">
      <span>{initials}</span>
      <span className="absolute inset-0 grid place-items-center bg-slate-950/65 text-white opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100"><Camera className="size-5" /></span>
    </button>
  );
}

function Field({ label, name, type = "text", form, autoComplete }) {
  return <div className="space-y-2"><Label>{label}</Label><Input type={type} autoComplete={autoComplete} {...form.register(name)} /></div>;
}

function PasswordField({ label, name, form, autoComplete, placeholder, show, onToggle }) {
  return <div className="space-y-2"><Label>{label}</Label><div className="relative"><Input type={show ? "text" : "password"} autoComplete={autoComplete} placeholder={placeholder} className="pr-10" {...form.register(name)} /><button type="button" tabIndex={-1} onClick={onToggle} className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 transition hover:text-slate-700 dark:hover:text-slate-200" aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></div>;
}

function SavedState({ show, label }) {
  if (!show) return null;
  return <span className="inline-flex items-center gap-1.5 text-body font-semibold text-emerald-600 dark:text-emerald-300"><Check className="size-4" />{label}</span>;
}
