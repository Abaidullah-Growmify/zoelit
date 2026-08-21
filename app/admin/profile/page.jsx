"use client";

import { Camera, Check, Eye, EyeOff, KeyRound, ShieldCheck, UserRound } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { AdminStatusBadge } from "@/components/admin-status-badge";
import { Button, Card, Input, Label } from "@/components/ui";
import { useAdminAuthStore } from "@/store/admin-auth-store";

export default function AdminProfilePage() {
  const admin = useAdminAuthStore((state) => state.admin);
  const fallback = { name: "ZoeLit Admin", email: "admin@zoelit.com", role: "admin", phone: "" };
  const adminInfo = { ...fallback, ...(admin || {}) };

  return (
    <div>
      <div className="grid items-stretch gap-6 xl:grid-cols-[360px_1fr]">
        <AdminIdentityCard admin={adminInfo} />
        <div className="space-y-6">
          <AdminPersonalInfoCard admin={adminInfo} />
          <AdminSecurityCard />
        </div>
      </div>
    </div>
  );
}

function AdminIdentityCard({ admin }) {
  const accountSummary = [
    { label: "Role", value: "Store admin" },
    { label: "Email", value: admin.email || "—" },
  ];
  return (
    <Card className="h-full transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_26px_58px_-16px_rgb(0_63_177_/_0.12)] hover:shadow-primary/10 dark:hover:shadow-black/20">
      <AvatarEditor initials={admin.name.slice(0, 1)} label="Edit admin photo" />
      <h2 className="mt-5 font-heading text-headline-md font-semibold tracking-[-0.02em] text-on-surface">{admin.name}</h2>
      <p className="mt-1 text-body-md font-normal text-on-surface-variant">{admin.email}</p>
      <div className="mt-4"><AdminStatusBadge>{admin.role}</AdminStatusBadge></div>
      <div className="mt-6 rounded-md bg-surface-container-low p-4 ring-1 ring-outline-variant/70 transition hover:bg-surface-container-lowest">
        <ShieldCheck className="size-6 text-primary" />
        <p className="mt-3 text-body-md font-semibold text-on-surface">Admin permissions</p>
        <p className="mt-1 text-meta font-normal leading-5 text-on-surface-variant">Full UI access for products, orders, customers, inventory, and settings.</p>
      </div>
      <div className="mt-4 rounded-md border border-outline-variant bg-surface-container-lowest p-4">
        <p className="text-meta font-semibold uppercase tracking-[0.14em] text-on-surface-variant">Account summary</p>
        <div className="mt-4 space-y-3">
          {accountSummary.map((item) => (
            <div key={item.label} className="flex items-center justify-between gap-3 text-body font-regular">
              <span className="text-on-surface-variant">{item.label}</span>
              <strong className="text-right font-semibold text-on-surface">{item.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function AdminPersonalInfoCard({ admin }) {
  const [saved, setSaved] = useState(false);
  const form = useForm({ defaultValues: { name: admin.name, email: admin.email, phone: admin.phone || "" } });

  function onSubmit(values) {
    setSaved(true);
    toast.success("Admin profile saved");
    form.reset(values);
    window.setTimeout(() => setSaved(false), 1800);
  }

  return (
    <Card className="transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_26px_58px_-16px_rgb(0_63_177_/_0.12)] hover:shadow-primary/10 dark:hover:shadow-black/20">
      <div className="flex items-center gap-3"><UserRound className="size-5 text-primary" /><h2 className="font-heading text-headline-md font-semibold tracking-[-0.02em] text-on-surface">Personal info</h2></div>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 grid gap-4 md:grid-cols-2">
        <Field label="Name" name="name" form={form} autoComplete="name" />
        <Field label="Email" name="email" type="email" form={form} autoComplete="email" />
        <Field label="Phone" name="phone" form={form} autoComplete="tel" />
        <div className="flex items-center gap-3 border-t border-outline-variant/40 pt-5 md:col-span-2">
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
    <Card className="transition duration-200 ease-out hover:-translate-y-1 hover:shadow-[0_26px_58px_-16px_rgb(0_63_177_/_0.12)] hover:shadow-primary/10 dark:hover:shadow-black/20">
      <div className="flex items-center gap-3"><KeyRound className="size-5 text-primary" /><h2 className="font-heading text-headline-md font-semibold tracking-[-0.02em] text-on-surface">Security</h2></div>
      <p className="mt-2 text-body-md font-normal leading-6 text-on-surface-variant">Change the password used to sign in to the admin panel.</p>
      <form onSubmit={form.handleSubmit(onSubmit)} className="mt-5 grid gap-4 md:grid-cols-2">
        <PasswordField label="Current password" name="currentPassword" form={form} autoComplete="current-password" placeholder="Current password" show={showCurrentPassword} onToggle={() => setShowCurrentPassword((value) => !value)} />
        <PasswordField label="New password" name="newPassword" form={form} autoComplete="new-password" placeholder="New password" show={showNewPassword} onToggle={() => setShowNewPassword((value) => !value)} />
        <div className="flex items-center gap-3 border-t border-outline-variant/40 pt-5 md:col-span-2">
          <Button variant="outline" disabled={!form.formState.isDirty}>Update</Button>
          <SavedState show={saved} label="Saved" />
        </div>
      </form>
    </Card>
  );
}

function AvatarEditor({ initials, label }) {
  return (
    <button type="button" aria-label={label} className="group relative grid size-20 place-items-center overflow-hidden rounded-full bg-primary-fixed/60 font-heading text-headline-md font-semibold text-primary ring-1 ring-primary/10 transition duration-200 ease-out hover:scale-[1.03] focus-visible:ring-4 focus-visible:ring-primary/15 dark:bg-primary-container/20 dark:text-primary-fixed dark:ring-primary/20">
      <span>{initials}</span>
      <span className="absolute inset-0 grid place-items-center bg-inverse-surface/65 text-inverse-on-surface opacity-0 transition group-hover:opacity-100 group-focus-visible:opacity-100"><Camera className="size-5" /></span>
    </button>
  );
}

function Field({ label, name, type = "text", form, autoComplete }) {
  return <div className="space-y-2"><Label>{label}</Label><Input type={type} autoComplete={autoComplete} {...form.register(name)} /></div>;
}

function PasswordField({ label, name, form, autoComplete, placeholder, show, onToggle }) {
  return <div className="space-y-2"><Label>{label}</Label><div className="relative"><Input type={show ? "text" : "password"} autoComplete={autoComplete} placeholder={placeholder} className="pr-10" {...form.register(name)} /><button type="button" tabIndex={-1} onClick={onToggle} className="absolute inset-y-0 right-0 flex items-center pr-3 text-on-surface-variant transition hover:text-primary" aria-label={show ? "Hide password" : "Show password"}>{show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}</button></div></div>;
}

function SavedState({ show, label }) {
  if (!show) return null;
  return <span className="inline-flex items-center gap-1.5 text-body-md font-semibold text-tertiary"><Check className="size-4" />{label}</span>;
}
